import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm shadow-indigo-100/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-lg font-bold gradient-text tracking-tight">FlashCard</span>
        </Link>

        {/* Right side */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Mobile: avatar only */}
            <div className="flex sm:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white text-xs font-bold leading-none">{initials}</span>
            </div>

            {/* Desktop: avatar + name badge */}
            <div className="hidden sm:flex items-center gap-2.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-100 rounded-xl px-3 py-1.5 transition cursor-default">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{user.name}</span>
            </div>

            {/* Sign out — icon only on mobile, icon + text on desktop */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:h-auto sm:px-3 sm:py-1.5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition"
              title="Sign out"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
