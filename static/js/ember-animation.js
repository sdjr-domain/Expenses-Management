/**
 * EmberAnimation - Glowing ember field animated background
 */
class EmberAnimation {
    constructor(container) {
        if (!container) {
            console.error("EmberAnimation: Container element not found.");
            return;
        }
        this.container = container;
        this.embers = [];
        this.animationFrameId = null;
        this.isRunning = false;
        this.W = 0;
        this.H = 0;
        this.ctx = null;
        this.canvas = null;

        this.mouse = {
            x: -9999,
            y: -9999,
            active: false,
            tx: -9999,
            ty: -9999
        };

        this.init();
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'emberCanvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.inset = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';

        // Ensure container is relative and hidden
        if (getComputedStyle(this.container).position === 'static') {
            this.container.style.position = 'relative';
        }
        this.container.style.overflow = 'hidden';

        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.container);

        this.setupEventListeners();
        this.handleResize();
    }

    setupEventListeners() {
        window.addEventListener('mousemove', (e) => {
            const r = this.container.getBoundingClientRect();
            this.mouse.tx = e.clientX - r.left;
            this.mouse.ty = e.clientY - r.top;
            this.mouse.active = true;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.active = false;
        });

        window.addEventListener('touchmove', (e) => {
            const r = this.container.getBoundingClientRect();
            const t = e.touches[0];
            this.mouse.tx = t.clientX - r.left;
            this.mouse.ty = t.clientY - r.top;
            this.mouse.active = true;
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.mouse.active = false;
        });
    }

    handleResize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.container.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.W = rect.width;
        this.H = rect.height;

        if (this.isRunning) {
            this.initEmbers();
        }
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        const num = parseInt(hex, 16);
        return [
            (num >> 16) & 255,
            (num >> 8) & 255,
            num & 255
        ];
    }

    isDarkMode() {
        return document.documentElement.classList.contains('dark');
    }

    makeEmber(randomY) {
        return {
            x: Math.random() * this.W,
            y: randomY ? Math.random() * this.H : this.H + 20,
            r: 1.2 + Math.random() * 2.4,
            speed: 0.10 + Math.random() * 0.24,
            drift: (Math.random() - 0.5) * 0.15,
            opacity: 0.25 + Math.random() * 0.45,
            flicker: Math.random() * Math.PI * 2,
            flickerSpeed: 0.02 + Math.random() * 0.03,
        };
    }

    initEmbers() {
        this.embers = [];
        for (let i = 0; i < 90; i++) {
            this.embers.push(this.makeEmber(true));
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.initEmbers();
        this.animationLoop();
    }

    animationLoop() {
        if (!this.isRunning) return;
        this.draw();
        this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
    }

    draw() {
        const isDark = this.isDarkMode();
        this.ctx.clearRect(0, 0, this.W, this.H);

        this.ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over';

        this.mouse.x = this.lerp(this.mouse.x === -9999 ? this.mouse.tx : this.mouse.x, this.mouse.tx, 0.12);
        this.mouse.y = this.lerp(this.mouse.y === -9999 ? this.mouse.ty : this.mouse.y, this.mouse.ty, 0.12);

        const rgb = isDark ? this.hexToRgb('#3dbf8f') : this.hexToRgb('#0e8a5f');
        const goldRgb = this.hexToRgb('#e0b155');

        this.embers.forEach((p, idx) => {
            p.y -= p.speed;
            p.x += p.drift;
            p.flicker += p.flickerSpeed;

            if (this.mouse.active) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const radius = 150;

                if (dist < radius) {
                    const pull = (1 - dist / radius) * 0.9;
                    p.x += (dx / dist) * pull;
                    p.y += (dy / dist) * pull;
                }
            }

            if (p.y < -20) Object.assign(p, this.makeEmber(false));
            if (p.x < -20) p.x = this.W + 20;
            if (p.x > this.W + 20) p.x = -20;

            const flick = 0.6 + 0.4 * Math.sin(p.flicker);
            const useGold = idx % 5 === 0;
            const c = useGold ? goldRgb : rgb;
            const op = p.opacity * flick * (isDark ? 1 : 0.7);

            const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
            grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${op})`);
            grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.min(1, op * 1.8)})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.globalCompositeOperation = 'source-over';
    }

    destroy() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.resizeObserver.disconnect();
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.W, this.H);
            this.canvas.remove();
        }
    }
}
