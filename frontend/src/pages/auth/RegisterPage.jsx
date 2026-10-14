import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import GrandStayLogo from '../../components/GrandStayLogo';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register(formData);
      login(res.data);
      navigate('/venues');
    } catch (err) {
      setError(err.response?.data?.email || err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] dark:bg-dark flex items-center justify-center px-4 relative transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-full border border-stone-300 dark:border-gold-500/30 bg-white dark:bg-dark-900 text-stone-700 dark:text-gold-400 hover:border-amber-600/50 shadow-sm transition-all"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center group">
            <GrandStayLogo className="w-14 h-14 mb-4" size={32} />
            <h1 className="font-serif text-4xl text-stone-900 dark:text-white tracking-[0.15em] group-hover:text-amber-800 dark:group-hover:text-gold-300 transition-colors">GrandStay</h1>
            <p className="text-stone-500 dark:text-gray-500 text-xs mt-1 tracking-[0.3em] uppercase">Events & Grand Banquets</p>
          </Link>
        </div>

        <div className="card shadow-lg dark:shadow-glow-card">
          <h2 className="font-serif text-2xl text-stone-900 dark:text-white mb-6">Create Account</h2>

          {error && (
            <div className="bg-rose-50 dark:bg-red-900/40 border border-rose-300 dark:border-red-700 text-rose-800 dark:text-red-300 text-sm px-4 py-3 rounded-md mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-stone-700 dark:text-gray-400 mb-1.5 font-medium">Full Name</label>
              <input
                id="reg-name"
                type="text"
                className="input-field"
                placeholder="John Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-stone-700 dark:text-gray-400 mb-1.5 font-medium">Email Address</label>
              <input
                id="reg-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-stone-700 dark:text-gray-400 mb-1.5 font-medium">Password</label>
              <input
                id="reg-password"
                type="password"
                className="input-field"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 dark:text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-800 dark:text-gold-400 hover:text-amber-900 dark:hover:text-gold-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
