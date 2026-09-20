/**
 * BackgroundAnimationManager - Manages multiple background animations
 * Ensures mutual exclusion: only one animation active at a time.
 */
class BackgroundAnimationManager {
    constructor(container) {
        if (!container) {
            console.error("BackgroundAnimationManager: Container element not found.");
            return;
        }
        this.container = container;
        this.registry = {};
        this.activeInstance = null;
        this.activeId = null;
    }

    /**
     * Register an animation class with a unique ID
     * @param {string} id
     * @param {class} AnimationClass
     */
    register(id, AnimationClass) {
        this.registry[id] = AnimationClass;
    }

    /**
     * Starts a specific animation. Stops any currently active animation first.
     * @param {string} id
     */
    startAnimation(id) {
        if (this.activeId === id && this.activeInstance) return;

        // Stop current animation if one is running
        this.stopAll();

        const AnimationClass = this.registry[id];
        if (!AnimationClass) {
            console.error(`BackgroundAnimationManager: Animation '${id}' not registered.`);
            return;
        }

        console.log(`BackgroundAnimationManager: Starting animation '${id}'...`);
        this.activeInstance = new AnimationClass(this.container);
        this.activeInstance.start();
        this.activeId = id;
    }

    /**
     * Stops any currently running background animation.
     */
    stopAll() {
        if (this.activeInstance) {
            console.log(`BackgroundAnimationManager: Stopping animation '${this.activeId}'...`);
            this.activeInstance.destroy();
            this.activeInstance = null;
            this.activeId = null;
        }
    }
}
