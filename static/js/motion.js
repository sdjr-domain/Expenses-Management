"use strict";

import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@latest/dist/motion.js";

/**
 * Spendly Motion System
 * Migrated to Motion One for high-performance micro-interactions.
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Internal Utilities ---

function indianFormat(num) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    let x = num.toString();
    let lastThree = x.substring(x.length - 3);
    let otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers !== '') {
        lastThree = ',' + lastThree;
    }
    let res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return res + lastThree;
}

function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

// --- Core API ---

const Motion = {
    /**
     * Triggers a reveal animation.
     */
    reveal: function(el) {
        if (reduceMotion) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            return;
        }
        animate(el, { opacity: [0, 1], y: [14, 0] }, {
            duration: 0.36,
            easing: [0.16, 1, 0.3, 1]
        });
    },

    /**
     * Manages the logo state and corresponding animations.
     * @param {'idle'|'loading'|'processing'|'success'} state
     */
    setBrandState: function(state) {
        const logo = document.querySelector('.brand-mark');
        if (!logo) return;

        logo.setAttribute('data-state', state);

        if (reduceMotion) return;

        if (state === 'loading') {
            animate(logo, { opacity: [1, 0.55], scale: [1, 0.92] }, {
                duration: 0.55,
                easing: "ease-in-out",
                repeat: Infinity,
                direction: "alternate"
            });
        } else if (state === 'processing') {
            animate(logo, { rotate: 360 }, {
                duration: 0.9,
                easing: "linear",
                repeat: Infinity
            });
        } else if (state === 'success') {
            animate(logo, { scale: [1, 1.18, 1] }, {
                duration: 0.56,
                easing: [0.34, 1.56, 0.64, 1]
            });
            this._handleSuccessCheckmark(logo);
        } else {
            // Reset to idle - stop all animations
            animate(logo, { opacity: 1, scale: 1, rotate: 0 }, { duration: 0.2 });
        }
    },

    /**
     * Spawns a slide-in notification toast.
     */
    toast: function(message, kind = 'success') {
        const toast = document.createElement('div');
        toast.className = `motion-toast motion-toast--${kind}`;
        toast.innerHTML = `
            <div class="motion-toast-content">${message}</div>
            <div class="motion-toast-progress"></div>
        `;

        document.body.appendChild(toast);
        const progress = toast.querySelector('.motion-toast-progress');

        if (reduceMotion) {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
            progress.style.transform = 'scaleX(0)';
        } else {
            animate(toast, { x: [16, 0], opacity: [0, 1] }, { duration: 0.2 });
            animate(progress, { scaleX: [1, 0] }, { duration: 3.2, easing: "linear" });
        }

        setTimeout(async () => {
            if (reduceMotion) {
                toast.remove();
            } else {
                await animate(toast, { opacity: 0 }, { duration: 0.2 });
                toast.remove();
            }
        }, 3200);
    },

    /**
     * Animates a number from 0 to the target value.
     */
    countUp: function(el, to) {
        if (reduceMotion) {
            el.textContent = '₹' + indianFormat(to);
            return;
        }

        animate(0, to, {
            duration: 0.56,
            onUpdate: (v) => {
                el.textContent = '₹' + indianFormat(Math.floor(v));
            }
        });
    },

    _handleSuccessCheckmark: function(logo) {
        const check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        check.setAttribute("viewBox", "0 0 24 24");
        check.setAttribute("class", "brand-checkmark");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M5 13l4 4L19 7");
        path.setAttribute("stroke", "var(--accent)");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");

        const length = 20;
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        check.appendChild(path);
        logo.appendChild(check);

        if (!reduceMotion) {
            animate(path, { strokeDashoffset: [length, 0] }, { duration: 0.36, easing: [0.16, 1, 0.3, 1] });
        }

        setTimeout(() => {
            if (reduceMotion) {
                check.remove();
                this.setBrandState('idle');
            } else {
                animate(check, { opacity: 0 }, { duration: 0.3 }).finished.then(() => {
                    check.remove();
                    this.setBrandState('idle');
                });
            }
        }, 700);
    }
};

// --- Global Orchestration ---

async function init() {
    // 1. Page Entrance
    if (reduceMotion) {
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
    } else {
        await animate('body', { opacity: [0, 1], y: [8, 0] }, { duration: 0.56, easing: [0.16, 1, 0.3, 1] });
    }

    // 2. Exit Interception
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (anchor.target === '_blank') return;
        if (e.ctrlKey || e.metaKey) return;

        try {
            const url = new URL(href, window.location.href);
            if (url.origin !== window.location.origin) return;
        } catch (err) { return; }

        e.preventDefault();

        if (reduceMotion) {
            window.location.href = href;
        } else {
            animate('body', { opacity: 0, y: -6, scale: 0.992 }, { duration: 0.42, easing: [0.65, 0, 0.35, 1] }).finished.then(() => {
                window.location.href = href;
            });
        }
    });

    // 3. IntersectionObserver for reveals and count-ups
    if (!reduceMotion) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    if (target.classList.contains('reveal') ||
                        target.classList.contains('reveal-up') ||
                        target.classList.contains('reveal-down') ||
                        target.classList.contains('reveal-left') ||
                        target.classList.contains('reveal-right') ||
                        target.classList.contains('reveal-scale') ||
                        target.classList.contains('reveal-rotate')) {

                        // Add a small stagger based on index for a more natural feel
                        setTimeout(() => {
                            Motion.reveal(target);
                        }, index * 50);
                    }
                    if (target.dataset.countTo) {
                        Motion.countUp(target, parseFloat(target.dataset.countTo));
                    }
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

        document.querySelectorAll('.reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, [data-count-to]').forEach(el => observer.observe(el));
    } else {
        document.querySelectorAll('.reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
        document.querySelectorAll('[data-count-to]').forEach(el => {
            el.textContent = '₹' + indianFormat(el.dataset.countTo);
        });
    }

    // 4. Staggered entrance for .reveal elements on load
    if (!reduceMotion) {
        const reveals = document.querySelectorAll('.reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate');
        if (reveals.length > 0) {
            stagger(reveals, { opacity: [0, 1], y: [14, 0] }, {
                duration: 0.36,
                easing: [0.16, 1, 0.3, 1],
                delay: 0.045 // --stagger-step
            });
        }
    }
}

// Expose API and initialize
window.Motion = Motion;
window.addEventListener('DOMContentLoaded', init);
