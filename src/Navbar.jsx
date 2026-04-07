import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { useState } from 'react';
import { useToast } from './ToastContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toast = useToast();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    logout();
    toast({ message: 'Logged out successfully', type: 'success' });
    navigate('/login');
  };

  const employeeLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { to: '/apply', label: 'Apply Leave', icon: '+' },
    { to: '/history', label: 'My Leaves', icon: '☰' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-0 flex items-center justify-between h-16 sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-sm">L</span>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">Leave<span className="text-indigo-400">MS</span></span>
      </Link>

      {user && (
        <div className="flex items-center gap-1">
          {/* Nav Links */}
          {user.role === 'admin' ? (
            <Link to="/admin"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition mx-1 ${isActive('/admin') ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              🛡️ Admin Panel
            </Link>
          ) : (
            employeeLinks.map(({ to, label, icon }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition mx-0.5 ${isActive(to) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <span className="mr-1.5 opacity-70">{icon}</span>{label}
              </Link>
            ))
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-gray-700 mx-3" />

          {/* Interactive User Menu */}
          <div className="relative ml-2">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-xl px-3 py-2 transition-all duration-200 group relative"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-white text-xs font-semibold leading-tight whitespace-nowrap">{user.name}</p>
                <p className="text-indigo-400 text-xs font-medium">{user.role}</p>
              </div>
              <svg className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 animate-dropdown-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 px-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm dark:text-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100 rounded-xl transition font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                  <button 
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm dark:text-gray-200 dark:hover:bg-gray-800 hover:bg-gray-100 rounded-xl transition font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
