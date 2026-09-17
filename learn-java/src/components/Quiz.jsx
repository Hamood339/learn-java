import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PHASES, phaseTitle } from '../lib/phases'
import Pagination from './Pagination'

const HISTORY_PAGE_SIZE = 10

export default function Quiz({ settings, showToast }) {
  const [phaseId, setPhaseId] = useState(settings?.current_phase_id ?? 0)
  const [quiz, setQuiz] = useState({ questions: [], history: [] })
  const [showAddForm, setShowAddForm] = useState(false)
  const [qText, setQText] = useState('')
  const [qChoices, setQChoices] = useState('')
  const [qCorrect, setQCorrect] = useState(1)
  const [qExplain, setQExplain] = useState('')
  const [runner, setRunner] = useState(null) // { answers: {idx: choiceIdx}, finished, score }
  const [historyPage, setHistoryPage] = useState(0)

  useEffect(() => {
    if (settings) setPhaseId(settings.current_phase_id)
  }, [settings])

  const load = useCallback(async (pid) => {
    const { data, error } = await supabase.from('quizzes').select('*').eq('phase_id', pid).maybeSingle()
    if (error) { console.error(error); return }
    setQuiz(data ? { questions: data.questions || [], history: data.history || [] } : { questions: [], history: [] })
    setRunner(null)
    setHistoryPage(0)
  }, [])

  useEffect(() => { load(phaseId) }, [phaseId, load])

  async function saveQuestion() {
    const choices = qChoices.split('\n').map((s) => s.trim()).filter(Boolean)
    const correctIndex = Number(qCorrect) - 1
    if (!qText.trim() || choices.length < 2 || correctIndex < 0 || correctIndex >= choices.length) {
      showToast('Vérifie la question, les choix et le numéro correct')
      return
    }
    const newQuestion = { id: 'q' + Date.now(), q: qText, choices, correctIndex, explication: qExplain }
    const questions = [...quiz.questions, newQuestion]
    const { error } = await supabase.from('quizzes').upsert({ phase_id: phaseId, questions, history: quiz.history })
    if (error) { showToast('Erreur : ' + error.message); return }
    setQuiz({ ...quiz, questions })
    setQText(''); setQChoices(''); setQExplain(''); setQCorrect(1)
    setShowAddForm(false)
    showToast('Question ajoutée')
  }

  function startQuiz() {
    setRunner({ answers: {}, finished: false, score: 0 })
  }

  const historyEntries = quiz.history.slice().reverse()
  const visibleHistory = historyEntries.slice(historyPage * HISTORY_PAGE_SIZE, historyPage * HISTORY_PAGE_SIZE + HISTORY_PAGE_SIZE)

  function answer(qIdx, cIdx) {
    if (!runner || runner.answers[qIdx] !== undefined) return
    const next = { ...runner.answers, [qIdx]: cIdx }
    const finished = Object.keys(next).length === quiz.questions.length
    let score = 0
    Object.entries(next).forEach(([idx, choice]) => {
      if (quiz.questions[idx].correctIndex === choice) score++
    })
    setRunner({ answers: next, finished, score })
  }

  async function finishQuiz() {
    const entry = { date: new Date().toISOString(), score: runner.score, total: quiz.questions.length }
    const history = [...quiz.history, entry]
    const { error } = await supabase.from('quizzes').upsert({ phase_id: phaseId, questions: quiz.questions, history })
    if (error) { showToast('Erreur : ' + error.message); return }
    setQuiz({ ...quiz, history })
    setRunner({ ...runner, done: true })
  }

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Quiz de compréhension</h1>
          <div className="sub">Ajoute des questions au fil des notions vues, puis teste-toi.</div>
        </div>
      </div>

      <div className="card">
        <div className="row-2">
          <label className="field">Phase
            <select value={phaseId} onChange={(e) => setPhaseId(Number(e.target.value))}>
              {PHASES.map((p) => <option key={p.id} value={p.id}>{String(p.id).padStart(2, '0')} — {p.title}</option>)}
            </select>
          </label>
          <div className="field">
            <span>&nbsp;</span>
            <div className="btn-row">
              <button className="btn primary" onClick={startQuiz} disabled={!quiz.questions.length}>
                {quiz.questions.length ? `Lancer le quiz (${quiz.questions.length} questions)` : 'Aucune question — ajoutes-en'}
              </button>
              <button className="btn" onClick={() => setShowAddForm((s) => !s)}>+ Ajouter une question</button>
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title">Nouvelle question</h2>
          <div className="stack">
            <label className="field">Question
              <textarea rows={2} value={qText} onChange={(e) => setQText(e.target.value)} />
            </label>
            <label className="field">Choix (un par ligne, 2 à 5)
              <textarea rows={4} value={qChoices} onChange={(e) => setQChoices(e.target.value)} placeholder={'Choix A\nChoix B\nChoix C'} />
            </label>
            <label className="field">Numéro du bon choix (1 = premier)
              <input type="number" min={1} value={qCorrect} onChange={(e) => setQCorrect(e.target.value)} style={{ maxWidth: 100 }} />
            </label>
            <label className="field">Explication (affichée après réponse)
              <textarea rows={2} value={qExplain} onChange={(e) => setQExplain(e.target.value)} />
            </label>
            <div className="btn-row">
              <button className="btn primary" onClick={saveQuestion}>Enregistrer la question</button>
              <button className="btn ghost" onClick={() => setShowAddForm(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Historique des scores — {phaseTitle(phaseId)}</h2>
        {!quiz.history.length ? (
          <p className="muted">Aucun quiz passé pour cette phase.</p>
        ) : (
          visibleHistory.map((h, i) => (
            <div className="history-row" key={i}>
              <span>{new Date(h.date).toLocaleDateString('fr-FR')}</span>
              <span>{h.score}/{h.total}</span>
            </div>
          ))
        )}
        <Pagination
          page={historyPage}
          hasNext={(historyPage + 1) * HISTORY_PAGE_SIZE < historyEntries.length}
          onPrevious={() => setHistoryPage((current) => Math.max(0, current - 1))}
          onNext={() => setHistoryPage((current) => current + 1)}
          label="scores"
        />
      </div>

      {runner && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="section-title">Quiz — {phaseTitle(phaseId)}</h2>
          {runner.done ? (
            <span className="score-pill">Score : {runner.score} / {quiz.questions.length}</span>
          ) : (
            <>
              {quiz.questions.map((qu, idx) => {
                const chosen = runner.answers[idx]
                const answered = chosen !== undefined
                return (
                  <div className="quiz-q" key={qu.id}>
                    <div className="qtext">{idx + 1}. {qu.q}</div>
                    {qu.choices.map((c, ci) => {
                      let cls = 'quiz-choice'
                      if (answered && ci === qu.correctIndex) cls += ' correct'
                      else if (answered && ci === chosen) cls += ' incorrect'
                      return (
                        <div key={ci} className={cls} onClick={() => answer(idx, ci)}>{c}</div>
                      )
                    })}
                    {answered && qu.explication && <div className="quiz-explain">{qu.explication}</div>}
                  </div>
                )
              })}
              <div className="btn-row" style={{ marginTop: 10 }}>
                <button className="btn primary" onClick={finishQuiz} disabled={!runner.finished}>Terminer le quiz</button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
