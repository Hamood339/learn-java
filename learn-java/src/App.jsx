import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Bibliotheque from "./components/Bibliotheque";
import Reglages from "./components/Reglages";

const DEFAULT_SETTINGS = {
  reminder_start: "21:00",
  reminder_end: "00:00",
  active_days: [1, 2, 3, 4, 5, 6, 7],
  current_phase_id: 0,
  day_in_program: 1,
  objective: "",
};

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState("dashboard");
  const [viewHistory, setViewHistory] = useState([]);
  const [settings, setSettings] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2400);
  }, []);

  const navigateToView = useCallback((nextView) => {
    setView((currentView) => {
      if (currentView !== nextView) {
        setViewHistory((history) => [...history, currentView]);
      }
      return nextView;
    });
  }, []);

  const goBackToPreviousView = useCallback(() => {
    setViewHistory((history) => {
      if (!history.length) return history;
      const previousView = history[history.length - 1];
      setView(previousView);
      return history.slice(0, -1);
    });
  }, []);

  const refreshSettings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("settings").select("*").eq("user_id", user.id).maybeSingle();
    if (data) {
      setSettings(data);
    } else {
      // Premier lancement : on crée la ligne de réglages par défaut.
      const { data: created } = await supabase
        .from("settings")
        .insert({ user_id: user.id, ...DEFAULT_SETTINGS })
        .select()
        .single();
      setSettings(created || DEFAULT_SETTINGS);
    }
  }, [user]);

  useEffect(() => {
    if (user) refreshSettings();
  }, [user, refreshSettings]);

  if (loading) return <div style={{ padding: 40 }}>Chargement…</div>;
  if (!user) return <Login />;

  const viewProps = {
    settings,
    user,
    refreshSettings,
    onSettingsChange: refreshSettings,
    setView,
    toast,
    showToast: toast,
    onSaved: refreshSettings,
  };

  return (
    <div className="app">
      <Sidebar view={view} setView={navigateToView} settings={settings} />
      <main>
        {viewHistory.length > 0 && (
          <div className="view-back-bar">
            <button type="button" className="btn ghost" onClick={goBackToPreviousView}>
              ← Retour
            </button>
          </div>
        )}

        {view === "dashboard" && <Dashboard {...viewProps} />}
        {view === "bibliotheque" && <Bibliotheque />}
        {view === "reglages" && <Reglages {...viewProps} />}
      </main>
      <div className={"toast" + (toastMsg ? " show" : "")}>{toastMsg}</div>
    </div>
  );
}