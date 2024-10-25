import React, { useEffect, useRef } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';

export default function Game() {
  const { score, perfectElement, restartButton, resetGame, gameState, config } = useGameLogic();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#BBD691");
        gradient.addColorStop(1, "#FEF1E1");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw platforms
        ctx.fillStyle = "black";
        gameState.platforms.forEach(platform => {
          ctx.fillRect(
            platform.x - gameState.sceneOffset,
            canvas.height - config.platformHeight,
            platform.w,
            config.platformHeight
          );
        });

        // Draw hero
        ctx.fillStyle = "black";
        ctx.fillRect(
          gameState.heroX - gameState.sceneOffset - config.heroWidth / 2,
          canvas.height - config.platformHeight - config.heroHeight,
          config.heroWidth,
          config.heroHeight
        );

        // Draw stick
        if (gameState.sticks.length > 0) {
          const stick = gameState.sticks[gameState.sticks.length - 1];
          ctx.save();
          ctx.translate(stick.x - gameState.sceneOffset, canvas.height - config.platformHeight);
          ctx.rotate((Math.PI / 180) * stick.rotation);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -stick.length);
          ctx.stroke();
          ctx.restore();
        }
      };

      draw();
    }
  }, [gameState, config]);

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