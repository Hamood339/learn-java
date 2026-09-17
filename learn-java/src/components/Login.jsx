import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error.message);
  }

  return (
    <div className="login-shell">
      <div className="login-orbit" aria-hidden="true" />
      <form onSubmit={handleSubmit} className="card login-card">
        <div className="login-brand">
          <img src="/java%20logo.webp" alt="Logo Learn-Java" />
          <span>LEARN-JAVA</span>
        </div>
        <h1>Prêt à progresser ?</h1>
        <p className="login-intro">Retrouve ton parcours Java et continue ta session là où tu l’as laissée.</p>
        <div className="stack">
          <label className="field">
            Email
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </label>
          <label className="field">
            Mot de passe
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p style={{ color: "var(--rust)", fontSize: 13, margin: 0 }}>{error}</p>}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
          <p className="muted" style={{ marginTop: 4 }}>
            Compte créé depuis le dashboard Supabase (Authentication → Users → Add user).
          </p>
        </div>
      </form>
    </div>
  );
}
