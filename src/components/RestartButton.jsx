import React from 'react';

export default function RestartButton({ show, onClick }) {
  return (
    <button id="restart" style={{ display: show ? 'block' : 'none' }} onClick={onClick}>
      RESTART
    </button>
  );
}