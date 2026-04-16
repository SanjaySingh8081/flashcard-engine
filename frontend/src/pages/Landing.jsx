import { Link } from 'react-router-dom';

const BG = '#0a0118';

/* ── Shared helpers ── */

function FloatingCard({ className, front, back, floatClass }) {
  return (
    <div className={`absolute pointer-events-none select-none ${floatClass} ${className}`}>
      <div className="w-48 rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Question</p>
          <p className="text-white text-xs font-medium leading-relaxed">{front}</p>
        </div>
        <div className="px-4 py-3" style={{ background: 'rgba(99,102,241,0.14)' }}>
          <p className="text-[10px] font-bold text-violet-300 uppercase tracking-widest mb-1">Answer</p>
          <p className="text-indigo-100 text-xs leading-relaxed">{back}</p>
        </div>
      </div>
    </div>
  );
}

function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl p-6 sm:p-8 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {children}
    </div>
  );
}

/* ── Section data ── */

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Upload Any PDF',
    desc: 'Drop any textbook, research paper, or lecture notes. Our system reads and extracts every key idea — even from dense academic content.',
    accent: 'from-blue-500 to-indigo-500',
    glow: 'rgba(99,102,241,0.25)',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'AI Generates Flashcards',
    desc: 'Gemini AI creates 15–25 expert-quality cards covering key concepts, definitions, cause-and-effect relationships, and edge cases.',
    accent: 'from-violet-500 to-purple-500',
    glow: 'rgba(139,92,246,0.25)',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Spaced Repetition',
    desc: 'The SM-2 algorithm schedules every card at the perfect moment — just before you forget it — so knowledge sticks permanently.',
    accent: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.20)',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Upload Your PDF',
    desc: 'Drag in any study material — textbooks, papers, slides, or handwritten notes scanned to PDF.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'AI Writes the Cards',
    desc: 'Gemini AI reads your content and generates cards that feel written by a great teacher — not scraped by a bot.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Study & Remember',
    desc: 'Flip cards, rate your recall, and let the spaced repetition engine schedule your next review automatically.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
];

const STATS = [
  { value: '10,000+', label: 'Cards Created' },
  { value: '95%',     label: 'Retention Rate' },
  { value: '3×',      label: 'Faster Learning' },
  { value: '100%',    label: 'Free Forever' },
];

/* ── Landing page ── */

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: BG, color: '#fff' }}>

      {/* ═══════════════════════════════════════════
          FIXED NAV
      ═══════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
        style={{
          background: 'rgba(10,1,24,0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">FlashCard</span>
          </div>

          {/* Nav links + CTA */}
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#features"
              className="hidden sm:block text-sm font-medium text-white/50 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/5">
              Features
            </a>
            <a href="#how-it-works"
              className="hidden sm:block text-sm font-medium text-white/50 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/5">
              How it works
            </a>
            <Link to="/login"
              className="text-sm font-semibold text-white/70 hover:text-white transition px-4 py-2 rounded-xl hover:bg-white/5">
              Sign In
            </Link>
            <Link to="/register"
              className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16" style={{ overflow: 'clip' }}>

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />

        {/* Orbs */}
        <div className="orb-pulse-1 absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="orb-pulse-2 absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(90px)' }} />
        <div className="orb-pulse-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6d28d9 0%, transparent 70%)', filter: 'blur(100px)' }} />

        {/* Floating cards — left side */}
        <FloatingCard
          className="top-[22%] left-[2%] hidden xl:block z-0"
          floatClass="float-a"
          front="What is photosynthesis?"
          back="Process by which plants convert sunlight into glucose using CO₂ and H₂O."
        />
        <FloatingCard
          className="bottom-[20%] left-[3%] hidden xl:block z-0"
          floatClass="float-c"
          front="Define Newton's 3rd Law"
          back="For every action there is an equal and opposite reaction."
        />

        {/* Floating cards — right side */}
        <FloatingCard
          className="top-[22%] right-[2%] hidden xl:block z-0"
          floatClass="float-b"
          front="What is Big O(n log n)?"
          back="Time complexity of efficient sorting algorithms like merge sort and quicksort."
        />
        <FloatingCard
          className="bottom-[20%] right-[3%] hidden xl:block z-0"
          floatClass="float-d"
          front="What is spaced repetition?"
          back="A learning technique scheduling reviews at growing intervals to maximise retention."
        />

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-20 sm:py-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Powered by Gemini AI
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
            Turn Any PDF Into<br />
            <span style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Smart Flashcards
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
            Upload your study material. AI generates expert-quality flashcards.<br className="hidden sm:block" />
            Master anything with spaced repetition — in a fraction of the time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 text-base min-h-[52px]">
              Get Started Free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white/70 hover:text-white font-semibold px-8 py-4 rounded-2xl transition min-h-[52px]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              See How It Works
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Social proof strip */}
          <div className="mt-12 flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-white/40">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/40">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Free forever
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/40">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Ready in 30 seconds
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════ */}
      <section id="features" className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Heading */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Why FlashCard</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Everything you need to<br />
              <span style={{
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>learn faster</span>
            </h2>
            <p className="text-white/40 mt-4 text-base sm:text-lg max-w-xl mx-auto">
              Stop highlighting. Stop re-reading. Start retaining.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map(({ icon, title, desc, accent, glow }) => (
              <GlassCard key={title} className="group hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center mb-5 shadow-lg`}
                  style={{ boxShadow: `0 8px 24px ${glow}` }}>
                  <span className="text-white">{icon}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 sm:py-32 relative" style={{ overflow: 'clip' }}>
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 65%)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">The Process</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Simple as 1 – 2 – 3</h2>
            <p className="text-white/40 mt-4 text-base sm:text-lg">From raw PDF to mastered knowledge in minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[22%] right-[22%] h-px"
              style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.0) 0%, rgba(99,102,241,0.4) 30%, rgba(139,92,246,0.4) 70%, rgba(139,92,246,0.0) 100%)' }} />

            {STEPS.map(({ num, title, desc, icon }, i) => (
              <div key={num} className="flex flex-col items-center text-center relative">
                {/* Step number bubble */}
                <div className="relative mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center z-10 relative"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                      border: '1px solid rgba(139,92,246,0.35)',
                      boxShadow: '0 0 24px rgba(99,102,241,0.2)',
                    }}>
                    <span className="text-violet-300">{icon}</span>
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-black text-indigo-400 bg-indigo-900/60 rounded-full w-5 h-5 flex items-center justify-center"
                    style={{ border: '1px solid rgba(99,102,241,0.4)' }}>
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 relative" style={{ overflow: 'clip' }}>
        {/* Divider glows */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-4xl sm:text-5xl font-extrabold mb-2" style={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {value}
                </div>
                <div className="text-sm font-semibold text-white/40 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 relative" style={{ overflow: 'clip' }}>
        {/* Background orb */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(109,40,217,0.18) 0%, transparent 65%)' }} />
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-300 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Join thousands of students
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-5">
            Ready to study<br />
            <span style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>smarter?</span>
          </h2>

          <p className="text-white/45 text-lg leading-relaxed mb-10">
            Upload your first PDF for free. No credit card, no setup — just better learning.
          </p>

          <Link to="/register"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 text-lg min-h-[56px]">
            Get Started Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <p className="mt-5 text-sm text-white/25">Free forever · No credit card · Ready in 30 seconds</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="py-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo + tagline */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm">FlashCard</span>
            <span className="text-white/20 text-sm hidden sm:block">— Study smarter, not harder.</span>
          </div>

          <p className="text-white/25 text-sm">© 2026 FlashCard. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
