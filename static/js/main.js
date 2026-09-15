document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    if (!themeToggleBtn) return;

    // Function to update icons based on current theme
    const updateIcons = () => {
        if (document.documentElement.classList.contains('dark')) {
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
        } else {
            darkIcon.classList.remove('hidden');
            lightIcon.classList.add('hidden');
        }
    };

    // Initialize icons
    updateIcons();

    themeToggleBtn.addEventListener('click', () => {
        // Toggle the dark class on the html element
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
        updateIcons();
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
