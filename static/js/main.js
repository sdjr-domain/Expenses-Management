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
    },

    setState(state) {
        const states = ['idle', 'processing', 'success'];
        this.elements.containers.forEach(container => {
            states.forEach(s => container.classList.remove(`logo-state-${s}`));
            container.classList.add(`logo-state-${state}`);
        });
    },

    setLoading() { this.setState('processing'); },
    setProcessing() { this.setState('processing'); },
    setSuccess() {
        this.setState('success');
        // Return to normal after animation finishes (0.8s)
        setTimeout(() => this.setState('idle'), 800);
    },
    reset() { this.setState('idle'); }
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
