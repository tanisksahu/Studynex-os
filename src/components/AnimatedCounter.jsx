import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedCounter = ({ to = 0, duration = 1, suffix = '', prefix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const startValue = 0;
    const endValue = parseInt(to) || 0;
    const totalDuration = (duration || 1) * 1000;

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime >= totalDuration) {
        setCount(endValue);
        clearInterval(interval);
        return;
      }

      const progress = elapsedTime / totalDuration;
      const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const currentValue = startValue + (endValue - startValue) * easeOutProgress;

      setCount(parseFloat(currentValue.toFixed(decimals)));
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [to, duration, decimals, isVisible]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="font-headline font-black text-white"
    >
      {prefix}
      {count.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
      {suffix}
    </motion.span>
  );
};

export default AnimatedCounter;
