import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PHASES } from '../lib/phases'

export default function Projets({ settings, showToast }) {
  const [list, setList] = useState([])
  const [titre, setTitre] = useState('')
  const [lien, setLien] = useState('')
  const [phaseId, setPhaseId] = useState(settings?.current_phase_id ?? 0)
  const [description, setDescription] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('projects').select('*').order('date_ajout', { ascending: false }).limit(300)
    if (!error) setList(data || [])
  }, [])

  useEffect(() => { load() }, [load])

  async function add() {
    if (!titre.trim() || !lien.trim()) { showToast('Titre et lien requis'); return }
    const { error } = await supabase.from('projects').insert({
      titre, lien, phase_id: Number(phaseId), description, date_ajout: new Date().toISOString(),
    })
    if (error) { showToast('Erreur : ' + error.message); return }
    setTitre(''); setLien(''); setDescription('')
    showToast('Projet ajouté')
    load()
  }

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Projets pratiques</h1>
          <div className="sub">Tes dépôts GitHub liés à chaque phase du programme.</div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Ajouter un projet</h2>
        <div className="stack">
          <div className="row-2">
            <label className="field">Titre
              <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex. Gestion bancaire — Phase 19" />
            </label>
            <label className="field">Phase associée
              <select value={phaseId} onChange={(e) => setPhaseId(e.target.value)}>
                {PHASES.map((p) => <option key={p.id} value={p.id}>{String(p.id).padStart(2, '0')} — {p.title}</option>)}
              </select>
            </label>
          </div>
          <label className="field">Lien GitHub
            <input type="url" value={lien} onChange={(e) => setLien(e.target.value)} placeholder="https://github.com/..." />
          </label>
          <label className="field">Description (optionnel)
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ce que ce projet met en pratique…" />
          </label>
          <div className="btn-row"><button className="btn primary" onClick={add}>Ajouter le projet</button></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Mes projets</h2>
        {!list.length ? (
          <p className="empty-note">Aucun projet ajouté pour l'instant.</p>
        ) : (
          list.map((p) => (
            <div className="project-item" key={p.id}>
              <div className="info">
                <a href={p.lien} target="_blank" rel="noopener noreferrer">{p.titre}</a>
                {p.description && <div className="desc">{p.description}</div>}
              </div>
              <span className="tag">Phase {p.phase_id}</span>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
