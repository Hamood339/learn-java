import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PHASES, phaseTitle } from '../lib/phases'
import { todayISO } from '../lib/helpers'
import MarkdownLite from './MarkdownLite'

export default function Cours({ settings, showToast }) {
  const [list, setList] = useState([])
  const [date, setDate] = useState(todayISO())
  const [phaseId, setPhaseId] = useState(settings?.current_phase_id ?? 0)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('days')
      .select('*')
      .neq('cours_contenu', '')
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
      cours_contenu: content,
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
          <h1>Cours archivés</h1>
          <div className="sub">Le contenu structuré de chaque séance, archivé automatiquement à la fin du cours dans le chat.</div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Ajouter / corriger manuellement</h2>
        <p className="muted" style={{ marginTop: 0 }}>Normalement rempli automatiquement en fin de séance — utile seulement pour corriger ou compléter.</p>
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
          <label className="field">Contenu du cours (markdown simple : ## pour un titre, - pour une liste)
            <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} placeholder={'## Concept\n...\n\n## Pourquoi\n...'} />
          </label>
          <div className="btn-row">
            <button className="btn primary" onClick={save} disabled={saving}>Enregistrer</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Historique des cours</h2>
        {!list.length ? (
          <p className="empty-note">Aucun cours archivé pour l'instant.</p>
        ) : (
          list.map((n) => (
            <div className="note-entry" key={n.date}>
              <div className="meta">
                <span className="d">{n.date}</span>
                <span className="p">Phase {n.phase_id} — {phaseTitle(n.phase_id)}</span>
              </div>
              <MarkdownLite text={n.cours_contenu} />
            </div>
          ))
        )}
      </div>
    </section>
  )
}
