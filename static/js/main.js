document.addEventListener('DOMContentLoaded', () => {
    // Initialize Background Animation Manager
    const animationContainer = document.getElementById('global-animation-field');
    let animationManager = null;
    if (animationContainer) {
        animationManager = new BackgroundAnimationManager(animationContainer);
        animationManager.register('embers', EmberAnimation);
    }

    // Ember Effect Toggle Logic
    const emberToggleInput = document.getElementById('coin-toggle');
    if (emberToggleInput && animationManager) {
        const updateEmberVisibility = (enabled) => {
            if (enabled) {
                animationManager.startAnimation('embers');
            } else {
                animationManager.stopAll();
            }
            emberToggleInput.checked = enabled;
        };

        let embersEnabled = localStorage.getItem('embers-enabled') !== 'false';
        updateEmberVisibility(embersEnabled);

        emberToggleInput.addEventListener('change', () => {
            embersEnabled = emberToggleInput.checked;
            localStorage.setItem('embers-enabled', embersEnabled);
            updateEmberVisibility(embersEnabled);
        });
    }

    const themeToggleBtn = document.getElementById('theme-toggle');

    if (!themeToggleBtn) return;

    themeToggleBtn.addEventListener('click', () => {
        // Toggle the dark class on the html element
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    });

});

/**
 * Logo Animation Controller
 * Triggers the high-fidelity motion states designed in Figma
 */
const LogoAnimation = {
    elements: {
        containers: document.querySelectorAll('.logo-container'),
        halos: document.querySelectorAll('.logo-processing-halo'),
        coins: document.querySelectorAll('.logo-success-coin'),
    },

    setLoading() {
        this.elements.containers.forEach(el => el.classList.add('logo-loading'));
    },

    setProcessing() {
        this.elements.halos.forEach(el => el.classList.remove('hidden'));
    },

    setSuccess() {
        this.elements.coins.forEach(el => el.classList.remove('hidden'));
        // Return to normal after animation finishes (0.7s)
        setTimeout(() => this.reset(), 700);
    },

    reset() {
        this.elements.containers.forEach(el => el.classList.remove('logo-loading'));
        this.elements.halos.forEach(el => el.classList.add('hidden'));
        this.elements.coins.forEach(el => el.classList.add('hidden'));
    }
};

// Trigger loading animation on form submissions
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', () => {
        LogoAnimation.setLoading();
        // If the form takes a while, we can transition to processing
        setTimeout(() => LogoAnimation.setProcessing(), 650);
    });
});

// Trigger success animation if there's a success flash message on load
window.addEventListener('load', () => {
    const successMsg = document.querySelector('.bg-emerald-50, .dark\\:bg-emerald-900\\/20');
    if (successMsg) {
        LogoAnimation.setSuccess();
    }
});
