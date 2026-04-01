import React, { useState } from 'react';

interface ValidationChecklistProps {
  items: string[];
}

export default function ValidationChecklist({ items }: ValidationChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));

  const toggle = (index: number) => {
    const next = [...checked];
    next[index] = !next[index];
    setChecked(next);
  };

  const allDone = checked.every(Boolean);

  return (
    <div className="validation-checklist">
      <div className="validation-checklist__title">
        {allDone ? '🎉' : '✅'} Checklist de validation {allDone && '— Tout est bon !'}
      </div>
      {items.map((item, i) => (
        <label key={i} className="validation-checklist__item">
          <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}
