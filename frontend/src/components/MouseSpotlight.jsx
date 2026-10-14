import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * MouseSpotlight
 * Wraps any card or container to project a subtle interactive radial glow following the cursor.
 */
export default function MouseSpotlight({ 
  children, 
  className = '', 
  spotlightColor = 'rgba(212, 175, 55, 0.09)', 
  spotlightSize = 180,
  ...props 
}) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: -500, y: -500 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: -500, y: -500 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial Layer */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
}
