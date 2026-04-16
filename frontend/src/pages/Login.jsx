import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* Floating mock flashcard shown in the background */
function FloatingCard({ className, front, back, floatClass }) {
  return (
    <div className={`absolute pointer-events-none select-none ${floatClass} ${className}`}>
      <div className="w-44 rounded-2xl overflow-hidden shadow-2xl shadow-black/40"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Question</p>
          <p className="text-white text-xs font-medium leading-relaxed">{front}</p>
        </div>
        <div className="px-4 py-3" style={{ background: 'rgba(99,102,241,0.15)' }}>
          <p className="text-[10px] font-bold text-violet-300 uppercase tracking-widest mb-1">Answer</p>
          <p className="text-indigo-100 text-xs leading-relaxed">{back}</p>
        </div>
      </div>
    </div>
  );
}

const BG_COLOR = '#0a0118';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: BG_COLOR, overflow: 'clip' }}
    >
      {/* ── Dot grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(99,102,241,0.18) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* ── Orbs ── */}
      <div
        className="orb-pulse-1 absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="orb-pulse-2 absolute -bottom-32 -right-16 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(72px)' }}
      />
      <div
        className="orb-pulse-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6d28d9 0%, transparent 70%)', filter: 'blur(90px)' }}
      />

      {/* ── Floating flashcards (desktop only, z-0 so they sit behind form) ── */}
      <FloatingCard
        className="top-[12%] left-[2%] hidden xl:block z-0"
        floatClass="float-a"
        front="What is spaced repetition?"
        back="A learning technique that schedules reviews at increasing intervals."
      />
      <FloatingCard
        className="bottom-[15%] left-[2%] hidden xl:block z-0"
        floatClass="float-b"
        front="Define photosynthesis"
        back="The process plants use to convert light into glucose."
      />
      <FloatingCard
        className="top-[12%] right-[2%] hidden xl:block z-0"
        floatClass="float-c"
        front="What is Newton's 2nd Law?"
        back="Force equals mass times acceleration: F = ma."
      />
      <FloatingCard
        className="bottom-[15%] right-[2%] hidden xl:block z-0"
        floatClass="float-d"
        front="What is a monad?"
        back="A design pattern for handling side effects in functional programming."
      />

      {/* ── Form card ── */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">FlashCard</span>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/50 text-sm mt-1.5">Sign in to continue your learning streak</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 text-sm p-3.5 rounded-2xl mb-5"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1.5">Email address</label>
            <input
              type="email" required autoFocus
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition min-h-[48px]"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-1.5">Password</label>
            <input
              type="password" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition min-h-[48px]"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[48px] text-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-white/40">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
            Create one free →
          </Link>
        </p>
      </div>
    </div>
  );
}
