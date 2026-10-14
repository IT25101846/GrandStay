/**
 * GrandStay Luxury Motion & Animation Tokens
 * Declarative Framer Motion variants & transition tokens for GrandStay Hotel & Banquets
 */

export const TRANSITION_EASE_LUXURY = [0.16, 1, 0.3, 1];
export const TRANSITION_EASE_SMOOTH = [0.25, 0.1, 0.25, 1];

export const SPRING_LUXURY = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
};

export const SPRING_GENTLE = {
  type: 'spring',
  stiffness: 180,
  damping: 24,
};

export const SPRING_SNAPPY = {
  type: 'spring',
  stiffness: 350,
  damping: 25,
};

// -------------------------------------------------------------
// Core Viewport Reveals
// -------------------------------------------------------------

export const fadeIn = (duration = 0.5, delay = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration,
      delay,
      ease: TRANSITION_EASE_LUXURY,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration * 0.6, ease: 'easeOut' },
  },
});

export const fadeUp = (distance = 24, duration = 0.6, delay = 0) => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      delay,
      ease: TRANSITION_EASE_LUXURY,
    },
  },
  exit: {
    opacity: 0,
    y: -distance * 0.5,
    transition: { duration: duration * 0.5, ease: 'easeOut' },
  },
});

export const fadeDown = (distance = 20, duration = 0.5, delay = 0) => ({
  hidden: { opacity: 0, y: -distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      delay,
      ease: TRANSITION_EASE_LUXURY,
    },
  },
  exit: {
    opacity: 0,
    y: -distance,
    transition: { duration: duration * 0.4, ease: 'easeOut' },
  },
});

export const fadeLeft = (distance = 30, duration = 0.6, delay = 0) => ({
  hidden: { opacity: 0, x: distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration,
      delay,
      ease: TRANSITION_EASE_LUXURY,
    },
  },
  exit: {
    opacity: 0,
    x: -distance * 0.5,
    transition: { duration: duration * 0.4, ease: 'easeOut' },
  },
});

export const fadeRight = (distance = 30, duration = 0.6, delay = 0) => ({
  hidden: { opacity: 0, x: -distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration,
      delay,
      ease: TRANSITION_EASE_LUXURY,
    },
  },
  exit: {
    opacity: 0,
    x: distance * 0.5,
    transition: { duration: duration * 0.4, ease: 'easeOut' },
  },
});

export const scaleIn = (initialScale = 0.95, duration = 0.4, delay = 0) => ({
  hidden: { opacity: 0, scale: initialScale },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration,
      delay,
      ease: TRANSITION_EASE_LUXURY,
    },
  },
  exit: {
    opacity: 0,
    scale: initialScale * 0.98,
    transition: { duration: duration * 0.5, ease: 'easeOut' },
  },
});

// -------------------------------------------------------------
// Orchestration & Stagger Containers
// -------------------------------------------------------------

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0.05) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const heroStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// -------------------------------------------------------------
// Interactive Micro-Interactions (Hover, Tap)
// -------------------------------------------------------------

export const buttonInteraction = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: TRANSITION_EASE_LUXURY },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: 'easeOut' },
  },
};

export const cardLift = {
  rest: {
    y: 0,
    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
    transition: { duration: 0.4, ease: TRANSITION_EASE_LUXURY },
  },
  hover: {
    y: -6,
    boxShadow: '0 20px 40px -15px rgba(212, 175, 55, 0.25)',
    transition: { duration: 0.4, ease: TRANSITION_EASE_LUXURY },
  },
  tap: {
    scale: 0.99,
    y: -2,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
};

// -------------------------------------------------------------
// Modal & Dialog Variants
// -------------------------------------------------------------

export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn', delay: 0.05 },
  },
};

export const modalContent = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 16,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_LUXURY,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

// -------------------------------------------------------------
// Accordion & Collapsible Variants
// -------------------------------------------------------------

export const accordionContent = {
  hidden: {
    opacity: 0,
    height: 0,
    overflow: 'hidden',
    transition: {
      height: { duration: 0.3, ease: TRANSITION_EASE_LUXURY },
      opacity: { duration: 0.2 },
    },
  },
  visible: {
    opacity: 1,
    height: 'auto',
    overflow: 'hidden',
    transition: {
      height: { duration: 0.35, ease: TRANSITION_EASE_LUXURY },
      opacity: { duration: 0.3, delay: 0.08 },
    },
  },
};

// -------------------------------------------------------------
// Multi-Step Wizard Variants (Booking Engine)
// -------------------------------------------------------------

export const wizardSlide = {
  enter: (direction = 1) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { ...SPRING_LUXURY },
      opacity: { duration: 0.3 },
    },
  },
  exit: (direction = 1) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0,
    transition: {
      x: { duration: 0.25, ease: 'easeIn' },
      opacity: { duration: 0.2 },
    },
  }),
};

// -------------------------------------------------------------
// Tab Content Cross-Fade
// -------------------------------------------------------------

export const tabContent = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: TRANSITION_EASE_LUXURY },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

// -------------------------------------------------------------
// Reduced Motion Fallback Helper
// -------------------------------------------------------------

export const getReducedMotionVariants = (variants) => {
  return {
    ...variants,
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  };
};
