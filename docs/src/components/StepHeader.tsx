import React from 'react';

interface StepHeaderProps {
  number: number;
  title: string;
  description?: string;
}

export default function StepHeader({ number, title, description }: StepHeaderProps) {
  return (
    <div className="step-header">
      <div className="step-header__number">{String(number).padStart(2, '0')}</div>
      <div className="step-header__content">
        <div className="step-header__title">{title}</div>
        {description && <p className="step-header__description">{description}</p>}
      </div>
    </div>
  );
}
