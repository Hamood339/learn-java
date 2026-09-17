import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ITEMS = [
  { view: "dashboard", glyph: "01", label: "Tableau de bord" },
  { view: "bibliotheque", glyph: "02", label: "Bibliothèque" },
  { view: "cours", glyph: "03", label: "Cours archivés" },
  { view: "notes", glyph: "04", label: "Notes personnelles" },
  { view: "projets", glyph: "05", label: "Projets" },
  { view: "quiz", glyph: "06", label: "Quiz" },
  { view: "reglages", glyph: "07", label: "Réglages" },
];

export default function Sidebar({ view, setView, settings }) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const statusLabel = settings ? `Phase ${settings.current_phase_id} · jour ${settings.day_in_program}` : "…";

  function choose(v) {
    setView(v);
    setOpen(false);
  }

  return (
    <>
      {/* Barre visible uniquement sur mobile */}
      <div className="rail-mobile-bar">
        <div className="rail-brand">
          <img className="brand-logo" src="/java%20logo.webp" alt="Learn-Java" />
          <span className="name">Learn-Java</span>
        </div>
        <button
          className="hamburger-btn"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && <div className="rail-overlay" onClick={() => setOpen(false)} />}

      <aside className={"rail" + (open ? " mobile-open" : "")}>
        <div className="rail-brand">
          <img className="brand-logo" src="/java%20logo.webp" alt="Learn-Java" />
          <span className="name">Learn-Java</span>
        </div>
        <div className="rail-status">{statusLabel}</div>
        <nav>
          {ITEMS.map((it) => (
            <button
              key={it.view}
              className={view === it.view ? "active" : ""}
              onClick={() => choose(it.view)}
            >
              <span className="glyph">{it.glyph}</span>
              {it.label}
            </button>
          ))}
        </nav>
        <div className="rail-foot">
          learn-java · v1
          <div style={{ marginTop: 10 }}>
            <button
              onClick={signOut}
              style={{
                all: "unset",
                cursor: "pointer",
                color: "rgba(238,246,240,0.55)",
                fontSize: 11.5,
                textDecoration: "underline",
              }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}