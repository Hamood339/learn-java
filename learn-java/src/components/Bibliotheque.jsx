import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { PHASES } from "../data/curriculum";
import { mdLite } from "../lib/utils";

export default function Bibliotheque() {
  const [refs, setRefs] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingPhase, setEditingPhase] = useState(PHASES[0]?.id ?? 0);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await supabase
      .from("phase_reference")
      .select("phase_id, content");
    if (!error && data) {
      const map = {};
      data.forEach((r) => { map[r.phase_id] = r.content; });
      setRefs(map);
      setDraft(map[PHASES[0]?.id] || "");
    }
    setLoading(false);
  }

  function selectPhase(phaseId) {
    setEditingPhase(phaseId);
    setDraft(refs[phaseId] || "");
    setMessage("");
  }

  async function saveContent(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const { data, error } = await supabase
      .from("phase_reference")
      .upsert({ phase_id: editingPhase, content: draft, updated_at: new Date().toISOString() })
      .select("phase_id, content")
      .single();

    if (error) {
      setMessage("Impossible d'enregistrer : " + error.message);
    } else {
      setRefs((current) => ({ ...current, [data.phase_id]: data.content }));
      setMessage("Contenu enregistré");
    }
    setSaving(false);
  }

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Bibliothèque</h1>
          <div className="sub">
            Contenu de référence générique pour les 24 phases — un aperçu à consulter d'avance.
            Le vrai apprentissage personnalisé se fait en séance et atterrit dans "Cours archivés".
          </div>
        </div>
      </div>

      <form className="card library-editor" onSubmit={saveContent}>
        <div className="editor-heading">
          <div>
            <h2 className="section-title">Ajouter du contenu</h2>
            <p className="muted">Structure tes notes, ajoute des exemples Java et conserve tout dans Supabase.</p>
          </div>
          {message && <span className="save-status">{message}</span>}
        </div>
        <label className="field">
          Phase concernée
          <select value={editingPhase} onChange={(event) => selectPhase(Number(event.target.value))}>
            {PHASES.map((phase) => <option value={phase.id} key={phase.id}>Phase {phase.id} — {phase.title}</option>)}
          </select>
        </label>
        <label className="field">
          Contenu de la fiche
          <textarea
            className="library-textarea"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={'## Les tableaux\n\nExplique le concept ici.\n\n```java\nint[] nombres = {1, 2, 3};\nSystem.out.println(nombres[0]);\n```\n\n## Exemple\n- Un point important'}
            rows={14}
          />
        </label>
        <div className="editor-footer">
          <span className="editor-hint">Titres avec ##, listes avec -, code avec ```java</span>
          <button className="btn primary" type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer la fiche"}</button>
        </div>
      </form>

      {loading ? (
        <p className="muted">Chargement…</p>
      ) : Object.keys(refs).length === 0 ? (
        <div className="card"><p className="empty-note">
          Bibliothèque vide — exécute <code>supabase/seed_phase_reference.sql</code> dans l'éditeur SQL Supabase.
        </p></div>
      ) : (
        PHASES.map((p) => (
          <details className="card lib-entry" key={p.id}>
            <summary>
              <span className="lib-num">{String(p.id).padStart(2, "0")}</span>
              <span className="lib-title">{p.title}</span>
            </summary>
            {refs[p.id] ? (
              <div className="body" dangerouslySetInnerHTML={{ __html: mdLite(refs[p.id]) }} />
            ) : (
              <p className="empty-note">Pas encore de contenu pour cette phase.</p>
            )}
          </details>
        ))
      )}
    </section>
  );
}