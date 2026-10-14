import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    // Auto remove after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, title = 'Success') => addToast(msg, 'success', title),
    error: (msg, title = 'Error') => addToast(msg, 'error', title),
    info: (msg, title = 'Notice') => addToast(msg, 'info', title),
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-500/40 dark:border-emerald-500/50',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          icon: CheckCircle2,
          glow: 'shadow-lg shadow-emerald-950/10 dark:shadow-emerald-900/20',
        };
      case 'error':
        return {
          border: 'border-rose-500/40 dark:border-rose-500/50',
          iconColor: 'text-rose-600 dark:text-rose-400',
          icon: AlertTriangle,
          glow: 'shadow-lg shadow-rose-950/10 dark:shadow-rose-900/20',
        };
      default:
        return {
          border: 'border-amber-500/40 dark:border-gold-500/40',
          iconColor: 'text-amber-700 dark:text-gold-400',
          icon: Info,
          glow: 'shadow-lg shadow-amber-950/10 dark:shadow-glow-gold',
        };
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Render Portal */}
      <div 
        aria-live="polite" 
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const styles = getToastStyles(t.type);
            const Icon = styles.icon;

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                className={`pointer-events-auto bg-[#F6F4EE]/95 dark:bg-[#1A1917]/95 backdrop-blur-xl border ${styles.border} ${styles.glow} rounded-2xl p-4 flex items-start gap-3 relative select-none`}
              >
                <div className={`mt-0.5 shrink-0 ${styles.iconColor}`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                
                <div className="flex-1 pr-4">
                  {t.title && (
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#141312] dark:text-[#F0ECE4] mb-0.5 font-sans">
                      {t.title}
                    </h4>
                  )}
                  <p className="text-xs text-[#66625C] dark:text-[#ADA79E] leading-relaxed whitespace-pre-line">
                    {t.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="text-stone-400 hover:text-stone-700 dark:text-gray-500 dark:hover:text-white p-1 rounded-full transition-colors absolute top-2.5 right-2.5"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
