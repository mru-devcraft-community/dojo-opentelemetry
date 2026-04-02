import React from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import appAnim from '../../static/lottie/app.json';
import sdkAnim from '../../static/lottie/sdk.json';
import collectorAnim from '../../static/lottie/collector.json';
import backendAnim from '../../static/lottie/backend.json';

const LOTTIE_SIZE = { width: 52, height: 52 };

const nodes = [
  { key: 'app',       anim: appAnim,       label: 'Application', cls: 'otel-flow__node--app'       },
  { key: 'sdk',       anim: sdkAnim,       label: 'OTel SDK',    cls: 'otel-flow__node--sdk'       },
  { key: 'collector', anim: collectorAnim, label: 'Collector',   cls: 'otel-flow__node--collector' },
  { key: 'backend',   anim: backendAnim,   label: 'Backends',    cls: 'otel-flow__node--backend'   },
];

export default function OtelFlowAnimation() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.25 });

  return (
    <div ref={ref} className="otel-flow">
      {nodes.map((node, i) => (
        <React.Fragment key={node.key}>
          <motion.div
            className={`otel-flow__node ${node.cls}`}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: i * 0.18, ease: [0.4, 0, 0.2, 1] }}
          >
            <Lottie animationData={node.anim} loop autoplay style={LOTTIE_SIZE} />
            <span>{node.label}</span>
          </motion.div>

          {i < nodes.length - 1 && (
            <motion.div
              className="otel-flow__arrow"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={inView ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ duration: 0.3, delay: i * 0.18 + 0.35, ease: 'easeOut' }}
            >
              →
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
