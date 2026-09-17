import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PHASES, phaseTitle } from '../lib/phases'
import { todayISO } from '../lib/helpers'

export default function Notes({ settings, showToast }) {
  const [list, setList] = useState([])
  const [date, setDate] = useState(todayISO())
  const [phaseId, setPhaseId] = useState(settings?.current_phase_id ?? 0)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('days')
      .select('*')
      .neq('note_contenu', '')
      .order('date', { ascending: false })
      .limit(200)
    if (!error) setList(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  async function save() {
    if (!content.trim()) { showToast('Contenu vide'); return }
    setSaving(true)
    const { error } = await supabase.from('days').upsert({
      date,
      phase_id: Number(phaseId),
      day_in_program: settings?.day_in_program ?? 1,
      note_contenu: content,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'date', ignoreDuplicates: false })
    setSaving(false)
    if (error) { showToast('Erreur : ' + error.message); return }
    showToast('Enregistré')
    setContent('')
    load()
  }

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Notes personnelles</h1>
          <div className="sub">Ce que tu as compris avec tes propres mots, séance par séance — distinct du cours archivé.</div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Nouvelle entrée / entrée du jour</h2>
        <div className="stack">
          <div className="row-2">
            <label className="field">Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="field">Phase associée
              <select value={phaseId} onChange={(e) => setPhaseId(e.target.value)}>
                {PHASES.map((p) => <option key={p.id} value={p.id}>{String(p.id).padStart(2, '0')} — {p.title}</option>)}
              </select>
            </label>
          </div>
          <label className="field">Contenu
            <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Ce que j'ai compris aujourd'hui, avec mes propres mots…" />
          </label>
          <div className="btn-row">
            <button className="btn primary" onClick={save} disabled={saving}>Enregistrer la note</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Historique</h2>
        {!list.length ? (
          <p className="empty-note">Aucune note pour l'instant.</p>
        ) : (
          list.map((n) => (
            <div className="note-entry" key={n.date}>
              <div className="meta">
                <span className="d">{n.date}</span>
                <span className="p">Phase {n.phase_id} — {phaseTitle(n.phase_id)}</span>
              </div>
              <div className="body">{n.note_contenu}</div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
