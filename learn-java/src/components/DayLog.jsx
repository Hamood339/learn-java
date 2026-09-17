import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { PHASES, phaseTitle } from "../data/curriculum";
import { todayISO, mdLite } from "../lib/utils";

/**
 * field: "cours_contenu" | "note_contenu"
 * title / subtitle / placeholder / helpText: textes affichés
 * renderAsMarkdown: true pour le cours (rendu ## et -), false pour les notes (texte brut)
 */
export default function DayLog({ field, title, subtitle, placeholder, helpText, renderAsMarkdown, settings, toast }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(todayISO());
  const [phaseId, setPhaseId] = useState(settings?.current_phase_id ?? 0);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    const { data } = await supabase
      .from("days")
      .select("*")
      .eq("user_id", user.id)
      .not(field, "is", null)
      .neq(field, "")
      .order("date", { ascending: false })
      .limit(200);
    setEntries(data || []);
  }

  async function save() {
    if (!content.trim()) { toast("Contenu vide"); return; }
    setSaving(true);
    const { data: existing } = await supabase
      .from("days")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("days")
        .update({ [field]: content, phase_id: phaseId, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("date", date));
    } else {
      ({ error } = await supabase.from("days").insert({
        user_id: user.id,
        date,
        phase_id: phaseId,
        day_in_program: settings?.day_in_program,
        statut: "a_faire",
        [field]: content,
      }));
    }
    setSaving(false);
    if (error) { toast("Erreur : " + error.message); return; }
    toast("Enregistré");
    setContent("");
    load();
  }

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>{title}</h1>
          <div className="sub">{subtitle}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">{helpText.formTitle}</h2>
        {helpText.note && <p className="muted" style={{ marginTop: 0 }}>{helpText.note}</p>}
        <div className="stack">
          <div className="row-2">
            <label className="field">
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="field">
              Phase associée
              <select value={phaseId} onChange={(e) => setPhaseId(Number(e.target.value))}>
                {PHASES.map((p) => (
                  <option key={p.id} value={p.id}>{String(p.id).padStart(2, "0")} — {p.title}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            Contenu
            <textarea rows={8} placeholder={placeholder} value={content} onChange={(e) => setContent(e.target.value)} />
          </label>
          <div className="btn-row">
            <button className="btn primary" onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Historique</h2>
        {entries.length === 0 ? (
          <p className="empty-note">Rien pour l'instant.</p>
        ) : (
          entries.map((n) => (
            <div className="note-entry" key={n.id}>
              <div className="meta">
                <span className="d">{n.date}</span>
                <span className="p">Phase {n.phase_id} — {phaseTitle(n.phase_id)}</span>
              </div>
              {renderAsMarkdown ? (
                <div className="body" dangerouslySetInnerHTML={{ __html: mdLite(n[field]) }} />
              ) : (
                <div className="body" style={{ whiteSpace: "pre-wrap" }}>{n[field]}</div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
