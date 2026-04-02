import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface StepHeaderProps {
  number: number;
  title: string;
  description?: string;
}

export default function StepHeader({ number, title, description }: StepHeaderProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      className="step-header"
      initial={{ opacity: 0, x: -28 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className="step-header__number"
        initial={{ scale: 0, rotate: -180 }}
        animate={inView ? { scale: 1, rotate: 0 } : {}}
        transition={{ duration: 0.55, delay: 0.15, type: 'spring', stiffness: 220, damping: 16 }}
      >
        {String(number).padStart(2, '0')}
      </motion.div>
      <motion.div
        className="step-header__content"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <div className="step-header__title">{title}</div>
        {description && <p className="step-header__description">{description}</p>}
      </motion.div>
    </motion.div>
  );
}
