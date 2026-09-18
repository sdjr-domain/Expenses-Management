document.addEventListener('DOMContentLoaded', () => {
    // Initialize Global Gold Coin Effect
    const globalCoinField = document.getElementById('global-coin-field');
    if (globalCoinField) {
        new GoldCoinField(globalCoinField, {
            coinCount: 46,
            currencySymbol: '₹'
        });
    }

    // Initialize Global Ember Effect
    const globalEmberField = document.getElementById('global-ember-field');
    if (globalEmberField) {
        new EmberField(globalEmberField, {
            emberCount: 90
        });
    }

    // Animation Toggle Logic (Mutually Exclusive)
    const coinToggleInput = document.getElementById('coin-toggle');
    const emberToggleInput = document.getElementById('ember-toggle');

    if (coinToggleInput && emberToggleInput) {
        const updateVisibility = (coinsEnabled, embersEnabled) => {
            const coinField = document.getElementById('global-coin-field');
            const emberField = document.getElementById('global-ember-field');

            if (coinField) coinField.style.display = coinsEnabled ? 'block' : 'none';
            if (emberField) emberField.style.display = embersEnabled ? 'block' : 'none';

            coinToggleInput.checked = coinsEnabled;
            emberToggleInput.checked = embersEnabled;
        };

        // Load initial states
        let coinsEnabled = localStorage.getItem('coins-enabled') !== 'false';
        let embersEnabled = localStorage.getItem('embers-enabled') === 'true';

        // Ensure only one is enabled on load
        if (embersEnabled) coinsEnabled = false;

        updateVisibility(coinsEnabled, embersEnabled);

        coinToggleInput.addEventListener('change', () => {
            coinsEnabled = coinToggleInput.checked;
            if (coinsEnabled) {
                embersEnabled = false;
                emberToggleInput.checked = false;
                localStorage.setItem('embers-enabled', 'false');
            }
            localStorage.setItem('coins-enabled', coinsEnabled);
            updateVisibility(coinsEnabled, embersEnabled);
        });

        emberToggleInput.addEventListener('change', () => {
            embersEnabled = emberToggleInput.checked;
            if (embersEnabled) {
                coinsEnabled = false;
                coinToggleInput.checked = false;
                localStorage.setItem('coins-enabled', 'false');
            }
            localStorage.setItem('embers-enabled', embersEnabled);
            updateVisibility(coinsEnabled, embersEnabled);
        });
    }


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
