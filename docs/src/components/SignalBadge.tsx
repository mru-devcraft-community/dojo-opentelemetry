import React from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import tracesAnim from '../../static/lottie/traces.json';
import metricsAnim from '../../static/lottie/metrics.json';
import logsAnim from '../../static/lottie/logs.json';

interface SignalBadgeProps {
  signal: 'traces' | 'metrics' | 'logs';
  title: string;
  children: React.ReactNode;
  /** Stagger index — 0, 1, 2 — adds 0.15s delay per step */
  index?: number;
}

const animations = {
  traces: tracesAnim,
  metrics: metricsAnim,
  logs: logsAnim,
};

const LOTTIE_SIZE = { width: 64, height: 64 };

export default function SignalBadge({ signal, title, children, index = 0 }: SignalBadgeProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <motion.div
      ref={ref}
      className={`signal-badge signal-badge--${signal}`}
      initial={{ opacity: 0, y: 28, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
    >
      <div className="signal-badge__icon">
        <Lottie animationData={animations[signal]} loop autoplay style={LOTTIE_SIZE} />
      </div>
      <div className="signal-badge__title">{title}</div>
      <div className="signal-badge__content">{children}</div>
    </motion.div>
  );
}
