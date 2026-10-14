import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Luxury Hotel & Banquet architectural emblem for GrandStay
 * Supports:
 * - variant="crest" (default): Standalone Golden "G" architectural crest mark
 * - variant="full": Full horizontal brand lockup with auto light/dark contrast
 */
export default function GrandStayLogo({ className = "w-10 h-10", variant = "crest", isDark: propIsDark, alt = "GrandStay" }) {
  const themeContext = useTheme?.();
  const isDarkTheme = themeContext?.isDark ?? true;
  const dark = propIsDark !== undefined ? propIsDark : isDarkTheme;

  if (variant === "full") {
    return (
      <img
        src={dark ? '/images/grandstay-logo-dark.png' : '/images/grandstay-logo-light.png'}
        alt={alt}
        className={`h-auto object-contain transition-all duration-300 ${className}`}
      />
    );
  }

  return (
    <div className={`rounded-xl border border-amber-600/30 dark:border-gold-500/40 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent dark:from-gold-500/15 dark:via-gold-500/5 dark:to-transparent flex items-center justify-center p-1 shadow-sm group-hover:border-amber-600 dark:group-hover:border-gold-400 group-hover:shadow-glow-gold transition-all duration-300 overflow-hidden shrink-0 ${className}`}>
      <img 
        src="/images/grandstay-crest.png" 
        alt={alt} 
        className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
}
