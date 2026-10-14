import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Send, 
  Ban, 
  Check, 
  Sparkles,
  RefreshCw,
  Archive
} from 'lucide-react';

const statusConfig = {
  PENDING:             { bg: 'bg-amber-500/10 dark:bg-yellow-500/15',  text: 'text-amber-800 dark:text-yellow-400',  border: 'border-amber-400/40 dark:border-yellow-500/30', dot: 'bg-amber-600 dark:bg-yellow-400', icon: Clock, isLive: true },
  APPROVED:            { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-400', border: 'border-emerald-400/40 dark:border-emerald-500/30', dot: 'bg-emerald-600 dark:bg-emerald-400', icon: CheckCircle2 },
  CONFIRMED:           { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-400', border: 'border-emerald-400/40 dark:border-emerald-500/30', dot: 'bg-emerald-600 dark:bg-emerald-400', icon: CheckCircle2 },
  COMPLETED:           { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-400/40 dark:border-emerald-500/30', dot: 'bg-emerald-600 dark:bg-emerald-300', icon: Sparkles },
  VERIFIED:            { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-400', border: 'border-emerald-400/40 dark:border-emerald-500/30', dot: 'bg-emerald-600 dark:bg-emerald-400', icon: Check },
  PAID:                { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-400', border: 'border-emerald-400/40 dark:border-emerald-500/30', dot: 'bg-emerald-600 dark:bg-emerald-400', icon: CheckCircle2 },
  ACCEPTED:            { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-400', border: 'border-emerald-400/40 dark:border-emerald-500/30', dot: 'bg-emerald-600 dark:bg-emerald-400', icon: Check },
  RESOLVED:            { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-400', border: 'border-emerald-400/40 dark:border-emerald-500/30', dot: 'bg-emerald-600 dark:bg-emerald-400', icon: CheckCircle2 },
  REJECTED:            { bg: 'bg-rose-500/10 dark:bg-rose-500/15',    text: 'text-rose-800 dark:text-rose-400',    border: 'border-rose-400/40 dark:border-rose-500/30',    dot: 'bg-rose-600 dark:bg-rose-400', icon: XCircle },
  REFUNDED:            { bg: 'bg-purple-500/10 dark:bg-purple-500/15', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-400/40 dark:border-purple-500/30', dot: 'bg-purple-600 dark:bg-purple-400', icon: RefreshCw },
  CANCELLED:           { bg: 'bg-stone-500/10 dark:bg-gray-500/15',  text: 'text-stone-700 dark:text-gray-400',    border: 'border-stone-400/30 dark:border-gray-600/30',  dot: 'bg-stone-500 dark:bg-gray-500', icon: Ban },
  CANCELLED_LC:        { bg: 'bg-stone-500/10 dark:bg-gray-500/15',  text: 'text-stone-700 dark:text-gray-400',    border: 'border-stone-400/30 dark:border-gray-600/30',  dot: 'bg-stone-500 dark:bg-gray-500', icon: Ban },
  OPEN:                { bg: 'bg-amber-500/10 dark:bg-amber-500/15',   text: 'text-amber-800 dark:text-amber-400',   border: 'border-amber-400/40 dark:border-amber-500/30', dot: 'bg-amber-600 dark:bg-amber-400', icon: AlertCircle, isLive: true },
  DRAFT:               { bg: 'bg-stone-500/10 dark:bg-gray-500/15',  text: 'text-stone-700 dark:text-gray-400',    border: 'border-stone-400/30 dark:border-gray-600/30',  dot: 'bg-stone-500 dark:bg-gray-500', icon: FileText },
  SENT:                { bg: 'bg-sky-500/10 dark:bg-blue-500/15',     text: 'text-sky-800 dark:text-blue-400',     border: 'border-sky-400/40 dark:border-blue-500/30',     dot: 'bg-sky-600 dark:bg-blue-400', icon: Send },
  ISSUED:              { bg: 'bg-sky-500/10 dark:bg-blue-500/15',     text: 'text-sky-800 dark:text-blue-400',     border: 'border-sky-400/40 dark:border-blue-500/30',     dot: 'bg-sky-600 dark:bg-blue-400', icon: Send },
  IN_PROGRESS:         { bg: 'bg-amber-500/10 dark:bg-yellow-500/15',  text: 'text-amber-800 dark:text-yellow-400',  border: 'border-amber-400/40 dark:border-yellow-500/30', dot: 'bg-amber-600 dark:bg-yellow-400', icon: RefreshCw, isLive: true },
  REVISION_REQUESTED:  { bg: 'bg-amber-500/10 dark:bg-amber-500/15',   text: 'text-amber-800 dark:text-amber-400',   border: 'border-amber-400/40 dark:border-amber-500/30', dot: 'bg-amber-600 dark:bg-amber-400', icon: RefreshCw, isLive: true },
  CLOSED:              { bg: 'bg-stone-500/10 dark:bg-gray-500/15',  text: 'text-stone-700 dark:text-gray-400',    border: 'border-stone-400/30 dark:border-gray-600/30',  dot: 'bg-stone-500 dark:bg-gray-500', icon: Archive },
  OVERDUE:             { bg: 'bg-rose-500/10 dark:bg-rose-500/15',    text: 'text-rose-800 dark:text-rose-400',    border: 'border-rose-400/40 dark:border-rose-500/30',    dot: 'bg-rose-600 dark:bg-rose-400', icon: AlertCircle },
  ACTIVE:              { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-800 dark:text-emerald-400', border: 'border-emerald-400/40 dark:border-emerald-500/30', dot: 'bg-emerald-600 dark:bg-emerald-400', icon: CheckCircle2 },
  INACTIVE:            { bg: 'bg-stone-500/10 dark:bg-gray-500/15',  text: 'text-stone-700 dark:text-gray-400',    border: 'border-stone-400/30 dark:border-gray-600/30',  dot: 'bg-stone-500 dark:bg-gray-500', icon: Ban },
  EXPIRED:             { bg: 'bg-rose-500/10 dark:bg-rose-500/15',    text: 'text-rose-800 dark:text-rose-400',    border: 'border-rose-400/40 dark:border-rose-500/30',    dot: 'bg-rose-600 dark:bg-rose-400', icon: AlertCircle },
};

const fallback = { 
  bg: 'bg-stone-500/10 dark:bg-gray-500/15', 
  text: 'text-stone-700 dark:text-gray-400', 
  border: 'border-stone-400/30 dark:border-gray-600/30', 
  dot: 'bg-stone-500 dark:bg-gray-500',
  icon: Clock,
  isLive: false
};

// Human-readable label mapping for multi-word statuses
const labels = {
  REVISION_REQUESTED: 'Revision Requested',
  IN_PROGRESS: 'In Progress',
  CANCELLED_LC: 'Cancelled',
};

export default function StatusBadge({ status, showIcon = true }) {
  const cfg = statusConfig[status] || fallback;
  const label = labels[status] || status;
  const IconComponent = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} transition-all duration-200 shadow-sm backdrop-blur-sm select-none`}>
      {cfg.isLive ? (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
        </span>
      ) : showIcon && IconComponent ? (
        <IconComponent className="w-3 h-3 shrink-0 stroke-[2.2]" />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} shrink-0`} />
      )}
      <span className="tracking-wide">{label}</span>
    </span>
  );
}
