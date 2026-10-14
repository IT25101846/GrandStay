import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Luxury custom date-picker with Framer Motion transitions and unavailable date handling.
 *
 * Props:
 *   value          – currently selected date as "yyyy-MM-dd" string, or ''
 *   onChange       – (dateStr: string) => void   called with "yyyy-MM-dd"
 *   unavailableDates – string[]  dates that are already booked ("yyyy-MM-dd")
 *   minDate        – string  earliest selectable date ("yyyy-MM-dd"), defaults to today
 *   maxDate        – string  latest selectable date ("yyyy-MM-dd"), optional
 */
export default function DatePicker({
  value = '',
  onChange,
  unavailableDates = [],
  minDate = '',
  maxDate = '',
}) {
  // ── helpers ──────────────────────────────────────────────────────────────
  const toStr = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const parseLocalDate = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // ── view state ────────────────────────────────────────────────────────────
  const getInitialView = () => {
    const ref = value ? parseLocalDate(value) : new Date();
    return { year: ref.getFullYear(), month: ref.getMonth() };
  };
  const [view, setView] = useState(getInitialView);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (value) {
      const d = parseLocalDate(value);
      setView({ year: d.getFullYear(), month: d.getMonth() });
    }
  }, [value]);

  // ── day classification helpers ────────────────────────────────────────────
  const isUnavailable = (y, m, d) => unavailableDates.includes(toStr(y, m, d));

  const isBeforeMin = (y, m, d) => {
    const min = parseLocalDate(minDate);
    return min ? new Date(y, m, d) < min : false;
  };

  const isAfterMax = (y, m, d) => {
    const max = parseLocalDate(maxDate);
    return max ? new Date(y, m, d) > max : false;
  };

  const isDisabled = (y, m, d) =>
    isBeforeMin(y, m, d) || isAfterMax(y, m, d);

  const isSelected = (y, m, d) => value === toStr(y, m, d);

  const isToday = (y, m, d) => {
    const now = new Date();
    return y === now.getFullYear() && m === now.getMonth() && d === now.getDate();
  };

  // ── navigation ────────────────────────────────────────────────────────────
  const prevMonth = () => {
    setDirection(-1);
    setView(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    );
  };

  const nextMonth = () => {
    setDirection(1);
    setView(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    );
  };

  // ── calendar grid ─────────────────────────────────────────────────────────
  const { year, month } = view;
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth  = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleDayClick = (day) => {
    if (isDisabled(year, month, day) || isUnavailable(year, month, day)) return;
    onChange(toStr(year, month, day));
  };

  // ── day cell styling ──────────────────────────────────────────────────────
  const dayClass = (day) => {
    const base = 'h-9 w-9 mx-auto flex items-center justify-center text-xs rounded-xl transition-all duration-150 relative select-none ';

    if (isSelected(year, month, day))
      return base + 'bg-amber-600 dark:bg-gold-500 text-white dark:text-dark-950 font-bold shadow-md shadow-amber-900/20 dark:shadow-glow-gold cursor-pointer scale-105';

    if (isUnavailable(year, month, day))
      return base + 'bg-rose-100/70 dark:bg-red-950/40 text-rose-700/70 dark:text-red-400/60 line-through cursor-not-allowed';

    if (isDisabled(year, month, day))
      return base + 'text-stone-300 dark:text-dark-600 cursor-not-allowed';

    if (isToday(year, month, day))
      return base + 'border border-amber-600/50 dark:border-gold-500/50 text-amber-800 dark:text-gold-300 hover:bg-amber-500/10 dark:hover:bg-gold-500/10 cursor-pointer font-semibold';

    return base + 'text-stone-700 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-dark-800 hover:text-stone-900 dark:hover:text-white cursor-pointer';
  };

  return (
    <div className="bg-white dark:bg-dark-950 border border-stone-200 dark:border-dark-700/80 rounded-2xl p-5 select-none shadow-sm dark:shadow-none">

      {/* Month / year navigation */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-dark-800/80">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Previous month"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 dark:text-gray-400 hover:text-amber-800 dark:hover:text-gold-400 hover:bg-stone-100 dark:hover:bg-dark-800 transition-colors focus:outline-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-amber-700 dark:text-gold-400" />
          <span className="text-stone-900 dark:text-white text-sm font-semibold tracking-wide font-serif">
            {MONTH_NAMES[month]} {year}
          </span>
        </div>

        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-500 dark:text-gray-400 hover:text-amber-800 dark:hover:text-gold-400 hover:bg-stone-100 dark:hover:bg-dark-800 transition-colors focus:outline-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday header row */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="h-7 flex items-center justify-center text-[10px] font-semibold text-stone-400 dark:text-gray-500 uppercase tracking-wider"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells with animated cross-fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: direction * 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="grid grid-cols-7 gap-y-1"
        >
          {cells.map((day, idx) =>
            day === null ? (
              <div key={`empty-${idx}`} className="h-9" />
            ) : (
              <button
                key={day}
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={isDisabled(year, month, day) || isUnavailable(year, month, day)}
                title={
                  isUnavailable(year, month, day)
                    ? 'This date is already booked'
                    : undefined
                }
                className={dayClass(day)}
              >
                {day}
              </button>
            ),
          )}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-stone-100 dark:border-dark-800/80 text-[10px] text-stone-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 dark:bg-gold-500 inline-block shrink-0 shadow-sm" />
          <span>Selected</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-200 dark:bg-red-950 border border-rose-300 dark:border-red-800/60 inline-block shrink-0" />
          <span>Booked</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-amber-600/50 dark:border-gold-500/50 inline-block shrink-0" />
          <span>Today</span>
        </span>
      </div>
    </div>
  );
}
