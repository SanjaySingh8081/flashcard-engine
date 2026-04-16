import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { studyAPI } from '../api';

const BG = '#0a0118';

const RATINGS = [
  {
    label: 'Again', quality: 0, desc: 'Forgot it',
    gradient: 'from-red-500 to-rose-600',
    glow: 'rgba(239,68,68,0.35)',
    darkBg: 'rgba(239,68,68,0.10)',
    darkBorder: 'rgba(239,68,68,0.28)',
    darkText: '#f87171',
  },
  {
    label: 'Hard', quality: 3, desc: 'Struggled',
    gradient: 'from-orange-400 to-amber-500',
    glow: 'rgba(249,115,22,0.35)',
    darkBg: 'rgba(249,115,22,0.10)',
    darkBorder: 'rgba(249,115,22,0.28)',
    darkText: '#fb923c',
  },
  {
    label: 'Good', quality: 4, desc: 'Got it',
    gradient: 'from-emerald-400 to-green-500',
    glow: 'rgba(16,185,129,0.35)',
    darkBg: 'rgba(16,185,129,0.10)',
    darkBorder: 'rgba(16,185,129,0.28)',
    darkText: '#34d399',
  },
  {
    label: 'Easy', quality: 5, desc: 'Too easy',
    gradient: 'from-indigo-400 to-violet-500',
    glow: 'rgba(99,102,241,0.35)',
    darkBg: 'rgba(99,102,241,0.10)',
    darkBorder: 'rgba(99,102,241,0.28)',
    darkText: '#818cf8',
  },
];

/* ── Big animated progress ring for complete screen ── */
function BigProgressRing({ percent }) {
  const r    = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * (percent / 100);
  return (
    <svg className="w-36 h-36 sm:w-44 sm:h-44 -rotate-90" viewBox="0 0 128 128">
      {/* Track */}
      <circle cx="64" cy="64" r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
      {/* Glow ring (blurred duplicate) */}
      <circle cx="64" cy="64" r={r} fill="none"
        stroke="url(#ringGlow)" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)', filter: 'blur(4px)', opacity: 0.5 }} />
      {/* Crisp ring */}
      <circle cx="64" cy="64" r={r} fill="none"
        stroke="url(#ringCrisp)" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)' }} />
      <defs>
        <linearGradient id="ringGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="ringCrisp" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Shared dark background wrapper ── */
function DarkPage({ children, className = '' }) {
  return (
    <div
      className={`min-h-[calc(100vh-64px)] relative flex flex-col ${className}`}
      style={{ backgroundColor: BG, overflow: 'clip' }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }} />
      {/* Orbs */}
      <div className="orb-pulse-1 absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(90px)' }} />
      <div className="orb-pulse-2 absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(90px)' }} />
      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}

export default function Study() {
  const { id }         = useParams();
  const [searchParams] = useSearchParams();
  const requestedMode  = searchParams.get('mode');

  const [deck, setDeck]                 = useState(null);
  const [cards, setCards]               = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped]           = useState(false);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [done, setDone]                 = useState(false);
  const [results, setResults]           = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [autoSwitched, setAutoSwitched] = useState(false);
  const [activeMode, setActiveMode]     = useState(requestedMode === 'all' ? 'all' : 'due');

  useEffect(() => { fetchSession(); }, [id]);

  const fetchSession = async () => {
    try {
      const wantAll  = requestedMode === 'all';
      const { data } = await studyAPI.getCards(id, wantAll);
      setDeck(data.deck);

      if (!wantAll && data.cards.length === 0) {
        const allData = await studyAPI.getCards(id, true);
        setCards(allData.data.cards);
        setAutoSwitched(true);
        setActiveMode('all');
        if (allData.data.cards.length === 0) setDone(true);
      } else {
        setCards(data.cards);
        setActiveMode(wantAll ? 'all' : 'due');
        if (data.cards.length === 0) setDone(true);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRate = async (quality) => {
    if (submitting) return;
    setSubmitting(true);
    const card     = cards[currentIndex];
    const labelMap = { 0: 'again', 3: 'hard', 4: 'good', 5: 'easy' };
    setResults((prev) => ({ ...prev, [labelMap[quality]]: prev[labelMap[quality]] + 1 }));
    try { await studyAPI.submitReview(id, card._id, quality); }
    catch (err) { console.error(err); }
    if (currentIndex + 1 >= cards.length) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
    }
    setSubmitting(false);
  };

  // Reset all local state and re-fetch cards without a page navigation.
  // A <Link to={same-url}> doesn't remount the component, so useEffect never
  // re-fires — this function is the correct fix.
  const handleStudyAgain = async () => {
    setDone(false);
    setCurrentIndex(0);
    setFlipped(false);
    setResults({ again: 0, hard: 0, good: 0, easy: 0 });
    setAutoSwitched(false);
    setLoading(true);
    await fetchSession();
  };

  /* ══════════════════════════════════════
     LOADING
  ══════════════════════════════════════ */
  if (loading) {
    return (
      <DarkPage className="items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }} />
            <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin" />
          </div>
          <p className="text-white/40 text-sm font-medium">Preparing your session…</p>
        </div>
      </DarkPage>
    );
  }

  /* ══════════════════════════════════════
     EMPTY DECK
  ══════════════════════════════════════ */
  if (done && cards.length === 0) {
    return (
      <DarkPage className="items-center justify-center px-4">
        <div className="text-center max-w-sm w-full rounded-3xl p-8 sm:p-10"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No cards in this deck</h2>
          <p className="text-white/40 text-sm mb-7">Add some cards before you start studying.</p>
          <Link to={`/decks/${id}`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg min-h-[44px]"
            style={{ boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Deck
          </Link>
        </div>
      </DarkPage>
    );
  }

  /* ══════════════════════════════════════
     SESSION COMPLETE
  ══════════════════════════════════════ */
  if (done) {
    const total       = results.again + results.hard + results.good + results.easy;
    const correct     = results.good + results.easy;
    const successRate = total > 0 ? Math.round((correct / total) * 100) : 0;

    const scoreLabel =
      successRate >= 90 ? 'Outstanding!' :
      successRate >= 70 ? 'Great work!'  :
      successRate >= 50 ? 'Good effort!' : 'Keep going!';

    return (
      <DarkPage className="items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">

          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
              {activeMode === 'all' ? '📚 All Cards' : '⚡ Due Cards'}{autoSwitched ? ' · Auto' : ''}
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight" style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Session Complete!
            </h1>
            <p className="text-white/40 text-sm mt-2">
              {deck?.title} · {total} card{total !== 1 ? 's' : ''} reviewed
            </p>
          </div>

          {/* Score ring + stats */}
          <div className="rounded-3xl p-6 sm:p-8 mb-5 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

            {/* Big ring */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <BigProgressRing percent={successRate} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-4xl font-extrabold" style={{
                  background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {successRate}%
                </span>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Score</span>
              </div>
            </div>

            <p className="text-lg font-bold text-white mb-0.5">{scoreLabel}</p>
            <p className="text-sm text-white/40">
              {correct} of {total} card{total !== 1 ? 's' : ''} remembered correctly
            </p>
          </div>

          {/* Breakdown grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-5">
            {RATINGS.map(({ label, darkBg, darkBorder, darkText, quality }) => {
              const key   = { 0: 'again', 3: 'hard', 4: 'good', 5: 'easy' }[quality];
              const count = results[key];
              return (
                <div key={label} className="rounded-2xl p-3 sm:p-4 text-center"
                  style={{ background: darkBg, border: `1px solid ${darkBorder}` }}>
                  <div className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: darkText }}>
                    {count}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wide" style={{ color: darkText, opacity: 0.75 }}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStudyAgain}
              className="flex-1 flex items-center justify-center gap-2 font-semibold py-3.5 rounded-2xl transition min-h-[48px] text-sm"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Study Again
            </button>
            <Link
              to={`/decks/${id}`}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-3.5 rounded-2xl transition min-h-[48px] text-sm"
              style={{ boxShadow: '0 8px 24px rgba(99,102,241,0.30)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Deck
            </Link>
          </div>
        </div>
      </DarkPage>
    );
  }

  /* ══════════════════════════════════════
     STUDY SCREEN
  ══════════════════════════════════════ */
  const card     = cards[currentIndex];
  const progress = (currentIndex / cards.length) * 100;

  return (
    <DarkPage>
      <div className="max-w-2xl mx-auto w-full px-4 py-6 sm:py-8 flex flex-col flex-1">

        {/* ── Auto-switch dark glass banner ── */}
        {autoSwitched && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-5 text-xs font-semibold"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.28)',
            }}
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.2)' }}>
              <svg className="w-3.5 h-3.5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-indigo-300">
              No cards were due — showing all <span className="text-indigo-200 font-bold">{cards.length}</span> cards in this deck
            </span>
          </div>
        )}

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-5 min-w-0">
          <Link
            to={`/decks/${id}`}
            className="flex items-center gap-2 text-sm font-medium transition min-h-[44px] pr-3 truncate group"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="truncate">{deck?.title}</span>
          </Link>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mode pill */}
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
              style={activeMode === 'all'
                ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }
                : { background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)', color: '#fb923c' }
              }
            >
              {activeMode === 'all' ? 'All' : 'Due'}
            </span>
            {/* Counter */}
            <div className="flex items-center gap-1 text-sm font-bold"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              <span style={{
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {currentIndex + 1}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
              <span>{cards.length}</span>
            </div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="h-1.5 rounded-full mb-7 sm:mb-8 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
              boxShadow: '0 0 8px rgba(99,102,241,0.6)',
            }}
          />
        </div>

        {/* ── 3-D flip card ── */}
        <div
          className="flip-card-container mb-5 sm:mb-6 cursor-pointer select-none w-full flex-shrink-0"
          style={{ height: '260px' }}
          onClick={() => !flipped && setFlipped(true)}
        >
          <div className={`flip-card-inner ${flipped ? 'is-flipped' : ''}`}>

            {/* Front face — dark glass */}
            <div
              className="flip-card-face flex flex-col items-center justify-center p-6 sm:p-10 text-center overflow-y-auto"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.28)', color: '#a5b4fc' }}>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Question
              </span>
              <p className="text-base sm:text-lg font-semibold leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {card.front}
              </p>
              <p className="mt-5 text-[11px] flex items-center gap-1.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.18)' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                </svg>
                tap to reveal
              </p>
            </div>

            {/* Back face — gradient */}
            <div
              className="flip-card-face flip-card-back-face flex flex-col items-center justify-center p-6 sm:p-10 text-center overflow-y-auto"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)' }}
            >
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.7)' }}>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Answer
              </span>
              <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                {card.back}
              </p>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        {!flipped ? (
          <button
            onClick={() => setFlipped(true)}
            className="w-full font-bold text-base text-white py-4 rounded-2xl transition-all min-h-[52px]"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.35)'; e.currentTarget.style.transform = ''; }}
          >
            Reveal Answer
          </button>
        ) : (
          <div className="space-y-3 animate-fade-up">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              How well did you remember?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RATINGS.map(({ label, quality, gradient, glow, desc }) => (
                <button
                  key={label}
                  onClick={() => handleRate(quality)}
                  disabled={submitting}
                  className={`bg-gradient-to-br ${gradient} text-white rounded-2xl py-4 px-3 font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[64px]`}
                  style={{ boxShadow: `0 6px 20px ${glow}` }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 28px ${glow}`; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 6px 20px ${glow}`; }}
                >
                  <div className="font-bold">{label}</div>
                  <div className="text-xs opacity-70 mt-0.5 font-medium">{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </DarkPage>
  );
}
