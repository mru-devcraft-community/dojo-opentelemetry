import React from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import tracesAnim from '../../static/lottie/traces.json';
import metricsAnim from '../../static/lottie/metrics.json';
import logsAnim from '../../static/lottie/logs.json';
import dashboardAnim from '../../static/lottie/dashboard.json';

type BackendType = 'traces' | 'metrics' | 'logs' | 'dashboard';

interface BackendCardProps {
  name: string;
  url: string;
  type: BackendType;
  /** Stagger index for scroll entrance */
  index?: number;
  children: React.ReactNode;
}

const config: Record<BackendType, { color: string; bg: string; anim: object }> = {
  traces:    { color: '#2196F3', bg: 'rgba(33,150,243,0.07)',  anim: tracesAnim    },
  metrics:   { color: '#4CAF50', bg: 'rgba(76,175,80,0.07)',   anim: metricsAnim   },
  logs:      { color: '#FF9800', bg: 'rgba(255,152,0,0.07)',    anim: logsAnim      },
  dashboard: { color: '#9C27B0', bg: 'rgba(156,39,176,0.07)',  anim: dashboardAnim },
};

export default function BackendCard({ name, url, type, index = 0, children }: BackendCardProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { color, bg, anim } = config[type];

  return (
    <motion.div
      ref={ref}
      className="backend-card"
      style={{ borderColor: color, background: bg }}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="backend-card__header">
        <div className="backend-card__icon">
          <Lottie animationData={anim} loop autoplay style={{ width: 48, height: 48 }} />
        </div>
        <div className="backend-card__meta">
          <span className="backend-card__name" style={{ color }}>{name}</span>
          <a
            className="backend-card__url"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ borderColor: color, color }}
          >
            {url}
          </a>
        </div>
      </div>
      <div className="backend-card__body">{children}</div>
    </motion.div>
  );
}
