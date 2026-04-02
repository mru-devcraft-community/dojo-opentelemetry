import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ValidationChecklistProps {
  items: string[];
}

function AnimatedCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div className="validation-checklist__check-icon" onClick={onChange} role="checkbox" aria-checked={checked} tabIndex={0} onKeyDown={(e) => e.key === '' && onChange()}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <motion.rect
          x="1" y="1" width="18" height="18" rx="5"
          stroke="var(--otel-metrics)"
          strokeWidth="2"
          animate={{ fill: checked ? 'var(--otel-metrics)' : 'transparent' }}
          transition={{ duration: 0.2 }}
        />
        <AnimatePresence>
          {checked && (
            <motion.path
              d="M5 10 L8.5 13.5 L15 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}

export default function ValidationChecklist({ items }: ValidationChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));
  const prevAllDone = useRef(false);

  const toggle = (index: number) => {
    const next = [...checked];
    next[index] = !next[index];
    setChecked(next);
  };

  const allDone = checked.every(Boolean);
  const progress = items.length > 0 ? checked.filter(Boolean).length / items.length : 0;

  useEffect(() => {
    if (allDone && !prevAllDone.current && typeof window !== 'undefined') {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 130,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#4CAF50', '#2196F3', '#FF9800', '#7C4DFF', '#00BCD4'],
        });
      });
    }
    prevAllDone.current = allDone;
  }, [allDone]);

  return (
    <div className="validation-checklist">
      <div className="validation-checklist__title">
        <AnimatePresence mode="wait">
          {allDone ? (
            <motion.span
              key="done"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              🎉
            </motion.span>
          ) : (
            <motion.span key="progress" initial={{ scale: 1 }} animate={{ scale: 1 }}>
              ✅
            </motion.span>
          )}
        </AnimatePresence>
        {' '}Checklist de validation{allDone && ' — Tout est bon !'}
      </div>

      <div className="validation-checklist__progress-track">
        <motion.div
          className="validation-checklist__progress-bar"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {items.map((item, i) => (
        <motion.div
          key={i}
          className="validation-checklist__item"
          animate={{ opacity: checked[i] ? 0.65 : 1 }}
          transition={{ duration: 0.25 }}
        >
          <AnimatedCheckbox checked={checked[i]} onChange={() => toggle(i)} />
          <span style={{ textDecoration: checked[i] ? 'line-through' : 'none', cursor: 'pointer' }} onClick={() => toggle(i)}>
            {item}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
