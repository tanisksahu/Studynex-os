// Framer Motion animation variants and configurations
// Used across all components for consistent animations

// Page transitions
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

// Container animations with stagger effect
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

// Individual item animations
export const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

// Card hover animations
export const cardHoverVariants = {
  rest: {
    scale: 1,
    boxShadow: '0 0 0px rgba(195, 192, 255, 0)',
    transition: { duration: 0.3 }
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)',
    transition: { duration: 0.3 }
  }
};

// Button press animation
export const buttonPressVariants = {
  rest: { scale: 1 },
  pressed: { scale: 0.95 },
  hover: { scale: 1.05 }
};

// Smooth fade in animation
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

// Slide from left
export const slideInLeftVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

// Slide from right
export const slideInRightVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

// Scale up animation
export const scaleUpVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  }
};

// Modal animation
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: { opacity: 0, scale: 0.9, y: -30, transition: { duration: 0.2 } }
};

// Modal backdrop
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

// List animations
export const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

// Loading pulse animation
export const pulseVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0.5, 1, 0.5],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'easeInOut'
    }
  }
};

// Spinner animation
export const spinVariants = {
  spin: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'linear'
    }
  }
};

// Bounce animation for notifications
export const bounceVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30
    }
  },
  exit: { opacity: 0, y: 50, transition: { duration: 0.3 } }
};

// Success checkmark animation
export const checkmarkVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      delay: 0.2
    }
  }
};

// Error shake animation
export const shakeVariants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
};

// Gallery item animation
export const galleryVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

// Tab switch animation
export const tabVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

// Hover lift effect (for cards)
export const hoverLiftVariants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.3 }
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 25px rgba(79, 70, 229, 0.3)',
    transition: { duration: 0.3 }
  }
};

// Progress bar animation
export const progressVariants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1, ease: 'easeOut' } }
};

// Glow effect
export const glowVariants = {
  rest: {
    boxShadow: '0 0 0px rgba(79, 70, 229, 0)'
  },
  hover: {
    boxShadow: '0 0 20px rgba(79, 70, 229, 0.6)',
    transition: { duration: 0.3 }
  }
};

// Float animation (subtle up and down)
export const floatVariants = {
  float: {
    y: [-5, 5, -5],
    transition: {
      repeat: Infinity,
      duration: 3,
      ease: 'easeInOut'
    }
  }
};

// Shimmer effect for skeleton loaders
export const shimmerVariants = {
  shimmer: {
    backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'linear'
    }
  }
};
