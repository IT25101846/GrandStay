import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  Sparkles, 
  ArrowRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GrandStayLogo from './GrandStayLogo';
import ProfileModal from './ProfileModal';
import MagneticButton from './MagneticButton';

export default function Navbar({ isHero }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const cleanPath = location.pathname.replace(/\/$/, '') || '/';
  const isHeroPage = isHero !== undefined ? isHero : (cleanPath === '/' || cleanPath === '/venues' || cleanPath === '/index.html');

  useEffect(() => {
    const handleScroll = () => {
      if (isHeroPage) {
        // Stay in hero / on-video transparent mode across the video until scrolling past the end of the video banner
        const heroEl = document.querySelector('.hero-dark-banner');
        if (heroEl) {
          const rect = heroEl.getBoundingClientRect();
          setScrolled(rect.bottom <= 80);
        } else {
          setScrolled(window.scrollY >= ((window.innerHeight || 600) - 80));
        }
      } else {
        setScrolled(window.scrollY > 20);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHeroPage, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTransparent = isHeroPage && !scrolled;

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 select-none hover:scale-105 active:scale-95 ${
      isActive(path)
        ? isTransparent
          ? 'bg-gold-500/25 text-gold-300 border border-gold-500/40 shadow-sm'
          : 'bg-amber-600/15 dark:bg-gold-500/20 text-amber-900 dark:text-gold-300 border border-amber-600/30 dark:border-gold-500/40 shadow-sm'
        : isTransparent
          ? 'text-white/90 hover:text-gold-300 hover:bg-white/15 drop-shadow-sm'
          : 'text-stone-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-gold-300 hover:bg-stone-200/50 dark:hover:bg-white/5'
    }`;

  return (
    <>
      <header className={`${isHeroPage ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 transition-all duration-300 pointer-events-none`}>
        <div 
          className={`pointer-events-auto max-w-7xl mx-auto transition-all duration-300 rounded-full px-4 sm:px-7 flex items-center justify-between ${
          scrolled 
            ? 'bg-[#FDFDFB]/94 dark:bg-[#0E0E0D]/94 backdrop-blur-2xl border border-[#EBE7DF] dark:border-[#2A2825] py-2 sm:py-2.5 shadow-xl dark:shadow-glow-card' 
            : isTransparent
              ? isDark
                ? 'bg-[#0E0E0D]/60 backdrop-blur-xl border border-white/15 py-2.5 sm:py-3 shadow-2xl'
                : 'bg-white/15 hover:bg-white/20 backdrop-blur-xl border border-white/25 py-2.5 sm:py-3 shadow-2xl'
              : 'bg-[#FDFDFB]/88 dark:bg-[#0E0E0D]/88 backdrop-blur-xl border border-[#EBE7DF] dark:border-[#2A2825] py-2.5 sm:py-3 shadow-md dark:shadow-2xl'
        }`}
      >
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img
            src={isDark || (isHeroPage && !scrolled) ? '/images/grandstay-logo-dark.png' : '/images/grandstay-logo-light.png'}
            alt="GrandStay Events & Grand Banquets"
            className="h-8 sm:h-9.5 md:h-10 w-auto object-contain transition-all duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-wrap justify-center">
          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link to="/venues" className={navLinkClass('/venues')}>
            Venues
          </Link>

          {/* Customer Navigation */}
          {user && user.role === 'CUSTOMER' && (
            <>
              <Link to="/book" className={navLinkClass('/book')}>
                Reserve
              </Link>
              <Link to="/my-reservations" className={navLinkClass('/my-reservations')}>
                My Bookings
              </Link>
              <Link to="/feedback" className={navLinkClass('/feedback')}>
                Feedback
              </Link>
            </>
          )}

          {/* Reservation Officer Navigation */}
          {user && user.role === 'RESERVATION_OFFICER' && (
            <>
              <Link to="/dashboard/reservations" className={navLinkClass('/dashboard/reservations')}>
                Reservations
              </Link>
              <Link to="/dashboard/quotations" className={navLinkClass('/dashboard/quotations')}>
                Quotations
              </Link>
            </>
          )}

          {/* Finance Officer Navigation */}
          {user && user.role === 'FINANCE_OFFICER' && (
            <Link to="/dashboard/finance" className={navLinkClass('/dashboard/finance')}>
              Finance
            </Link>
          )}

          {/* Hotel Manager Navigation */}
          {user && user.role === 'HOTEL_MANAGER' && (
            <>
              <Link to="/dashboard/manager" className={navLinkClass('/dashboard/manager')}>
                Executive Analytics
              </Link>
              <Link to="/dashboard/feedback-inquiries" className={navLinkClass('/dashboard/feedback-inquiries')}>
                Reviews & Support
              </Link>
            </>
          )}

          {/* Hotel Admin Navigation */}
          {user && user.role === 'HOTEL_ADMIN' && (
            <>
              <Link to="/dashboard/admin" className={navLinkClass('/dashboard/admin')}>
                Spaces
              </Link>
              <Link to="/dashboard/packages" className={navLinkClass('/dashboard/packages')}>
                Packages
              </Link>
              <Link to="/dashboard/promotions" className={navLinkClass('/dashboard/promotions')}>
                Promotions
              </Link>
              <Link to="/dashboard/users" className={navLinkClass('/dashboard/users')}>
                Users
              </Link>
              <Link to="/dashboard/feedback-inquiries" className={navLinkClass('/dashboard/feedback-inquiries')}>
                Reviews
              </Link>
              <Link to="/dashboard/manager" className={navLinkClass('/dashboard/manager')}>
                Overview
              </Link>
            </>
          )}
        </nav>

        {/* Desktop User Actions + Luxury Theme Switch */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          
          {/* Theme Switcher Pill */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`relative flex items-center p-1 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-inner cursor-pointer ${
              isTransparent
                ? 'bg-white/10 border-white/20 text-gold-400 hover:border-gold-400/50'
                : 'bg-stone-200/80 dark:bg-dark-900 border-stone-300/80 dark:border-gold-500/30 text-stone-700 dark:text-gold-400 hover:border-amber-600/50 dark:hover:border-gold-400'
            }`}
            aria-label={isDark ? "Switch to Champagne Light Mode" : "Switch to Obsidian Dark Mode"}
            title={isDark ? "Switch to Champagne Light Mode" : "Switch to Obsidian Dark Mode"}
          >
            {/* Sun Option */}
            <motion.div 
              animate={{ rotate: !isDark ? 0 : 180, scale: !isDark ? 1 : 0.85 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
                !isDark 
                  ? 'bg-gradient-to-tr from-amber-600 to-yellow-500 text-white shadow-sm' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5 stroke-[2.2]" />
            </motion.div>
            {/* Moon Option */}
            <motion.div 
              animate={{ rotate: isDark ? 0 : -180, scale: isDark ? 1 : 0.85 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-tr from-amber-500 to-gold-400 text-dark-950 shadow-glow-gold' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Moon className="w-3.5 h-3.5 stroke-[2.2]" />
            </motion.div>
          </motion.button>

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden xl:block">
                <p className={`text-xs font-semibold leading-tight ${
                  isTransparent || isDark 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-[#241707]'
                }`}>
                  {user.name}
                </p>
                <p className={`text-[9px] uppercase tracking-wider font-mono font-medium ${
                  isTransparent || isDark 
                    ? 'text-gold-300' 
                    : 'text-[#8C5D0E]'
                }`}>
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className={`text-[11px] border px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-medium cursor-pointer ${
                  isTransparent
                    ? 'text-white/90 hover:text-gold-300 border-white/20 hover:border-gold-400/50 bg-white/10'
                    : 'text-stone-700 dark:text-gray-300 hover:text-amber-800 dark:hover:text-gold-400 border-stone-300 dark:border-dark-700 hover:border-gold-400/50 bg-stone-100/80 dark:bg-dark-900/50'
                }`}
                title="Account Settings & Profile"
              >
                <UserIcon className="w-3.5 h-3.5 text-gold-500" />
                <span>Profile</span>
              </button>
              <button 
                onClick={handleLogout} 
                className={`text-[11px] border px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer ${
                  isTransparent
                    ? 'text-white/90 hover:text-rose-400 border-white/20 hover:border-rose-400/50 bg-white/10'
                    : 'text-stone-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 border-stone-300 dark:border-dark-700 hover:border-rose-400/50 dark:hover:border-rose-900/50 bg-stone-100/80 dark:bg-dark-900/50'
                }`}
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MagneticButton strength={0.25}>
                <Link 
                  to="/login" 
                  className={`text-xs py-1.5 px-4 font-medium rounded-full transition-all ${
                    isTransparent
                      ? 'bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md shadow-sm'
                      : 'btn-glass'
                  }`}
                >
                  Sign In
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.3}>
                <Link to="/register" className="btn-primary text-xs py-1.5 px-4 rounded-full flex items-center gap-1.5">
                  <span>Book Event</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </MagneticButton>
            </div>
          )}
        </div>

        {/* Mobile Actions: Switcher + Hamburger */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          {/* Mobile Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 rounded-full border focus:outline-none transition-colors ${
              isTransparent
                ? 'border-white/20 bg-white/10 text-gold-400'
                : 'border-stone-300 dark:border-gold-500/30 bg-stone-100 dark:bg-dark-900 text-stone-700 dark:text-gold-400'
            }`}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-gold-400" />
            ) : (
              <Moon className={`w-4 h-4 ${isTransparent ? 'text-amber-300' : 'text-stone-700'}`} />
            )}
          </button>

          {/* Hamburger Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1.5 rounded-full transition-colors focus:outline-none ${
              isTransparent
                ? 'text-white hover:bg-white/10'
                : 'text-stone-700 dark:text-gray-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/5'
            }`}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto md:hidden max-w-lg mx-auto mt-2 rounded-2xl bg-[#FDFDFB]/98 dark:bg-[#0E0E0D]/95 backdrop-blur-2xl border border-[#EBE7DF] dark:border-[#2A2825] p-4 space-y-2 shadow-2xl"
          >
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
            >
              Home
            </Link>
            <Link 
              to="/venues" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/venues') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
            >
              Venues
            </Link>

            {user && user.role === 'CUSTOMER' && (
              <>
                <Link 
                  to="/book" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/book') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Reserve
                </Link>
                <Link 
                  to="/my-reservations" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/my-reservations') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  My Bookings
                </Link>
                <Link 
                  to="/feedback" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/feedback') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Feedback
                </Link>
              </>
            )}

            {/* Reservation Officer Navigation */}
            {user && user.role === 'RESERVATION_OFFICER' && (
              <>
                <Link 
                  to="/dashboard/reservations" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/dashboard/reservations') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Reservations
                </Link>
                <Link 
                  to="/dashboard/quotations" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/dashboard/quotations') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Quotations
                </Link>
              </>
            )}

            {/* Finance Officer Navigation */}
            {user && user.role === 'FINANCE_OFFICER' && (
              <Link 
                to="/dashboard/finance" 
                onClick={() => setMobileMenuOpen(false)} 
                className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/dashboard/finance') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
              >
                Finance
              </Link>
            )}

            {/* Hotel Manager Navigation */}
            {user && user.role === 'HOTEL_MANAGER' && (
              <>
                <Link 
                  to="/dashboard/manager" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/dashboard/manager') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Executive Analytics
                </Link>
                <Link 
                  to="/dashboard/feedback-inquiries" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/dashboard/feedback-inquiries') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Reviews & Support
                </Link>
              </>
            )}

            {/* Hotel Admin Navigation */}
            {user && user.role === 'HOTEL_ADMIN' && (
              <>
                <Link 
                  to="/dashboard/admin" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/dashboard/admin') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Spaces
                </Link>
                <Link 
                  to="/dashboard/packages" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/dashboard/packages') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Packages
                </Link>
                <Link 
                  to="/dashboard/promotions" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/dashboard/promotions') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Promotions
                </Link>
                <Link 
                  to="/dashboard/users" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/dashboard/users') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Users & Roles
                </Link>
                <Link 
                  to="/dashboard/feedback-inquiries" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/dashboard/feedback-inquiries') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Reviews
                </Link>
                <Link 
                  to="/dashboard/manager" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${isActive('/dashboard/manager') ? 'bg-amber-600/10 dark:bg-gold-500/15 text-amber-800 dark:text-gold-300' : 'text-stone-700 dark:text-gray-300'}`}
                >
                  Overview
                </Link>
              </>
            )}

            <div className="pt-3 border-t border-stone-200 dark:border-dark-800 flex flex-col gap-2">
              {user ? (
                <>
                  <button 
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setProfileOpen(true);
                    }} 
                    className="btn-outline w-full text-xs py-2 rounded-full flex items-center justify-center gap-1.5"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-gold-500" />
                    <span>Profile & Settings</span>
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="btn-outline w-full text-xs py-2 rounded-full flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-900/50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out ({user.name})</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="btn-outline w-full text-xs py-2 rounded-full text-center"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="btn-primary w-full text-xs py-2 rounded-full text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Book Event</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </header>

      {/* Luxury User Profile & Password Modal */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
