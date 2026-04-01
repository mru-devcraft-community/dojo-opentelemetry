import React from 'react';

export default function OtelFlowAnimation() {
  return (
    <div className="otel-flow">
      <div className="otel-flow__node otel-flow__node--app">
        📦<br />Application
      </div>
      <div className="otel-flow__arrow">→</div>
      <div className="otel-flow__node otel-flow__node--sdk">
        🔧<br />OTel SDK
      </div>
      <div className="otel-flow__arrow">→</div>
      <div className="otel-flow__node otel-flow__node--collector">
        🔀<br />Collector
      </div>
      <div className="otel-flow__arrow">→</div>
      <div className="otel-flow__node otel-flow__node--backend">
        📊<br />Backends
      </div>
    </div>
  );
}
