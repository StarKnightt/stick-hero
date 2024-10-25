import React, { useEffect, useRef } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';

export default function Game() {
  const { canvasRef, score, perfectElement, restartButton, resetGame, draw } = useGameLogic();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw(); // Initial draw call
    }
  }, [draw]);

  return (
    <div className="container">
      <div id="score">{score}</div>
      <canvas ref={canvasRef} id="game"></canvas>
      <div id="introduction">Hold down the mouse to stretch out a stick</div>
      <div id="perfect" style={perfectElement.style}>DOUBLE SCORE</div>
      <button id="restart" style={restartButton.style} onClick={resetGame}>
        RESTART
      </button>
    </div>
  );
}