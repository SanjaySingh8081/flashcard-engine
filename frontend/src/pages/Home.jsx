import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { decksAPI } from '../api';
import api from '../api';

// ── Generation steps ─────────────────────────────────────────────────────────
const GEN_STEPS = [
  {
    label:    'Uploading PDF…',
    subtitle: 'Sending your file securely to the server.',
    target:   25,
  },
  {
    label:    'Extracting text…',
    subtitle: 'Reading and parsing content from your document.',
    target:   50,
  },
  {
    label:    'Analysing content with AI…',
    subtitle: 'Gemini AI is identifying key concepts and crafting your flashcards.',
    target:   85,
  },
  {
    label:    'Almost done…',
    subtitle: 'Saving your new deck and cards.',
    target:   100,
  },
];

function StepIcon({ step }) {
  if (step === 'Uploading PDF…') {
    return (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    );
  }
  if (step === 'Extracting text…') {
    return (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (step === 'Almost done…') {
    return (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  // Analysing content with AI…
  return <span className="text-2xl select-none">✨</span>;
}

function getMasteryStyle(pct) {
  if (pct >= 70) return { border: 'border-l-emerald-400', bar: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (pct >= 30) return { border: 'border-l-amber-400',   bar: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200' };
  return           { border: 'border-l-red-400',     bar: 'bg-red-400',     badge: 'bg-red-50 text-red-600 border-red-200' };
}

function StatCard({ label, value, icon, gradient, textColor, borderColor, shadowColor }) {
  return (
    <div className={`bg-white rounded-2xl border ${borderColor} p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradient} shadow-md ${shadowColor}`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="min-w-0">
        <div className={`text-2xl font-bold leading-none ${textColor}`}>{value}</div>
        <div className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wide whitespace-nowrap">{label}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate    = useNavigate();
  const fileInputRef = useRef(null);

  const [decks, setDecks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode]           = useState('empty');

  const [emptyForm, setEmptyForm] = useState({ title: '', description: '' });
  const [pdfForm, setPdfForm]     = useState({ title: '', description: '' });
  const [pdfFile, setPdfFile]     = useState(null);

  const [submitting, setSubmitting]     = useState(false);
  const [generateStep, setGenerateStep] = useState('');
  const [progressPct, setProgressPct]   = useState(0);
  const [formError, setFormError]       = useState('');

  // Lookup map: label → step config
  const STEP_MAP = Object.fromEntries(GEN_STEPS.map(s => [s.label, s]));

  // Smoothly animate progressPct toward the current step's target
  useEffect(() => {
    if (!generateStep || !STEP_MAP[generateStep]) return;
    const { target } = STEP_MAP[generateStep];
    const id = setInterval(() => {
      setProgressPct(prev => {
        if (prev >= target) return prev;
        return Math.min(prev + 0.6, target);
      });
    }, 30);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateStep]);

  // Auto-advance "Extracting text…" → "Analysing…" once progress reaches 50
  // (no real API event marks this boundary, so we drive it from the animation)
  useEffect(() => {
    if (generateStep === 'Extracting text…' && progressPct >= 50) {
      setGenerateStep('Analysing content with AI…');
    }
  }, [progressPct, generateStep]);

  useEffect(() => { fetchDecks(); }, []);

  const fetchDecks = async () => {
    try {
      const { data } = await decksAPI.getAll();
      setDecks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalCards    = decks.reduce((s, d) => s + d.cardCount, 0);
  const totalDue      = decks.reduce((s, d) => s + d.dueCount, 0);

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
    setFormError('');
    setMode('empty');
    setEmptyForm({ title: '', description: '' });
    setPdfForm({ title: '', description: '' });
    setPdfFile(null);
    setGenerateStep('');
    setProgressPct(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateEmpty = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const { data } = await decksAPI.create(emptyForm);
      setDecks([{ ...data, dueCount: 0, masteredCount: 0 }, ...decks]);
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create deck');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneratePDF = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!pdfFile)              { setFormError('Please select a PDF file'); return; }
    if (!pdfForm.title.trim()) { setFormError('Please enter a deck title'); return; }

    setSubmitting(true);
    setProgressPct(0);
    setGenerateStep('Uploading PDF…');
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('title', pdfForm.title.trim());
      if (pdfForm.description.trim()) formData.append('description', pdfForm.description.trim());

      const { data } = await api.post('/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000,
        // Advance to "Extracting text…" as soon as all bytes have left the browser
        onUploadProgress: (e) => {
          if (e.loaded >= e.total) {
            setGenerateStep('Extracting text…');
          }
        },
      });

      // API returned — show "Almost done…" and let it animate to 100%
      setGenerateStep('Almost done…');
      await new Promise(r => setTimeout(r, 1000));
      setDecks([{ ...data.deck, masteredCount: 0 }, ...decks]);
      closeModal();
      navigate(`/decks/${data.deck._id}`);
    } catch (err) {
      let msg;
      if (err.code === 'ECONNABORTED') {
        msg = 'Request timed out — try a shorter PDF';
      } else if (err.response?.status === 503) {
        msg = 'AI is busy right now — please try again';
      } else {
        msg = 'Something went wrong — please try again';
      }
      setGenerateStep('');
      setProgressPct(0);
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setFormError('Only PDF files are accepted'); e.target.value = ''; return; }
    setFormError('');
    setPdfFile(file);
    if (!pdfForm.title) setPdfForm((f) => ({ ...f, title: file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ') }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deck and all its cards?')) return;
    try {
      await decksAPI.delete(id);
      setDecks(decks.filter((d) => d._id !== id));
    } catch { alert('Failed to delete deck'); }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm mt-3">Loading your decks…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

      {/* ── Stats strip — 1 col on mobile, 3 on sm+ ── */}
      {decks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard label="Total Decks" value={decks.length} icon="📚"
            gradient="from-violet-500 to-purple-600" textColor="text-violet-600"
            borderColor="border-violet-100" shadowColor="shadow-violet-200" />
          <StatCard label="Total Cards" value={totalCards} icon="🃏"
            gradient="from-blue-500 to-sky-500" textColor="text-blue-600"
            borderColor="border-blue-100" shadowColor="shadow-blue-200" />
          <StatCard label="Due Today" value={totalDue} icon="⚡"
            gradient={totalDue > 0 ? 'from-orange-400 to-red-500' : 'from-emerald-400 to-teal-500'}
            textColor={totalDue > 0 ? 'text-orange-600' : 'text-emerald-600'}
            borderColor={totalDue > 0 ? 'border-orange-100' : 'border-emerald-100'}
            shadowColor={totalDue > 0 ? 'shadow-orange-200' : 'shadow-emerald-200'} />
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Decks</h1>
          <p className="text-gray-400 text-sm mt-0.5">{decks.length} deck{decks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-4 sm:px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5 min-h-[44px]"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Deck</span>
        </button>
      </div>

      {/* ── Empty state ── */}
      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 sm:py-28 text-center px-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-5 sm:mb-6 shadow-inner">
            <span className="text-3xl sm:text-4xl">📚</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No decks yet</h2>
          <p className="text-gray-400 text-sm mb-7 sm:mb-8 max-w-xs leading-relaxed">
            Create an empty deck and add cards manually, or upload a PDF and let AI generate cards for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-xs sm:max-w-none">
            <button onClick={() => { setMode('empty'); setShowModal(true); }}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold text-sm transition shadow-sm min-h-[44px]">
              Create Empty
            </button>
            <button onClick={() => { setMode('pdf'); setShowModal(true); }}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-200 min-h-[44px]">
              Generate from PDF ✨
            </button>
          </div>
        </div>
      ) : (
        /* ── Deck grid — 1 col mobile, 2 sm, 3 lg ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {decks.map((deck) => {
            const mastery = deck.cardCount > 0 ? Math.round(((deck.masteredCount || 0) / deck.cardCount) * 100) : 0;
            const ms = getMasteryStyle(mastery);

            return (
              <div
                key={deck._id}
                className={`group bg-white rounded-2xl border border-gray-100 border-l-4 ${ms.border} shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden`}
              >
                <div className="h-0.5 bg-gradient-to-r from-indigo-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  {/* Title row */}
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="font-bold text-gray-800 leading-snug flex-1 pr-2 text-base group-hover:text-indigo-700 transition-colors">
                      {deck.title}
                    </h2>
                    <button onClick={() => handleDelete(deck._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition flex-shrink-0 min-w-[32px]"
                      title="Delete deck">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {deck.description && (
                    <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed">{deck.description}</p>
                  )}

                  {/* Stats badges */}
                  <div className="flex items-center gap-2 flex-wrap mt-auto mb-3">
                    <span className="text-xs font-medium text-gray-400">
                      {deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}
                    </span>
                    {deck.cardCount > 0 && (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${ms.badge}`}>
                        <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {mastery}% mastery
                      </span>
                    )}
                    {deck.dueCount > 0 && (
                      <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-2 py-0.5 rounded-full font-semibold text-xs shadow-sm whitespace-nowrap">
                        {deck.dueCount} due
                      </span>
                    )}
                  </div>

                  {/* Mastery progress bar */}
                  {deck.cardCount > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Mastery</span>
                        <span className="text-[10px] font-bold text-gray-400">{mastery}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${ms.bar} rounded-full transition-all duration-700`} style={{ width: `${mastery}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Link to={`/decks/${deck._id}`}
                      className="flex-1 text-center bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl text-xs transition border border-gray-100 min-h-[40px] flex items-center justify-center">
                      Manage
                    </Link>
                    <Link to={`/decks/${deck._id}/study`}
                      className={`flex-1 text-center font-semibold py-2.5 rounded-xl text-xs transition min-h-[40px] flex items-center justify-center ${
                        deck.dueCount > 0
                          ? 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md shadow-indigo-200'
                          : 'bg-indigo-50 text-indigo-300 cursor-default'
                      }`}>
                      {deck.dueCount > 0 ? '▶ Study Now' : 'Up to date'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:px-4">
          {/* Sheet on mobile (slides from bottom), centered dialog on desktop */}
          {/* overflow-hidden clips to border-radius; scrolling lives on the inner div below */}
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md border border-gray-100 overflow-hidden max-h-[92vh]">

            {/* AI loading overlay — absolute on the non-scrolling outer div, covers the full modal */}
            {submitting && mode === 'pdf' && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 50,
                borderRadius: '16px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '1.5rem', padding: '2rem',
                background: 'rgba(10, 1, 24, 0.96)',
              }}>

                {/* Orbital ring + sparkle icon */}
                <div className="relative flex items-center justify-center">
                  {/* Outer slow-spin ring */}
                  <div className="absolute w-24 h-24 rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 70%, rgba(139,92,246,0.5) 100%)',
                      animation: 'spin 3s linear infinite',
                    }} />
                  {/* Inner counter-spin ring */}
                  <div className="absolute w-16 h-16 rounded-full"
                    style={{
                      background: 'conic-gradient(from 180deg, transparent 60%, rgba(167,139,250,0.4) 100%)',
                      animation: 'spin 2s linear infinite reverse',
                    }} />
                  {/* Centre icon — changes per step */}
                  <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
                      boxShadow: '0 0 0 1px rgba(139,92,246,0.3), 0 8px 32px rgba(109,40,217,0.45), 0 0 60px rgba(139,92,246,0.2)',
                    }}>
                    <StepIcon step={generateStep} />
                  </div>
                </div>

                {/* Step label + per-step subtitle */}
                <div className="text-center space-y-1.5">
                  <p className="font-bold text-base text-white tracking-tight">
                    {generateStep || 'Processing…'}
                  </p>
                  <p className="text-sm max-w-[240px] leading-relaxed" style={{ color: 'rgba(196,181,253,0.75)' }}>
                    {STEP_MAP[generateStep]?.subtitle ?? 'Working on it…'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-[260px] space-y-2">
                  {/* Track */}
                  <div className="relative h-3 rounded-full overflow-hidden"
                    style={{ background: 'rgba(139,92,246,0.25)' }}>
                    {/* Fill */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${progressPct}%`,
                        background: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
                        boxShadow: progressPct > 2
                          ? '0 0 12px rgba(139,92,246,0.7), 0 0 4px rgba(167,139,250,0.9)'
                          : 'none',
                      }}
                    />
                    {/* Shimmer sweep */}
                    {progressPct < 100 && (
                      <div
                        className="absolute inset-y-0 w-16 rounded-full opacity-40"
                        style={{
                          left: `${progressPct}%`,
                          transform: 'translateX(-100%)',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                          animation: 'shimmer 1.6s ease-in-out infinite',
                        }}
                      />
                    )}
                  </div>

                  {/* Labels row */}
                  <div className="flex justify-between items-center px-0.5">
                    <span className="text-[11px] font-semibold tracking-wide" style={{ color: '#a78bfa' }}>
                      {progressPct >= 100 ? 'Complete!' : 'Processing…'}
                    </span>
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: 'rgba(196,181,253,0.8)' }}>
                      {Math.round(progressPct)}%
                    </span>
                  </div>
                </div>

                {/* Bouncing dots */}
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                        boxShadow: '0 0 6px rgba(139,92,246,0.6)',
                        animationDelay: `${i * 0.18}s`,
                        animationDuration: '0.9s',
                      }}
                    />
                  ))}
                </div>

                {/* Keyframes injected once via a style tag */}
                <style>{`
                  @keyframes shimmer {
                    0%   { opacity: 0; transform: translateX(-200%); }
                    40%  { opacity: 0.5; }
                    100% { opacity: 0; transform: translateX(800%); }
                  }
                `}</style>
              </div>
            )}

            {/* Inner scrollable area — overlay above never scrolls with this */}
            <div className="overflow-y-auto max-h-[92vh]">

            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">New Deck</h2>
                <button onClick={closeModal} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition min-w-[36px]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Tab switcher */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5 sm:mb-6 p-1 gap-1">
                {[{ key: 'empty', label: 'Empty Deck' }, { key: 'pdf', label: '✨ From PDF' }].map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => { setMode(key); setFormError(''); }}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition min-h-[40px] ${mode === key ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {formError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl mb-4 sm:mb-5">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {formError}
                </div>
              )}

              {/* Empty form */}
              {mode === 'empty' && (
                <form onSubmit={handleCreateEmpty} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                    <input type="text" required autoFocus value={emptyForm.title} onChange={(e) => setEmptyForm({ ...emptyForm, title: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      placeholder="e.g. Spanish Vocabulary" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="font-normal text-gray-400">(optional)</span></label>
                    <textarea value={emptyForm.description} onChange={(e) => setEmptyForm({ ...emptyForm, description: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none"
                      rows={2} placeholder="What is this deck about?" />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm transition min-h-[44px]">Cancel</button>
                    <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white py-3 rounded-xl font-semibold text-sm transition shadow-md shadow-indigo-200 disabled:opacity-60 min-h-[44px]">
                      {submitting ? 'Creating…' : 'Create Deck'}
                    </button>
                  </div>
                </form>
              )}

              {/* PDF form */}
              {mode === 'pdf' && (
                <form onSubmit={handleGeneratePDF} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deck Title</label>
                    <input type="text" required autoFocus value={pdfForm.title} onChange={(e) => setPdfForm({ ...pdfForm, title: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      placeholder="e.g. Chapter 4 — Thermodynamics" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="font-normal text-gray-400">(optional)</span></label>
                    <input type="text" value={pdfForm.description} onChange={(e) => setPdfForm({ ...pdfForm, description: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      placeholder="Short description" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">PDF File</label>
                    <label htmlFor="pdf-upload"
                      className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl px-4 py-6 cursor-pointer transition ${pdfFile ? 'border-indigo-400 bg-indigo-50/60' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}>
                      {pdfFile ? (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                          </div>
                          <p className="text-sm font-semibold text-indigo-700 text-center break-all px-2">{pdfFile.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB · tap to change</p>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          </div>
                          <p className="text-sm font-medium text-gray-500">Tap to upload a PDF</p>
                          <p className="text-xs text-gray-400 mt-1">Max 20 MB · must have selectable text</p>
                        </>
                      )}
                      <input id="pdf-upload" ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700 leading-relaxed">
                    <span className="font-semibold">Gemini AI</span> will generate <span className="font-semibold">15–25 high-quality flashcards</span> covering key concepts, definitions, relationships and edge cases.
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={closeModal} disabled={submitting} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 min-h-[44px]">Cancel</button>
                    <button type="submit" disabled={submitting || !pdfFile} className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white py-3 rounded-xl font-semibold text-sm transition shadow-md shadow-indigo-200 disabled:opacity-60 flex items-center justify-center gap-2 min-h-[44px]">
                      {submitting ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />Generating…</>) : '✨ Generate Cards'}
                    </button>
                  </div>
                </form>
              )}
            </div>
            </div>{/* end inner scrollable */}
          </div>{/* end modal box */}
        </div>
      )}
    </div>
  );
}
