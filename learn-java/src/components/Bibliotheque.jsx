import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { mdLite } from "../lib/utils";

const DEFAULT_RUBRIQUES = [
  {
    id: "java",
    label: "Java",
    type: "Langage",
    logo: "/java%20logo.webp",
    description: "Programmation orientée objet, JVM, Spring et backend Java.",
    content: "## Java\n\n- Langage orienté objet et fortement typé\n- Exécuté par la JVM\n- Très utilisé pour les APIs, les applications d’entreprise et les services backend\n\n```java\npublic class Main {\n  public static void main(String[] args) {\n    String message = \"Bonjour Java\";\n    System.out.println(message);\n  }\n}\n```",
  },
  {
    id: "javascript",
    label: "JavaScript",
    type: "Langage",
    description: "Frontend, backend, tooling et interactivité web.",
    content: "## JavaScript\n\n- Langage principal du web\n- Exécute dans le navigateur et sur Node.js\n- Très utile pour les interfaces et les outils de build\n\n```javascript\nconst message = 'Bonjour JavaScript';\nconsole.log(message);\n```",
  },
  {
    id: "python",
    label: "Python",
    type: "Langage",
    description: "Scripting, data, automatisation et IA.",
    content: "## Python\n\n- Très lisible et rapide à prototyper\n- Très utilisé en data science et automatisation\n- Idéal pour les scripts et APIs légères\n\n```python\nprint(\"Bonjour Python\")\n```",
  },
  {
    id: "flutter",
    label: "Flutter",
    type: "Framework",
    description: "Applications mobiles cross-platform avec Dart.",
    content: "## Flutter\n\n- UI cross-platform unique\n- Très adapté à la création d’applications mobiles\n- Permet de partager une base de code entre iOS et Android\n\n```dart\nvoid main() {\n  print('Hello Flutter');\n}\n```",
  },
  {
    id: "react",
    label: "React",
    type: "Framework",
    description: "Bibliothèque JavaScript pour construire des interfaces modernes.",
    content: "## React\n\n- Composition de composants\n- Gestion d’état via hooks\n- Très utilisé pour les interfaces web de niveau pro\n\n```jsx\nexport default function App() {\n  return <h1>Bonjour React</h1>;\n}\n```",
  },
  {
    id: "nodejs",
    label: "Node.js",
    type: "Runtime",
    description: "Backend JavaScript avec un écosystème très large.",
    content: "## Node.js\n\n- Exécute du JavaScript côté serveur\n- Très utile pour les API HTTP\n- Parfait pour les outils CLI et les services backend\n\n```js\nconsole.log('Node.js prêt');\n```",
  },
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "rubrique";
}

export default function Bibliotheque() {
  const [rubriques, setRubriques] = useState(DEFAULT_RUBRIQUES);
  const [currentRubriqueId, setCurrentRubriqueId] = useState(DEFAULT_RUBRIQUES[0].id);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState({
    label: "",
    type: "Langage",
    description: "",
    content: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dev-library-rubriques");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          setRubriques(parsed);
          setCurrentRubriqueId(parsed[0].id);
        }
      }
    } catch (error) {
      console.warn("Impossible de charger la bibliothèque locale", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dev-library-rubriques", JSON.stringify(rubriques));
  }, [rubriques]);

  const currentRubrique = rubriques.find((rubrique) => rubrique.id === currentRubriqueId) || rubriques[0] || DEFAULT_RUBRIQUES[0];
  const currentIndex = rubriques.findIndex((rubrique) => rubrique.id === currentRubriqueId);
  const previousRubrique = currentIndex > 0 ? rubriques[currentIndex - 1] : null;
  const nextRubrique = currentIndex < rubriques.length - 1 ? rubriques[currentIndex + 1] : null;

  function openCard(rubriqueId) {
    setSelectedCard(rubriqueId);
    setCurrentRubriqueId(rubriqueId);
    setShowEditor(false);
  }

  function goBackToGrid() {
    setSelectedCard(null);
  }

  function onSubmit(event) {
    event.preventDefault();

    const label = draft.label.trim();
    if (!label) {
      setMessage("Le nom de la rubrique est obligatoire.");
      return;
    }

    const newRubrique = {
      id: slugify(label),
      label,
      type: draft.type || "Langage",
      description: draft.description.trim() || "Ressources et astuces à découvrir.",
      content: draft.content.trim() || "## " + label + "\n\nAjoute ici le contenu de référence.",
    };

    setRubriques((current) => {
      const exists = current.some((rubrique) => rubrique.id === newRubrique.id);
      if (exists) {
        return current.map((rubrique) => (rubrique.id === newRubrique.id ? { ...rubrique, ...newRubrique } : rubrique));
      }
      return [...current, newRubrique];
    });

    setCurrentRubriqueId(newRubrique.id);
    setDraft({ label: "", type: "Langage", description: "", content: "" });
    setShowEditor(false);
    setMessage("Rubrique ajoutée");
  }

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Bibliothèque dev</h1>
          <div className="sub">
            Langages, frameworks, outils et sujets techniques à consulter selon ton parcours de développement.
          </div>
        </div>
      </div>

      {showEditor && (
        <form className="card library-editor" onSubmit={onSubmit}>
          <div className="editor-heading">
            <div>
              <h2 className="section-title">Ajouter une rubrique</h2>
              <p className="muted">Crée une nouvelle catégorie de contenu : langage, framework, outil ou stack.</p>
            </div>
            {message && <span className="save-status">{message}</span>}
          </div>

          <label className="field">
            Nom de la rubrique
            <input
              type="text"
              value={draft.label}
              onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
              placeholder="Ex. TypeScript, Spring, Docker, React Native..."
            />
          </label>

          <label className="field">
            Type
            <select
              value={draft.type}
              onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
            >
              <option value="Langage">Langage</option>
              <option value="Framework">Framework</option>
              <option value="Runtime">Runtime</option>
              <option value="Base de données">Base de données</option>
              <option value="Outil">Outil</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Mobile">Mobile</option>
              <option value="Cloud">Cloud</option>
            </select>
          </label>

          <label className="field">
            Description courte
            <input
              type="text"
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder="En une phrase, décris la rubrique."
            />
          </label>

          <label className="field">
            Contenu de référence
            <textarea
              className="library-textarea"
              value={draft.content}
              onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
              placeholder={'## TypeScript\n\n- Typage statique\n- Meilleur support pour les gros projets\n\n```ts\nconst message: string = "Bonjour";\n```'}
              rows={12}
            />
          </label>

          <div className="editor-footer">
            <button type="button" className="btn ghost" onClick={() => setShowEditor(false)}>
              Fermer
            </button>
            <button className="btn primary" type="submit">
              Ajouter la rubrique
            </button>
          </div>
        </form>
      )}

      {!selectedCard ? (
        <>
          <div className="card" style={{ padding: 18, marginBottom: 16 }}>
            <div className="editor-heading">
              <div>
                <h2 className="section-title">Bibliothèque</h2>
                <p className="muted">Clique sur une carte pour ouvrir le contenu d’un langage ou d’un framework.</p>
              </div>
              <button type="button" className="btn primary" onClick={() => setShowEditor((value) => !value)}>
                + Ajouter une rubrique
              </button>
            </div>
          </div>

          <div className="library-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
            {rubriques.map((rubrique) => (
              <button
                key={rubrique.id}
                type="button"
                className="card"
                onClick={() => openCard(rubrique.id)}
                style={{
                  textAlign: "left",
                  padding: 18,
                  cursor: "pointer",
                  background: currentRubriqueId === rubrique.id ? "rgba(107, 130, 255, 0.08)" : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--muted, #5b6475)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {rubrique.type}
                  </div>
                  {rubrique.logo && (
                    <img
                      src={rubrique.logo}
                      alt={rubrique.label}
                      style={{ width: 38, height: 38, objectFit: "contain", borderRadius: 10, background: "rgba(255,255,255,0.08)" }}
                    />
                  )}
                </div>
                <h3 style={{ margin: "10px 0 8px", fontSize: 22 }}>{rubrique.label}</h3>
                <p style={{ margin: 0, color: "var(--ink-soft, #4a5568)" }}>{rubrique.description}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="card lib-entry" style={{ padding: 18 }}>
          <div className="editor-heading" style={{ marginBottom: 12 }}>
            <div>
              <span className="lib-num">{String(currentIndex + 1).padStart(2, "0")}</span>
              <span className="lib-title" style={{ marginLeft: 10 }}>{currentRubrique.label}</span>
              <span className="muted" style={{ marginLeft: 10 }}>{currentRubrique.type}</span>
            </div>
            <button type="button" className="btn ghost" onClick={goBackToGrid}>
              ← Retour
            </button>
          </div>

          <p className="muted" style={{ marginTop: 0 }}>{currentRubrique.description}</p>

          {currentRubrique.content ? (
            <div className="body" dangerouslySetInnerHTML={{ __html: mdLite(currentRubrique.content) }} />
          ) : (
            <p className="empty-note">Aucune ressource pour cette rubrique.</p>
          )}

          <div className="pagination" style={{ marginTop: 20, justifyContent: "space-between" }}>
            <button
              type="button"
              className="btn ghost"
              onClick={() => previousRubrique && openCard(previousRubrique.id)}
              disabled={!previousRubrique}
            >
              ← Précédent
            </button>

            <span>
              Page {currentIndex + 1} / {rubriques.length}
            </span>

            <button
              type="button"
              className="btn ghost"
              onClick={() => nextRubrique && openCard(nextRubrique.id)}
              disabled={!nextRubrique}
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}