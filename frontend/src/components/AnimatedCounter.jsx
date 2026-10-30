import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedCounter counts smoothly from 0 to target value when scrolled into viewport.
 */
export default function AnimatedCounter({
  target,
  duration = 1600,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = ''
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setCount(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasStarted, target]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = performance.now();
    const endVal = parseFloat(target);

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic: 1 - (1 - progress)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeProgress * endVal;

      setCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(endVal);
      }
    };

    requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  const formattedValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.round(count).toLocaleString();

  return (
    <span ref={elementRef} className={`inline-block font-mono tracking-tight ${className}`}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
