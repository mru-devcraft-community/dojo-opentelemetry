import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface TerminalOutputProps {
  title?: string;
  /** Animate content with a top-to-bottom reveal + blinking cursor */
  typewriter?: boolean;
  children: React.ReactNode;
}

export default function TerminalOutput({ title = 'Terminal', typewriter = false, children }: TerminalOutputProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      className="terminal-output"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="terminal-output__header">
        <span className="terminal-output__dot terminal-output__dot--red" />
        <span className="terminal-output__dot terminal-output__dot--yellow" />
        <span className="terminal-output__dot terminal-output__dot--green" />
        <span style={{ marginLeft: '0.5rem' }}>{title}</span>
      </div>
      <div className={`terminal-output__content${typewriter ? ' terminal-output__content--typewriter' : ''}`}>
        {children}
        {typewriter && <span className="terminal-output__cursor" aria-hidden>█</span>}
      </div>
    </motion.div>
  );
}
