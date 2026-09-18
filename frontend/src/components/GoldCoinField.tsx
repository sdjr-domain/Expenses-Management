import React, { useEffect, useRef } from 'react';

interface GoldCoinFieldProps {
  coinCount?: number;
  currencySymbol?: string;
}

interface Coin {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  bobOffset: number;
  bobSpeed: number;
  rotVel: number;
}

export const GoldCoinField: React.FC<GoldCoinFieldProps> = ({
  coinCount = 46,
  currencySymbol = '₹'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const coinsRef = useRef<Coin[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const springK = 0.06;
  const damping = 0.86;
  const pushRadius = 120;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      canvas.width = width;
      canvas.height = height;

      // Initialize or update coins
      const currentCoins = coinsRef.current;
      if (currentCoins.length === 0) {
        const newCoins: Coin[] = [];
        for (let i = 0; i < coinCount; i++) {
          const radius = 9 + Math.random() * 13;
          const homeX = Math.random() * width;
          const homeY = Math.random() * height;
          newCoins.push({
            homeX,
            homeY,
            x: homeX,
            y: homeY,
            vx: 0,
            vy: 0,
            radius,
            opacity: 0.5 + Math.random() * 0.4,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            bobOffset: Math.random() * Math.PI * 2,
            bobSpeed: 0.001 + Math.random() * 0.002,
            rotVel: 0,
          });
        }
        coinsRef.current = newCoins;
      } else {
        coinsRef.current.forEach(coin => {
          coin.homeX = Math.random() * width;
          coin.homeY = Math.random() * height;
          coin.x = coin.homeX;
          coin.y = coin.homeY;
        });
      }
    };

    const updateMouse = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
        mouseRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      } else {
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    };

    const animate = (time: number) => {
      const isDarkMode = document.documentElement.classList.contains('dark');

      // 1. Update physics
      coinsRef.current.forEach(coin => {
        const bob = Math.sin(time * coin.bobSpeed + coin.bobOffset) * 5;
        const targetY = coin.homeY + bob;
        const targetX = coin.homeX;

        const dx = coin.x - mouseRef.current.x;
        const dy = coin.y - mouseRef.current.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < pushRadius * pushRadius) {
          const dist = Math.sqrt(distSq);
          const force = (pushRadius - dist) / pushRadius;
          const angle = Math.atan2(dy, dx);
          coin.vx += Math.cos(angle) * force * 2;
          coin.vy += Math.sin(angle) * force * 2;
          coin.rotVel += (Math.random() - 0.5) * 0.1 * force;
        }

        const ax = (targetX - coin.x) * springK;
        const ay = (targetY - coin.y) * springK;

        coin.vx += ax;
        coin.vy += ay;
        coin.vx *= damping;
        coin.vy *= damping;
        coin.x += coin.vx;
        coin.y += coin.vy;
        coin.rotation += coin.rotationSpeed + coin.rotVel;
        coin.rotVel *= 0.95;
      });

      // 2. Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const opacityMultiplier = isDarkMode ? 0.85 : 1.0;

      coinsRef.current.forEach(coin => {
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(coin.rotation);
        ctx.globalAlpha = coin.opacity * opacityMultiplier;

        const grad = ctx.createRadialGradient(
          -coin.radius * 0.3, -coin.radius * 0.3, coin.radius * 0.1,
          0, 0, coin.radius
        );
        grad.addColorStop(0, '#FFEEAA');
        grad.addColorStop(0.5, '#D6A83E');
        grad.addColorStop(1, '#966C1E');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#966C1E';
        ctx.font = `bold ${coin.radius * 0.8}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currencySymbol, 0, 0);
        ctx.restore();
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    window.addEventListener('mousemove', updateMouse);
    window.addEventListener('touchmove', updateMouse, { passive: true });
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', updateMouse);
      window.removeEventListener('touchmove', updateMouse);
      resizeObserver.disconnect();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [coinCount, currencySymbol]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};
