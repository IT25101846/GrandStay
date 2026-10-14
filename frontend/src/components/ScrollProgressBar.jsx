import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none bg-stone-200/20 dark:bg-dark-900/40">
      <motion.div
        style={{ scaleX, transformOrigin: '0%' }}
        className="h-full w-full bg-gradient-to-r from-amber-700 via-[#E5BF62] to-amber-500 dark:from-gold-600 dark:via-gold-400 dark:to-yellow-300 shadow-[0_0_12px_rgba(212,175,55,0.7)]"
      />
    </div>
  );
}
