import React from 'react';

interface TerminalOutputProps {
  title?: string;
  children: React.ReactNode;
}

export default function TerminalOutput({ title = 'Terminal', children }: TerminalOutputProps) {
  return (
    <div className="terminal-output">
      <div className="terminal-output__header">
        <span className="terminal-output__dot terminal-output__dot--red" />
        <span className="terminal-output__dot terminal-output__dot--yellow" />
        <span className="terminal-output__dot terminal-output__dot--green" />
        <span style={{ marginLeft: '0.5rem' }}>{title}</span>
      </div>
      <div className="terminal-output__content">
        {children}
      </div>
    </div>
  );
}
