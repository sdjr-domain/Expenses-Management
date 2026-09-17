/**
 * GoldCoinField - Interactive gold coin background effect
 */
class GoldCoinField {
    constructor(container, options = {}) {
        if (!container) {
            console.error("GoldCoinField: Container element not found.");
            return;
        }
        this.container = container;
        this.coinCount = Math.min(options.coinCount || 46, 100);
        this.currencySymbol = options.currencySymbol || '₹';
        this.springK = 0.06;
        this.damping = 0.86;
        this.pushRadius = 120;

        this.coins = [];
        this.mouse = { x: -1000, y: -1000 };
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.init();
    }

    init() {
        console.log("GoldCoinField: Initializing...");

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'gold-coin-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '0';

        // Ensure container is relative and has a height
        if (getComputedStyle(this.container).position === 'static') {
            this.container.style.position = 'relative';
        }
        this.container.style.overflow = 'hidden';

        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Use ResizeObserver to handle dynamic sizing properly
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.container);

        // Initial resize
        this.handleResize();

        // Input handlers
        window.addEventListener('mousemove', (e) => this.updateMouse(e));
        window.addEventListener('touchmove', (e) => {
            this.updateMouse(e.touches[0]);
        }, { passive: true });

        // Mouse leaves window - not needed for global field

        this.createCoins();
        this.animate();
        console.log("GoldCoinField: Animation loop started.");
    }

    updateMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (width === 0 || height === 0) return;

        this.canvas.width = width;
        this.canvas.height = height;

        // Update coins' home positions to fit new size
        this.coins.forEach(coin => {
            coin.homeX = Math.random() * width;
            coin.homeY = Math.random() * height;
            coin.x = coin.homeX;
            coin.y = coin.homeY;
        });
    }

    createCoins() {
        this.coins = [];
        const width = this.canvas.width || window.innerWidth;
        const height = this.canvas.height || window.innerHeight;

        for (let i = 0; i < this.coinCount; i++) {
            const radius = 9 + Math.random() * 13;
            this.coins.push({
                homeX: Math.random() * width,
                homeY: Math.random() * height,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                radius: radius,
                opacity: 0.5 + Math.random() * 0.4,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                bobOffset: Math.random() * Math.PI * 2,
                bobSpeed: 0.001 + Math.random() * 0.002,
                rotVel: 0
            });
            const coin = this.coins[i];
            coin.x = coin.homeX;
            coin.y = coin.homeY;
        }
    }

    animate(time) {
        if (this.isReducedMotion) {
            this.draw(time);
        } else {
            this.update(time);
            this.draw(time);
        }
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    update(time) {
        const isDarkMode = document.documentElement.classList.contains('dark');

        this.coins.forEach(coin => {
            // 1. Bobbing
            const bob = Math.sin((time || 0) * coin.bobSpeed + coin.bobOffset) * 5;
            const targetY = coin.homeY + bob;
            const targetX = coin.homeX;

            // 2. Mouse Push
            const dx = coin.x - this.mouse.x;
            const dy = coin.y - this.mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < this.pushRadius * this.pushRadius) {
                const dist = Math.sqrt(distSq);
                const force = (this.pushRadius - dist) / this.pushRadius;
                const angle = Math.atan2(dy, dx);

                coin.vx += Math.cos(angle) * force * 2;
                coin.vy += Math.sin(angle) * force * 2;
                coin.rotVel += (Math.random() - 0.5) * 0.1 * force;
            }

            // 3. Spring Physics
            const ax = (targetX - coin.x) * this.springK;
            const ay = (targetY - coin.y) * this.springK;

            coin.vx += ax;
            coin.vy += ay;
            coin.vx *= this.damping;
            coin.vy *= this.damping;

            coin.x += coin.vx;
            coin.y += coin.vy;

            coin.rotation += coin.rotationSpeed + coin.rotVel;
            coin.rotVel *= 0.95;
        });
    }

    draw(time) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const isDarkMode = document.documentElement.classList.contains('dark');
        const opacityMultiplier = isDarkMode ? 0.85 : 1.0;

        this.coins.forEach(coin => {
            this.ctx.save();
            this.ctx.translate(coin.x, coin.y);
            this.ctx.rotate(coin.rotation);
            this.ctx.globalAlpha = coin.opacity * opacityMultiplier;

            const grad = this.ctx.createRadialGradient(
                -coin.radius * 0.3, -coin.radius * 0.3, coin.radius * 0.1,
                0, 0, coin.radius
            );
            grad.addColorStop(0, '#FFEEAA');
            grad.addColorStop(0.5, '#D6A83E');
            grad.addColorStop(1, '#966C1E');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, coin.radius * 0.8, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.fillStyle = '#966C1E';
            this.ctx.font = `bold ${coin.radius * 0.8}px Inter, sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.currencySymbol, 0, 0);

            this.ctx.restore();
        });
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
        this.resizeObserver.disconnect();
        this.canvas.remove();
    }
}
