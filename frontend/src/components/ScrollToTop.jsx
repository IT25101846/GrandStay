import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100)));
      }

      if (currentScroll > 320) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Circular progress calculations
  const size = 44;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            type="button"
            onClick={scrollToTop}
            title="Scroll to top"
            aria-label="Scroll to top"
            className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-[#FDFDFB]/95 dark:bg-[#141312]/95 backdrop-blur-xl border border-stone-300 dark:border-gold-500/30 text-stone-700 dark:text-gold-400 shadow-xl hover:shadow-glow-gold hover:border-amber-600 dark:hover:border-gold-400 transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none"
          >
            {/* SVG Circular Scroll Progress Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
              viewBox={`0 0 ${size} ${size}`}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-stone-200 dark:stroke-white/10"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-amber-600 dark:stroke-gold-400 transition-all duration-150"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Arrow Icon with Lift Micro-Motion */}
            <ArrowUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110 relative z-10" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
