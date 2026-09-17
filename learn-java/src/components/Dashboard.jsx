import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PHASES, phaseTitle } from '../lib/phases'
import { todayISO, isoWeekday, fmtDateLong, reminderWindowStatus } from '../lib/helpers'

export default function Dashboard({ settings, onSettingsChange, showToast }) {
  const [todayDoc, setTodayDoc] = useState(null)
  const [loadingToday, setLoadingToday] = useState(true)

  const loadToday = useCallback(async () => {
    const { data } = await supabase.from('days').select('*').eq('date', todayISO()).maybeSingle()
    setTodayDoc(data || null)
    setLoadingToday(false)
  }, [])

  useEffect(() => { loadToday() }, [loadToday])

  if (!settings) {
    return (
      <section className="view">
        <div className="view-header"><div><h1>Tableau de bord</h1></div></div>
        <p className="muted">Connexion à Supabase en cours, ou configuration manquante (vérifie ton fichier .env).</p>
      </section>
    )
  }

  const phase = PHASES.find((p) => p.id === settings.current_phase_id) || PHASES[0]
  const today = todayISO()
  const wd = isoWeekday(today)
  const isActiveDay = (settings.active_days || []).includes(wd)
  const winStatus = reminderWindowStatus(settings.reminder_start, settings.reminder_end)
  const doneToday = todayDoc && todayDoc.statut === 'fait'

  let banner = null
  if (!isActiveDay) {
    banner = { kind: 'done', title: 'Jour de repos', text: "Aujourd'hui n'est pas un jour de session prévu." }
  } else if (doneToday) {
    banner = { kind: 'done', title: 'Session terminée', text: 'Bien joué — la session du jour est marquée comme faite.' }
  } else if (winStatus === 'after') {
    banner = { kind: 'late', title: 'Fenêtre de session passée', text: `La fenêtre ${settings.reminder_start}–${settings.reminder_end} est passée et la session n'est pas faite.` }
  } else if (winStatus === 'in') {
    banner = { kind: 'due', title: "C'est le moment", text: `Tu es dans la fenêtre de session (${settings.reminder_start}–${settings.reminder_end}).` }
  } else {
    banner = { kind: 'due', title: 'Session prévue ce soir', text: `Rendez-vous entre ${settings.reminder_start} et ${settings.reminder_end}.` }
  }

  async function startSession() {
    const { error } = await supabase.from('days').upsert({
      date: today,
      phase_id: settings.current_phase_id,
      day_in_program: settings.day_in_program,
      statut: 'a_faire',
      note_contenu: '',
      cours_contenu: '',
      updated_at: new Date().toISOString(),
    })
    if (error) { showToast('Erreur : ' + error.message); return }
    showToast('Session démarrée')
    loadToday()
  }

  async function markDone() {
    const { error: e1 } = await supabase.from('days').update({ statut: 'fait', updated_at: new Date().toISOString() }).eq('date', today)
    const { error: e2 } = await supabase.from('settings').update({ day_in_program: (settings.day_in_program || 1) + 1 }).eq('id', 1)
    if (e1 || e2) { showToast('Erreur lors de la mise à jour'); return }
    showToast('Session marquée comme faite')
    loadToday()
    onSettingsChange()
  }

  async function reopenSession() {
    const { error } = await supabase.from('days').update({
      statut: 'a_faire',
      updated_at: new Date().toISOString(),
    }).eq('date', today)

    if (error) {
      showToast('Erreur : ' + error.message)
      return
    }

    showToast('Session réouverte : tu peux reprendre le cours')
    loadToday()
  }

  function downloadIcs() {
    const [h, m] = (settings.reminder_start || '21:00').split(':').map(Number)
    const days = settings.active_days && settings.active_days.length ? settings.active_days : [1,2,3,4,5,6]
    const byday = days.map((d) => ['MO','TU','WE','TH','FR','SA','SU'][d - 1]).join(',')
    const [eh, em] = (settings.reminder_end || '23:59').split(':').map(Number)
    const pad = (n) => String(n).padStart(2, '0')
    const now = new Date()
    const d = new Date()
    const dtStart = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(h) + pad(m) + '00'
    const dtEnd = d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(eh) + pad(em) + '00'
    const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Carnet Java//FR','CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:carnet-java-session-' + stamp + '@local',
      'DTSTAMP:' + stamp,
      'DTSTART:' + dtStart,
      'DTEND:' + dtEnd,
      'RRULE:FREQ=WEEKLY;BYDAY=' + byday,
      'SUMMARY:Session mentorat Java',
      'DESCRIPTION:Il est l\'heure de ta session Java du jour.',
      'END:VEVENT','END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'session-java.ics'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Rappel téléchargé')
  }

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Jour {settings.day_in_program || 1} — {phase.title}</h1>
          <div className="sub">{settings.objective ? 'Objectif en cours : ' + settings.objective : 'Phase ' + phase.id + ' du programme'}</div>
        </div>
        <div className="date-tag">{fmtDateLong(today)}</div>
      </div>

      <div className={`banner ${banner.kind}`}>
        <span className="dot" />
        <div className="txt"><strong>{banner.title}</strong>{banner.text}</div>
      </div>

      <div className="row-2">
        <div className="card">
          <h2 className="section-title">Session d'aujourd'hui</h2>
          {loadingToday ? (
            <p className="muted">Chargement…</p>
          ) : !todayDoc ? (
            <div className="stack">
              <p className="muted" style={{ margin: 0 }}>Aucune session enregistrée pour aujourd'hui.</p>
              <div className="btn-row"><button className="btn primary" onClick={startSession}>Commencer la session d'aujourd'hui</button></div>
            </div>
          ) : (
            <div className="stack">
              <p style={{ margin: 0 }}><strong>Phase {todayDoc.phase_id}</strong> — {phaseTitle(todayDoc.phase_id)}</p>
              <p className="muted" style={{ margin: 0 }}>Statut : {todayDoc.statut === 'fait' ? 'faite' : 'à faire'}</p>
              <div className="btn-row">
                {todayDoc.statut !== 'fait' ? (
                  <button className="btn amber" onClick={markDone}>Marquer comme faite</button>
                ) : (
                  <button className="btn ghost" onClick={reopenSession}>Revenir sur ce cours</button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="section-title">Rappel</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Un navigateur ne peut pas te notifier si l'onglet est fermé. Télécharge un rappel récurrent
            pour ton calendrier (aux jours et à l'heure définis dans les réglages).
          </p>
          <div className="btn-row"><button className="btn amber" onClick={downloadIcs}>Télécharger le rappel (.ics)</button></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Progression du programme</h2>
        <div className="timeline">
          {PHASES.map((p) => {
            const cls = p.id < settings.current_phase_id ? 'done' : p.id === settings.current_phase_id ? 'current' : ''
            const label = p.id < settings.current_phase_id ? 'fait' : p.id === settings.current_phase_id ? 'en cours' : 'à venir'
            return (
              <div className={`phase-row ${cls}`} key={p.id}>
                <span className="num">{String(p.id).padStart(2, '0')}</span>
                <span className="title">{p.title}</span>
                <span className="state">{label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
