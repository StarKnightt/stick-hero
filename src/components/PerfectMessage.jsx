import React from 'react';

export default function PerfectMessage({ show }) {
  return (
    <div id="perfect" style={{ opacity: show ? 1 : 0 }}>
      DOUBLE SCORE
    </div>
  );
}