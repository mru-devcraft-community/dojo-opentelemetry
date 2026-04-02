import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

const offsets: Record<Direction, { x: number; y: number }> = {
  up:    { y: 32, x: 0  },
  down:  { y: -32, x: 0 },
  left:  { y: 0,  x: 32 },
  right: { y: 0,  x: -32},
  none:  { y: 0,  x: 0  },
};

/**
 * Wraps any content and fades it in when it enters the viewport.
 * Usage in MDX:
 *   <FadeInView delay={0.1} direction="up">...</FadeInView>
 */
export default function FadeInView({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.5,
  className,
  style,
}: FadeInViewProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.12 });
  const { x, y } = offsets[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, x, y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
