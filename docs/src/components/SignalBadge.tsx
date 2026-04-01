import React from 'react';

interface SignalBadgeProps {
  signal: 'traces' | 'metrics' | 'logs';
  title: string;
  children: React.ReactNode;
}

const icons = {
  traces: '🔍',
  metrics: '📊',
  logs: '📝',
};

export default function SignalBadge({ signal, title, children }: SignalBadgeProps) {
  return (
    <div className={`signal-badge signal-badge--${signal}`}>
      <div className="signal-badge__icon">{icons[signal]}</div>
      <div className="signal-badge__title">{title}</div>
      <div className="signal-badge__content">{children}</div>
    </div>
  );
}
