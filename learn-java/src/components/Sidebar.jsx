import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  IconArchive,
  IconBook,
  IconClose,
  IconDashboard,
  IconFolder,
  IconGear,
  IconMenu,
  IconMoon,
  IconNote,
  IconQuiz,
  IconSun,
} from "./icons";

const ITEMS = [
  { view: "dashboard", label: "Tableau de bord", Icon: IconDashboard },
  { view: "bibliotheque", label: "Bibliothèque", Icon: IconBook },
  { view: "cours", label: "Cours archivés", Icon: IconArchive },
  { view: "notes", label: "Notes", Icon: IconNote },
  { view: "projets", label: "Projets", Icon: IconFolder },
  { view: "quiz", label: "Quiz", Icon: IconQuiz },
  { view: "reglages", label: "Réglages", Icon: IconGear },
];

const THEME_KEY = "codelearn-theme";

function getInitialTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark" || theme === "light") root.dataset.theme = theme;
  else delete root.dataset.theme;
}

export default function Sidebar({ view, setView, settings }) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const statusLabel = settings ? "Programme Java" : "…";

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // stockage indisponible (mode privé) : préférence simplement non persistée
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => {
      if (current === "dark") return "light";
      if (current === "light") return "dark";
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "light" : "dark";
    });
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);

  function choose(v) {
    setView(v);
    setOpen(false);
  }

  return (
    <>
      {/* Barre visible uniquement sur mobile */}
      <div className="rail-mobile-bar">
        <div className="rail-brand">
          <img className="brand-logo" src="/logoapp.png" alt="CodeLearn" />
          <span className="name">CodeLearn</span>
        </div>
        <button
          className="hamburger-btn"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconClose width={20} height={20} /> : <IconMenu width={20} height={20} />}
        </button>
      </div>

      {open && <div className="rail-overlay" onClick={() => setOpen(false)} />}

      <aside className={"rail" + (open ? " mobile-open" : "")}>
        <div className="rail-brand">
          <img className="brand-logo" src="/logoapp.png" alt="CodeLearn" />
          <span className="name">CodeLearn</span>
        </div>
        <div className="rail-status">{statusLabel}</div>
        <nav>
          {ITEMS.map(({ view: v, label, Icon }) => (
            <button key={v} className={view === v ? "active" : ""} onClick={() => choose(v)}>
              <span className="glyph"><Icon width={16} height={16} /></span>
              {label}
            </button>
          ))}
        </nav>
        <div className="rail-foot">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
          >
            {isDark ? <IconSun width={15} height={15} /> : <IconMoon width={15} height={15} />}
            <span>{isDark ? "Thème clair" : "Thème sombre"}</span>
          </button>
          <button type="button" className="signout-link" onClick={signOut}>
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
