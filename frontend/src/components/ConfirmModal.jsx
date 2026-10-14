import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import Modal from './Modal';

/**
 * Replaces window.confirm and window.prompt with a luxury themed modal.
 *
 * Props:
 *   open           - boolean
 *   onClose        - called when dismissed / cancelled
 *   onConfirm      - called with (inputValue?) on confirm
 *   title          - heading
 *   message        - body text / JSX
 *   confirmLabel   - text for confirm button (default "Confirm")
 *   cancelLabel    - text for cancel button (default "Cancel")
 *   variant        - "danger" | "warning" | "default"
 *   prompt         - if truthy, renders a textarea. Value = placeholder string.
 *   promptRequired - if true, confirm is disabled until text is entered
 */
export default function ConfirmModal({
  open, onClose, onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  prompt = null,
  promptRequired = false,
}) {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    onConfirm?.(prompt ? inputValue : undefined);
    setInputValue('');
  };

  const handleClose = () => {
    setInputValue('');
    onClose?.();
  };

  const confirmDisabled = prompt && promptRequired && !inputValue.trim();

  const btnClass = variant === 'danger'
    ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-md shadow-rose-950/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
    : variant === 'warning'
    ? 'bg-amber-600 hover:bg-amber-500 text-white dark:text-dark-950 border border-amber-500 font-bold shadow-md shadow-amber-950/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
    : 'btn-primary disabled:opacity-50 disabled:cursor-not-allowed';

  const iconBadge = variant === 'danger' ? (
    <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3 shrink-0">
      <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
    </div>
  ) : variant === 'warning' ? (
    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3 shrink-0">
      <AlertCircle className="w-5 h-5 stroke-[2.2]" />
    </div>
  ) : (
    <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-amber-800 dark:text-gold-400 mb-3 shrink-0">
      <HelpCircle className="w-5 h-5 stroke-[2.2]" />
    </div>
  );

  return (
    <Modal open={open} onClose={handleClose} title="" maxWidth="max-w-md">
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3">
          {iconBadge}
          <div className="flex-1">
            <h3 className="font-serif text-xl sm:text-2xl text-stone-900 dark:text-white font-semibold mb-1">
              {title}
            </h3>
            <div className="text-sm text-stone-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {message}
            </div>
          </div>
        </div>

        {prompt && (
          <div className="mt-3">
            <textarea
              rows={3}
              className="input-field text-xs resize-none"
              placeholder={typeof prompt === 'string' ? prompt : 'Enter details...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3 pt-3">
          <button
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className={`flex-1 text-xs py-3 rounded-full font-semibold transition-all duration-200 ${btnClass}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={handleClose}
            className="btn-outline flex-1 text-xs py-3 rounded-full"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
