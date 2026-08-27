import React from 'react';

/**
 * Renders high-contrast, soft status badge for lead states
 */
export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || '').toLowerCase().trim();

  let styles = {
    bg: 'bg-slate-800/80',
    border: 'border-slate-700/60',
    text: 'text-slate-300',
    dot: 'bg-slate-400'
  };

  if (normalized.includes('new') || normalized.includes('fresh')) {
    styles = {
      bg: 'bg-cyan-950/60',
      border: 'border-cyan-500/30',
      text: 'text-cyan-300',
      dot: 'bg-cyan-400'
    };
  } else if (normalized.includes('contact') || normalized.includes('reached') || normalized.includes('called')) {
    styles = {
      bg: 'bg-blue-950/60',
      border: 'border-blue-500/30',
      text: 'text-blue-300',
      dot: 'bg-blue-400'
    };
  } else if (normalized.includes('progress') || normalized.includes('working') || normalized.includes('pending')) {
    styles = {
      bg: 'bg-amber-950/60',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      dot: 'bg-amber-400'
    };
  } else if (normalized.includes('qualif') || normalized.includes('warm') || normalized.includes('hot')) {
    styles = {
      bg: 'bg-emerald-950/60',
      border: 'border-emerald-500/30',
      text: 'text-emerald-300',
      dot: 'bg-emerald-400'
    };
  } else if (normalized.includes('convert') || normalized.includes('won') || normalized.includes('closed') || normalized.includes('deal')) {
    styles = {
      bg: 'bg-emerald-900/60',
      border: 'border-emerald-400/40',
      text: 'text-emerald-200',
      dot: 'bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
    };
  } else if (normalized.includes('follow') || normalized.includes('sched')) {
    styles = {
      bg: 'bg-purple-950/60',
      border: 'border-purple-500/30',
      text: 'text-purple-300',
      dot: 'bg-purple-400'
    };
  } else if (normalized.includes('lost') || normalized.includes('dead') || normalized.includes('unqual')) {
    styles = {
      bg: 'bg-rose-950/60',
      border: 'border-rose-500/30',
      text: 'text-rose-300',
      dot: 'bg-rose-400'
    };
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'lg' 
      ? 'px-3 py-1.5 text-sm' 
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles.bg} ${styles.border} ${styles.text} ${sizeClasses} shadow-sm backdrop-blur-sm transition-colors`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      <span>{status || 'Unknown'}</span>
    </span>
  );
}
