import { useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { PHASES } from './lib/phases'
import { todayISO, fmtDateLong } from './lib/helpers'
import Dashboard from './components/Dashboard'
import Cours from './components/Cours'
import Notes from './components/Notes'
import Projets from './components/Projets'
import Quiz from './components/Quiz'
import Reglages from './components/Reglages'

const NAV = [
  { id: 'dashboard', label: 'Tableau de bord', glyph: '01' },
  { id: 'cours', label: 'Cours archivés', glyph: '02' },
  { id: 'notes', label: 'Notes personnelles', glyph: '03' },
  { id: 'projets', label: 'Projets', glyph: '04' },
  { id: 'quiz', label: 'Quiz', glyph: '05' },
  { id: 'reglages', label: 'Réglages', glyph: '06' },
]

export default function App() {
  const [view, setView] = useState('dashboard')
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)

  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    setToastShow(true)
    setTimeout(() => setToastShow(false), 2400)
  }, [])

  const loadSettings = useCallback(async () => {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single()
    if (error) {
      console.error(error)
      showToast('Erreur de connexion à Supabase — vérifie ton .env')
    } else {
      setSettings(data)
    }
    setLoading(false)
  }, [showToast])

  useEffect(() => { loadSettings() }, [loadSettings])

  const currentPhase = settings ? PHASES.find((p) => p.id === settings.current_phase_id) || PHASES[0] : PHASES[0]

  return (
    <div className="app">
      <aside className="rail">
        <div className="rail-brand">
          <span className="mark">// </span>
          <span className="name">Carnet Java</span>
        </div>
        <div className="rail-status">
          {loading ? 'chargement…' : settings ? `Phase ${settings.current_phase_id} · jour ${settings.day_in_program}` : 'hors ligne'}
        </div>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={view === n.id ? 'active' : ''} onClick={() => setView(n.id)}>
              <span className="glyph">{n.glyph}</span>{n.label}
            </button>
          ))}
        </nav>
        <div className="rail-foot">mentorat.java · v1</div>
      </aside>

      <main>
        {view === 'dashboard' && (
          <Dashboard settings={settings} onSettingsChange={loadSettings} showToast={showToast} />
        )}
        {view === 'cours' && <Cours settings={settings} showToast={showToast} />}
        {view === 'notes' && <Notes settings={settings} showToast={showToast} />}
        {view === 'projets' && <Projets settings={settings} showToast={showToast} />}
        {view === 'quiz' && <Quiz settings={settings} showToast={showToast} />}
        {view === 'reglages' && <Reglages settings={settings} onSaved={loadSettings} showToast={showToast} />}
      </main>

      <div className={`toast ${toastShow ? 'show' : ''}`}>{toastMsg}</div>
    </div>
  )
}

export { todayISO, fmtDateLong }
