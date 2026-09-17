import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PHASES, DAY_LABELS } from '../lib/phases'

export default function Reglages({ settings, onSaved, showToast }) {
  const [reminderStart, setReminderStart] = useState('21:00')
  const [reminderEnd, setReminderEnd] = useState('23:59')
  const [activeDays, setActiveDays] = useState([1, 2, 3, 4, 5, 6])
  const [currentPhaseId, setCurrentPhaseId] = useState(0)
  const [dayInProgram, setDayInProgram] = useState(1)
  const [objective, setObjective] = useState('')

  useEffect(() => {
    if (!settings) return
    setReminderStart(settings.reminder_start || '21:00')
    setReminderEnd(settings.reminder_end || '23:59')
    setActiveDays(settings.active_days || [1, 2, 3, 4, 5, 6])
    setCurrentPhaseId(settings.current_phase_id ?? 0)
    setDayInProgram(settings.day_in_program ?? 1)
    setObjective(settings.objective || '')
  }, [settings])

  function toggleDay(d) {
    setActiveDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  async function save() {
    const { error } = await supabase.from('settings').update({
      reminder_start: reminderStart,
      reminder_end: reminderEnd,
      active_days: activeDays.length ? activeDays : [1, 2, 3, 4, 5, 6],
      current_phase_id: Number(currentPhaseId),
      day_in_program: Number(dayInProgram) || 1,
      objective,
      updated_at: new Date().toISOString(),
    }).eq('id', 1)
    if (error) { showToast('Erreur : ' + error.message); return }
    showToast('Réglages enregistrés')
    onSaved()
  }

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Réglages</h1>
          <div className="sub">Rythme de travail et position actuelle dans le programme.</div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Fenêtre de session quotidienne</h2>
        <div className="row-2">
          <label className="field">Début
            <input type="time" value={reminderStart} onChange={(e) => setReminderStart(e.target.value)} />
          </label>
          <label className="field">Fin
            <input type="time" value={reminderEnd} onChange={(e) => setReminderEnd(e.target.value)} />
          </label>
        </div>
        <label className="field" style={{ marginTop: 12 }}>Jours actifs
          <div className="checks">
            {DAY_LABELS.map((l, i) => (
              <span key={i} className={`day-chip ${activeDays.includes(i + 1) ? 'on' : ''}`} onClick={() => toggleDay(i + 1)}>{l}</span>
            ))}
          </div>
        </label>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Position dans le programme</h2>
        <div className="row-2">
          <label className="field">Phase actuelle
            <select value={currentPhaseId} onChange={(e) => setCurrentPhaseId(e.target.value)}>
              {PHASES.map((p) => <option key={p.id} value={p.id}>{String(p.id).padStart(2, '0')} — {p.title}</option>)}
            </select>
          </label>
          <label className="field">Jour du programme (n°)
            <input type="number" min={1} value={dayInProgram} onChange={(e) => setDayInProgram(e.target.value)} />
          </label>
        </div>
        <label className="field" style={{ marginTop: 12 }}>Objectif de la session actuelle
          <input type="text" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ex. Comprendre Stack vs Heap" />
        </label>
      </div>

      <div className="btn-row" style={{ marginTop: 16 }}>
        <button className="btn primary" onClick={save}>Enregistrer les réglages</button>
      </div>
    </section>
  )
}
