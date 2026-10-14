import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState('default'); // 'default' | 'pointer' | 'card' | 'input' | 'grab'
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Raw mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for outer ambient ring
  const ringX = useSpring(mouseX, { stiffness: 320, damping: 28, mass: 0.5 });
  const ringY = useSpring(mouseY, { stiffness: 320, damping: 28, mass: 0.5 });

  // Faster spring for inner pinpoint dot
  const dotX = useSpring(mouseX, { stiffness: 900, damping: 40 });
  const dotY = useSpring(mouseY, { stiffness: 900, damping: 40 });

  useEffect(() => {
    // Detect touch / coarse pointer devices
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (hasCoarsePointer || isTouch) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Determine what element is under the cursor
      const target = e.target;
      if (!target) return;

      const isInput = target.closest('input[type="text"], input[type="email"], input[type="password"], textarea, [contenteditable="true"]');
      const isSlider = target.closest('input[type="range"]');
      const isCard = target.closest('.card, .card-glass, [data-cursor="card"]');
      const isInteractive = target.closest('a, button, [role="button"], select, .btn-primary, .btn-outline, .btn-glass, [data-cursor="pointer"]');

      if (isSlider) {
        setCursorType('grab');
      } else if (isInput) {
        setCursorType('input');
      } else if (isInteractive) {
        setCursorType('pointer');
      } else if (isCard) {
        setCursorType('card');
      } else {
        setCursorType('default');
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (isTouchDevice || !isVisible) {
    return null;
  }

  // Ring dimension & style according to state (compact & refined)
  let ringSize = 24;
  let ringScale = 1;
  let ringBorder = 'border-amber-500/40 dark:border-gold-400/50';
  let ringBg = 'bg-amber-500/5 dark:bg-gold-400/10';

  if (cursorType === 'pointer') {
    ringSize = 32;
    ringScale = isClicking ? 0.85 : 1.1;
    ringBorder = 'border-amber-600/70 dark:border-gold-300/80';
    ringBg = 'bg-amber-600/10 dark:bg-gold-400/15';
  } else if (cursorType === 'card') {
    ringSize = 36;
    ringScale = isClicking ? 0.9 : 1.05;
    ringBorder = 'border-amber-500/25 dark:border-gold-400/25';
    ringBg = 'bg-amber-500/5 dark:bg-gold-500/8';
  } else if (cursorType === 'input') {
    ringSize = 20;
    ringScale = 0.8;
    ringBorder = 'border-amber-600/80 dark:border-gold-400/80';
    ringBg = 'bg-transparent';
  } else if (cursorType === 'grab') {
    ringSize = 30;
    ringScale = isClicking ? 0.75 : 1.05;
    ringBorder = 'border-amber-600/70 dark:border-gold-300/70';
    ringBg = 'bg-amber-500/15 dark:bg-gold-400/20';
  } else if (isClicking) {
    ringScale = 0.75;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300 select-none">
      {/* Outer ambient glowing halo */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          width: ringSize,
          height: ringSize,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: ringScale,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
        className={`fixed rounded-full border backdrop-blur-[1px] transition-colors duration-200 shadow-sm ${ringBorder} ${ringBg}`}
      />

      {/* Inner pinpoint dot */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.5 : cursorType === 'pointer' ? 1.4 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 600,
          damping: 30,
        }}
        className="fixed w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 dark:from-gold-400 dark:to-yellow-200 shadow-[0_0_8px_rgba(212,175,55,0.8)]"
      />
    </div>
  );
}
