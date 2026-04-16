import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DeckDetail from './pages/DeckDetail';
import Study from './pages/Study';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }
  return user ? <Navigate to="/" /> : children;
}

/**
 * Root route:
 *  - Authenticated  → show the dashboard (Home)
 *  - Unauthenticated → show the landing page (Landing)
 * The landing page has its own full-screen dark layout with its own nav,
 * so we skip the app-level Navbar for it.
 */
function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }
  return user ? <Home /> : <Landing />;
}

// Routes where the global Navbar is suppressed
// (these pages handle their own header / logo)
const NO_NAVBAR_ROUTES = ['/login', '/register'];

function AppRoutes() {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();

  // Also hide navbar on "/" when the user is NOT logged in (Landing page shown)
  const hideNavbar =
    NO_NAVBAR_ROUTES.includes(pathname) ||
    (!loading && !user && pathname === '/');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/"               element={<RootRoute />} />
        <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"       element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/decks/:id"      element={<PrivateRoute><DeckDetail /></PrivateRoute>} />
        <Route path="/decks/:id/study" element={<PrivateRoute><Study /></PrivateRoute>} />
        <Route path="*"               element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
