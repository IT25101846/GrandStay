import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalBackdrop, modalContent } from '../utils/motion';

/**
 * Reusable luxury modal wrapper with Framer Motion spring physics.
 * Props:
 *   open     - boolean (show/hide)
 *   onClose  - callback on close
 *   title    - optional heading string
 *   badge    - optional badge text (rendered as badge-gold)
 *   subtitle - optional subtitle string
 *   maxWidth - optional Tailwind max-width class (default: "max-w-xl")
 *   children - modal body content
 */
export default function Modal({ open, onClose, title, badge, subtitle, maxWidth = 'max-w-xl', children }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { 
      if (e.key === 'Escape') onClose?.(); 
    };
    
    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] bg-stone-950/70 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pointer-events-auto"
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            key="modal-card"
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`card bg-white dark:bg-dark-950 border border-[#E7DEC8] dark:border-gold-500/40 ${maxWidth} w-full p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto pointer-events-auto`}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-stone-400 dark:text-gray-400 hover:text-stone-900 dark:hover:text-white p-2 rounded-full hover:bg-stone-100 dark:hover:bg-dark-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 pointer-events-auto cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {badge && (
              <span className="badge-gold mb-2 inline-flex items-center">
                {badge}
              </span>
            )}
            {title && (
              <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-white mb-1 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-stone-500 dark:text-gray-400 mb-6 leading-relaxed">
                {subtitle}
              </p>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
