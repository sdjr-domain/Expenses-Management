import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

interface Ember {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  opacity: number;
  flicker: number;
  flickerSpeed: number;
}

const EmberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const embersRef = useRef<Ember[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false, tx: -9999, ty: -9999 });

  const { isDarkMode } = useThemeStore();

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const hexToRgb = (hex: string) => {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
    const num = parseInt(cleanHex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const makeEmber = (W: number, H: number, randomY = false): Ember => ({
    x: Math.random() * W,
    y: randomY ? Math.random() * H : H + 20,
    r: 1.2 + Math.random() * 2.4,
    speed: 0.10 + Math.random() * 0.24,
    drift: (Math.random() - 0.5) * 0.15,
    opacity: 0.25 + Math.random() * 0.45,
    flicker: Math.random() * Math.PI * 2,
    flickerSpeed: 0.02 + Math.random() * 0.03,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const W = rect.width;
      const H = rect.height;

      embersRef.current = [];
      for (let i = 0; i < 90; i++) {
        embersRef.current.push(makeEmber(W, H, true));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.tx = e.clientX - rect.left;
      mouseRef.current.ty = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.tx = touch.clientX - rect.left;
      mouseRef.current.ty = touch.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    const animate = () => {
      const rect = container.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = isDarkMode ? 'lighter' : 'source-over';

      mouseRef.current.x = lerp(mouseRef.current.x === -9999 ? mouseRef.current.tx : mouseRef.current.x, mouseRef.current.tx, 0.12);
      mouseRef.current.y = lerp(mouseRef.current.y === -9999 ? mouseRef.current.ty : mouseRef.current.y, mouseRef.current.ty, 0.12);

      const rgb = isDarkMode ? hexToRgb('#3dbf8f') : hexToRgb('#0e8a5f');
      const goldRgb = hexToRgb('#e0b155');

      embersRef.current.forEach((p, idx) => {
        p.y -= p.speed;
        p.x += p.drift;
        p.flicker += p.flickerSpeed;

        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const radius = 150;
          if (dist < radius) {
            const pull = (1 - dist / radius) * 0.9;
            p.x += (dx / dist) * pull;
            p.y += (dy / dist) * pull;
          }
        }

        if (p.y < -20) {
          Object.assign(p, makeEmber(W, H, false));
        }
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;

        const flick = 0.6 + 0.4 * Math.sin(p.flicker);
        const useGold = idx % 5 === 0;
        const c = useGold ? goldRgb : rgb;
        const op = p.opacity * flick * (isDarkMode ? 1 : 0.7);

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${op})`);
        grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.min(1, op * 1.8)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    handleResize();
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isDarkMode]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default EmberBackground;
