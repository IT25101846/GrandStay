import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * CountUpNumber
 * Smoothly counts up from 0 to target value when scrolled into view.
 */
export default function CountUpNumber({
  value,
  duration = 1600, // milliseconds
  decimals = 0,
  prefix = '',
  suffix = '+',
  formatThousands = true,
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [displayValue, setDisplayValue] = useState(0);

  const targetNum = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    if (!isInView || targetNum <= 0) {
      if (targetNum > 0 && !isInView) {
        setDisplayValue(0);
      }
      return;
    }

    let startTimestamp = null;
    let animationFrameId;

    // Smooth ease-out cubic function for luxury deceleration
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current = easedProgress * targetNum;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(targetNum);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInView, targetNum, duration]);

  const formatNumber = (num) => {
    if (targetNum <= 0) return '—';

    let formatted = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();

    if (formatThousands) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formatted = parts.join('.');
    }

    return `${prefix}${formatted}${suffix}`;
  };

  return (
    <span ref={ref} className={`tabular-nums inline-block ${className}`}>
      {formatNumber(displayValue)}
    </span>
  );
}
