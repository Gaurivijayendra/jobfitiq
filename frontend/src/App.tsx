import { useEffect, useMemo, useState } from 'react'
import { TextPanel } from './components/TextPanel'
import { ResultsPanel } from './components/ResultsPanel'
import { SuggestionPanel } from './components/SuggestionPanel'
import { ImproveSuggestionsPanel } from './components/ImproveSuggestionsPanel'
import { ThemeToggle } from './components/ThemeToggle'
import { useMatchAnalysis } from './hooks/useMatchAnalysis'
import type { HighlightTerm } from './lib/highlight'
import {
  JD_MAX_CHARS,
  JD_MIN_CHARS,
  RESUME_MAX_CHARS,
  RESUME_MIN_CHARS,
} from './types/api'

function App() {
  const [resume, setResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const { result, status, errorMessage, retry } = useMatchAnalysis(resume, jobDescription)
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
  const [showImprovePanel, setShowImprovePanel] = useState(false)

  useEffect(() => {
    if (selectedKeyword && !result?.missingKeywords.includes(selectedKeyword)) {
      setSelectedKeyword(null)
    }
  }, [result, selectedKeyword])

  useEffect(() => {
    if (showImprovePanel && !result?.missingKeywords.length) {
      setShowImprovePanel(false)
    }
  }, [result, showImprovePanel])

  function openKeywordSuggestion(keyword: string) {
    setShowImprovePanel(false)
    setSelectedKeyword(keyword)
  }

  function openImprovePanel() {
    setSelectedKeyword(null)
    setShowImprovePanel(true)
  }

  const resumeHighlightTerms = useMemo<HighlightTerm[]>(
    () => (result ? result.matchedKeywords.map((term) => ({ term, state: 'match' as const })) : []),
    [result],
  )
  const jdHighlightTerms = useMemo<HighlightTerm[]>(
    () =>
      result
        ? [
            ...result.matchedKeywords.map((term) => ({ term, state: 'match' as const })),
            ...result.missingKeywords.map((term) => ({ term, state: 'gap' as const })),
          ]
        : [],
    [result],
  )

  const canAnalyze = resume.length >= RESUME_MIN_CHARS && jobDescription.length >= JD_MIN_CHARS

  const idleMessage = (() => {
    const resumeEmpty = resume.length === 0
    const jdEmpty = jobDescription.length === 0
    if (resumeEmpty && jdEmpty) {
      return 'Paste your resume and a job description to see how well they match.'
    }
    if (resumeEmpty) return 'Paste your resume to see how well it matches this job description.'
    if (jdEmpty) return 'Paste a job description to see how well your resume matches it.'
    return 'Add a bit more detail. Analysis needs at least 50 characters in both fields.'
  })()

  return (
    <div className="min-h-screen bg-bg">
      <header className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-deep px-6 py-6 shadow-lg">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.12),transparent_60%)]"
        />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/15" />
              <div className="h-4 w-4 rounded-full border-[3px] border-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">JobFitIQ</h1>
              <p className="text-xs text-white/70">Resume and job description match analysis</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextPanel
            label="Your resume"
            value={resume}
            onChange={setResume}
            placeholder="Paste your resume text here…"
            minChars={RESUME_MIN_CHARS}
            maxChars={RESUME_MAX_CHARS}
            highlightTerms={resumeHighlightTerms}
          />
          <TextPanel
            label="Job description"
            value={jobDescription}
            onChange={setJobDescription}
            placeholder="Paste the job description here…"
            minChars={JD_MIN_CHARS}
            maxChars={JD_MAX_CHARS}
            highlightTerms={jdHighlightTerms}
          />
        </div>

        <p className="mt-5 text-xs text-ink/50">
          {canAnalyze
            ? 'Analysis updates automatically as you type.'
            : 'Add both a resume and a job description to see a match score.'}
        </p>

        <div className="mt-8">
          <ResultsPanel
            result={result}
            status={status}
            errorMessage={errorMessage}
            idleMessage={idleMessage}
            onRetry={retry}
            onSelectMissingKeyword={openKeywordSuggestion}
            onShowImprovements={openImprovePanel}
          />
        </div>

        {selectedKeyword && (
          <div className="mt-6">
            <SuggestionPanel
              keyword={selectedKeyword}
              resume={resume}
              jobDescription={jobDescription}
              onClose={() => setSelectedKeyword(null)}
            />
          </div>
        )}

        {showImprovePanel && result && result.missingKeywords.length > 0 && (
          <div className="mt-6">
            <ImproveSuggestionsPanel
              missingKeywords={result.missingKeywords}
              resume={resume}
              jobDescription={jobDescription}
              currentScore={result.score}
              onClose={() => setShowImprovePanel(false)}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
