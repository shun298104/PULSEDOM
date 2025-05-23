import React, { useEffect, useRef, useState } from 'react';

interface SPO2CanvasProps {
  hr: number;
  bufferRef: React.MutableRefObject<{ getArray: () => number[] } | null>;
}

const SPO2Canvas: React.FC<SPO2CanvasProps> = ({ hr, bufferRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // ResizeObserverでサイズ監視
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bufferRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || size.width === 0 || size.height === 0) return;

    const baseline = size.height *2 / 3;
    const gain = size.height * 0.4;
    const stepMs = 20;

    let animationId: number;
    let lastDrawTime = performance.now();

    const DELAY = 35; // ← 適宜調整（SamplingRate = 200なら150ms程度）

    const draw = (time: number) => {
      const delta = time - lastDrawTime;
      if (delta >= stepMs) {
        lastDrawTime = time;

        const wave = bufferRef.current?.getArray() ?? [];
        const latestwave = wave.slice(-size.width - DELAY, -DELAY);

        ctx.clearRect(0, 0, size.width, size.height);
        ctx.beginPath();
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';

        for (let x = 0; x < latestwave.length; x++) {
          const y = baseline - latestwave[x] * gain;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [bufferRef, hr, size]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px]"
    >
      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        className="bg-black rounded-2xl"
      />
    </div>
  );
};

export default SPO2Canvas;
