import React from 'react';

export default function Introduction({ show }) {
  return (
    <div id="introduction" style={{ opacity: show ? 1 : 0 }}>
      Hold down the mouse to stretch out a stick
    </div>
  );
}