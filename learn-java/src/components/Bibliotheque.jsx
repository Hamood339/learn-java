import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { PHASES } from "../data/curriculum";
import { mdLite } from "../lib/utils";

export default function Bibliotheque() {
  const [refs, setRefs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await supabase
      .from("phase_reference")
      .select("phase_id, content");
    if (!error && data) {
      const map = {};
      data.forEach((r) => { map[r.phase_id] = r.content; });
      setRefs(map);
    }
    setLoading(false);
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