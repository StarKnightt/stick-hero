import { useState, useEffect, useRef, useCallback } from 'react';

Array.prototype.last = function () {
  return this[this.length - 1];
};

Math.sinus = function (degree) {
  return Math.sin((degree / 180) * Math.PI);
};

export function useGameLogic() {
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState("waiting");
  const [perfectElement, setPerfectElement] = useState({ style: { opacity: 0 } });
  const [restartButton, setRestartButton] = useState({ style: { display: "none" } });
  const canvasRef = useRef(null);

  const gameState = useRef({
    lastTimestamp: 0,
    heroX: 0,
    heroY: 0,
    sceneOffset: 0,
    platforms: [],
    sticks: [],
    trees: [],
  });

  const config = {
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
    platformHeight: 100,
    heroDistanceFromEdge: 10,
    paddingX: 100,
    perfectAreaSize: 10,
    backgroundSpeedMultiplier: 0.2,
    hill1BaseHeight: 100,
    hill1Amplitude: 10,
    hill1Stretch: 1,
    hill2BaseHeight: 70,
    hill2Amplitude: 20,
    hill2Stretch: 0.5,
    stretchingSpeed: 4,
    turningSpeed: 4,
    walkingSpeed: 4,
    transitioningSpeed: 2,
    fallingSpeed: 2,
    heroWidth: 17,
    heroHeight: 30,
  };

  const generateTree = useCallback(() => {
    const minimumGap = 30;
    const maximumGap = 150;

    const lastTree = gameState.current.trees[gameState.current.trees.length - 1];
    let furthestX = lastTree ? lastTree.x : 0;

    const x =
      furthestX +
      minimumGap +
      Math.floor(Math.random() * (maximumGap - minimumGap));

    const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
    const color = treeColors[Math.floor(Math.random() * 3)];

    gameState.current.trees.push({ x, color });
  }, []);

  const generatePlatform = useCallback(() => {
    const minimumGap = 40;
    const maximumGap = 200;
    const minimumWidth = 20;
    const maximumWidth = 100;

    const lastPlatform = gameState.current.platforms[gameState.current.platforms.length - 1];
    let furthestX = lastPlatform ? lastPlatform.x + lastPlatform.w : 0;

    const x =
      furthestX +
      minimumGap +
      Math.floor(Math.random() * (maximumGap - minimumGap));
    const w =
      minimumWidth + Math.floor(Math.random() * (maximumWidth - minimumWidth));

    gameState.current.platforms.push({ x, w });
  }, []);

  const resetGame = useCallback(() => {
    gameState.current = {
      lastTimestamp: 0,
      sceneOffset: 0,
      platforms: [{ x: 50, w: 50 }],
      sticks: [{ x: 50 + 50, length: 0, rotation: 0 }],
      trees: [],
      heroX: 50 + 50 - config.heroDistanceFromEdge,
      heroY: 0,
    };

    setScore(0);
    setPhase("waiting");
    setPerfectElement({ style: { opacity: 0 } });
    setRestartButton({ style: { display: "none" } });

    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();

    generateTree();
    generateTree();
    generateTree();
    generateTree();
    generateTree();

    if (canvasRef.current) {
      draw();
    }
  }, [generatePlatform, generateTree]);

  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const state = gameState.current;

    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    drawBackground(ctx, state);

    ctx.translate(
      (window.innerWidth - config.canvasWidth) / 2 - state.sceneOffset,
      (window.innerHeight - config.canvasHeight) / 2
    );

    drawPlatforms(ctx, state);
    drawHero(ctx, state);
    drawSticks(ctx, state);

    ctx.restore();
  }, []);

  const drawPlatforms = useCallback((ctx, state) => {
    state.platforms.forEach(({ x, w }) => {
      ctx.fillStyle = "black";
      ctx.fillRect(
        x,
        config.canvasHeight - config.platformHeight,
        w,
        config.platformHeight + (window.innerHeight - config.canvasHeight) / 2
      );

      if (state.sticks.last().x < x) {
        ctx.fillStyle = "red";
        ctx.fillRect(
          x + w / 2 - config.perfectAreaSize / 2,
          config.canvasHeight - config.platformHeight,
          config.perfectAreaSize,
          config.perfectAreaSize
        );
      }
    });
  }, []);

  const drawHero = useCallback((ctx, state) => {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.translate(
      state.heroX - config.heroWidth / 2,
      state.heroY + config.canvasHeight - config.platformHeight - config.heroHeight / 2
    );

    drawRoundedRect(
      ctx,
      -config.heroWidth / 2,
      -config.heroHeight / 2,
      config.heroWidth,
      config.heroHeight - 4,
      5
    );

    const legDistance = 5;
    ctx.beginPath();
    ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(5, -7, 3, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = "red";
    ctx.fillRect(-config.heroWidth / 2 - 1, -12, config.heroWidth + 2, 4.5);
    ctx.beginPath();
    ctx.moveTo(-9, -14.5);
    ctx.lineTo(-17, -18.5);
    ctx.lineTo(-14, -8.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -10.5);
    ctx.lineTo(-15, -3.5);
    ctx.lineTo(-5, -7);
    ctx.fill();

    ctx.restore();
  }, []);

  const drawRoundedRect = useCallback((ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.fill();
  }, []);

  const drawSticks = useCallback((ctx, state) => {
    state.sticks.forEach((stick) => {
      ctx.save();
      ctx.translate(stick.x, config.canvasHeight - config.platformHeight);
      ctx.rotate((Math.PI / 180) * stick.rotation);

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -stick.length);
      ctx.stroke();

      ctx.restore();
    });
  }, []);

  const drawBackground = useCallback((ctx, state) => {
    var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
    gradient.addColorStop(0, "#BBD691");
    gradient.addColorStop(1, "#FEF1E1");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    drawHill(ctx, state, config.hill1BaseHeight, config.hill1Amplitude, config.hill1Stretch, "#95C629");
    drawHill(ctx, state, config.hill2BaseHeight, config.hill2Amplitude, config.hill2Stretch, "#659F1C");

    state.trees.forEach((tree) => drawTree(ctx, state, tree.x, tree.color));
  }, []);

  const drawHill = useCallback((ctx, state, baseHeight, amplitude, stretch, color) => {
    ctx.beginPath();
    ctx.moveTo(0, window.innerHeight);
    ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
    for (let i = 0; i < window.innerWidth; i++) {
      ctx.lineTo(i, getHillY(i, baseHeight, amplitude, stretch));
    }
    ctx.lineTo(window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;
    ctx.fill();
  }, []);

  const drawTree = useCallback((ctx, state, x, color) => {
    ctx.save();
    ctx.translate(
      (-state.sceneOffset * config.backgroundSpeedMultiplier + x) * config.hill1Stretch,
      getTreeY(x, config.hill1BaseHeight, config.hill1Amplitude)
    );

    const treeTrunkHeight = 5;
    const treeTrunkWidth = 2;
    const treeCrownHeight = 25;
    const treeCrownWidth = 10;

    ctx.fillStyle = "#7D833C";
    ctx.fillRect(
      -treeTrunkWidth / 2,
      -treeTrunkHeight,
      treeTrunkWidth,
      treeTrunkHeight
    );

    ctx.beginPath();
    ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
    ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
    ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
  }, []);

  const getHillY = useCallback((windowX, baseHeight, amplitude, stretch) => {
    const sineBaseY = window.innerHeight - baseHeight;
    return (
      Math.sinus((gameState.current.sceneOffset * config.backgroundSpeedMultiplier + windowX) * stretch) *
        amplitude +
      sineBaseY
    );
  }, []);

  const getTreeY = useCallback((x, baseHeight, amplitude) => {
    const sineBaseY = window.innerHeight - baseHeight;
    return Math.sinus(x) * amplitude + sineBaseY;
  }, []);

  const thePlatformTheStickHits = useCallback(() => {
    const state = gameState.current;
    if (state.sticks.last().rotation !== 90)
      throw Error(`Stick is ${state.sticks.last().rotation}°`);
    const stickFarX = state.sticks.last().x + state.sticks.last().length;

    const platformTheStickHits = state.platforms.find(
      (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
    );

    if (
      platformTheStickHits &&
      platformTheStickHits.x + platformTheStickHits.w / 2 - config.perfectAreaSize / 2 <
        stickFarX &&
      stickFarX <
        platformTheStickHits.x + platformTheStickHits.w / 2 + config.perfectAreaSize / 2
    )
      return [platformTheStickHits, true];

    return [platformTheStickHits, false];
  }, []);

  const animate = useCallback((timestamp) => {
    const state = gameState.current;

    if (!state.lastTimestamp) {
      state.lastTimestamp = timestamp;
      window.requestAnimationFrame(animate);
      return;
    }

    switch (phase) {
      case "waiting":
        return;
      case "stretching": {
        state.sticks.last().length += (timestamp - state.lastTimestamp) / config.stretchingSpeed;
        break;
      }
      case "turning": {
        state.sticks.last().rotation += (timestamp - state.lastTimestamp) / config.turningSpeed;

        if (state.sticks.last().rotation > 90) {
          state.sticks.last().rotation = 90;

          const [nextPlatform, perfectHit] = thePlatformTheStickHits();
          if (nextPlatform) {
            setScore((prevScore) => prevScore + (perfectHit ? 2 : 1));

            if (perfectHit) {
              setPerfectElement({ style: { opacity: 1 } });
              setTimeout(() => setPerfectElement({ style: { opacity: 0 } }), 1000);
            }

            generatePlatform();
            generateTree();
            generateTree();
          }

          setPhase("walking");
        }
        break;
      }
      case "walking": {
        state.heroX += (timestamp - state.lastTimestamp) / config.walkingSpeed;

        const [nextPlatform] = thePlatformTheStickHits();
        if (nextPlatform) {
          const maxHeroX = nextPlatform.x + nextPlatform.w - config.heroDistanceFromEdge;
          if (state.heroX > maxHeroX) {
            state.heroX = maxHeroX;
            setPhase("transitioning");
          }
        } else {
          const maxHeroX = state.sticks.last().x + state.sticks.last().length + config.heroWidth;
          if (state.heroX > maxHeroX) {
            state.heroX = maxHeroX;
            setPhase("falling");
          }
        }
        break;
      }
      case "transitioning": {
        state.sceneOffset += (timestamp - state.lastTimestamp) / config.transitioningSpeed;

        const [nextPlatform] = thePlatformTheStickHits();
        if (state.sceneOffset > nextPlatform.x + nextPlatform.w - config.paddingX) {
          state.sceneOffset = nextPlatform.x + nextPlatform.w - config.paddingX;
          state.sticks.push({
            x: state.sticks.last().x + state.sticks.last().length,
            length: 0,
            rotation: 0
          });
          setPhase("waiting");
        }
        break;
      }
      case "falling": {
        if (state.sticks.last().rotation < 180)
          state.sticks.last().rotation += (timestamp - state.lastTimestamp) / config.turningSpeed;

        state.heroY += (timestamp - state.lastTimestamp) / config.fallingSpeed;
        const maxHeroY =
          config.platformHeight + 100 + (window.innerHeight - config.canvasHeight) / 2;
        if (state.heroY > maxHeroY) {
          setRestartButton({ style: { display: "block" } });
          return;
        }
        break;
      }
      default:
        throw Error("Wrong phase");
    }

    state.lastTimestamp = timestamp;
    draw();
    window.requestAnimationFrame(animate);
  }, [draw, generatePlatform, generateTree, phase, thePlatformTheStickHits]);

  useEffect(() => {
    resetGame();

    const handleKeydown = (event) => {
      if (event.key === " ") {
        event.preventDefault();
        resetGame();
      }
    };

    const handleMousedown = () => {
      if (phase === "waiting") {
        setPhase("stretching");
        window.requestAnimationFrame(animate);
      }
    };

    const handleMouseup = () => {
      if (phase === "stretching") {
        setPhase("turning");
      }
    };

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
      draw();
    };

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("mousedown", handleMousedown);
    window.addEventListener("mouseup", handleMouseup);
    window.addEventListener("resize", handleResize);
    window.addEventListener("touchstart", handleMousedown);
    window.addEventListener("touchend", handleMouseup);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("mousedown", handleMousedown);
      window.removeEventListener("mouseup", handleMouseup);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("touchstart", handleMousedown);
      window.removeEventListener("touchend", handleMouseup);
    };
  }, [animate, draw, phase, resetGame]);

  return {
    canvasRef,
    score,
    perfectElement,
    restartButton,
    resetGame,
    draw,
  };
}