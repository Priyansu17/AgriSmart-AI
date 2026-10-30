import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal component that uses IntersectionObserver for silky-smooth,
 * GPU-accelerated scroll animations without external library bloat.
 */
export default function ScrollReveal({
  children,
  animation = 'fade-up', // 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'flip-up'
  delay = 0,             // ms delay (e.g. for staggered lists)
  duration = 600,        // ms duration
  threshold = 0.1,       // ratio of element visibility before trigger
  once = false,          // false: re-animates smoothly when scrolling back up
  className = '',
  style = {}
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else {
          // When user scrolls past or back up out of view, reset visibility if once is false
          if (!once) {
            setIsVisible(false);
          }
        }
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold, once]);

  // Initial transform styles based on animation type
  const getHiddenStyle = () => {
    switch (animation) {
      case 'fade-up':
        return 'opacity-0 translate-y-8';
      case 'fade-down':
        return 'opacity-0 -translate-y-8';
      case 'fade-left':
        return 'opacity-0 translate-x-8';
      case 'fade-right':
        return 'opacity-0 -translate-x-8';
      case 'zoom-in':
        return 'opacity-0 scale-90';
      case 'flip-up':
        return 'opacity-0 rotate-1 translate-y-6';
      default:
        return 'opacity-0 translate-y-6';
    }
  };

  const visibleClass = isVisible 
    ? 'opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0' 
    : getHiddenStyle();

  return (
    <div
      ref={elementRef}
      className={`transition-all ease-out transform-gpu will-change-[transform,opacity] print:opacity-100! print:translate-none! print:transform-none! print:transition-none! print:visible! ${visibleClass} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        ...style
      }}
    >
      {children}
    </div>
  );
}
