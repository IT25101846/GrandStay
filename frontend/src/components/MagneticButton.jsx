import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * MagneticButton
 * Creates a subtle magnetic pull towards the cursor when hovering over the button.
 */
export default function MagneticButton({
  children,
  className = '',
  strength = 0.32, // Magnetic attraction factor
  ...props
}) {
  const ref = useRef(null);

  // Position motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Luxury spring physics for natural elastic movement
  const springConfig = { stiffness: 280, damping: 20, mass: 0.3 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
      }}
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
