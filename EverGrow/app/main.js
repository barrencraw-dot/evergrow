import { StateManager } from './state-manager.js';
import { ProgressionSystem } from './progression-system.js';
import { AchievementSystem } from './achievement-system.js';
import { StreakSystem } from './streak-system.js';
import { EventSystem } from './event-system.js';
import { UIManager } from './ui-manager.js';

const TICK_RATE = 1000 / 20;

class EverGrowGame {
    constructor() {
        this.stateManager = new StateManager();
        this.progression = new ProgressionSystem(this.stateManager);
        this.achievements = new AchievementSystem(this.stateManager);
        this.streakSystem = new StreakSystem(this.stateManager);
        this.eventSystem = new EventSystem(this.stateManager, this.progression);
        this.ui = new UIManager({
            stateManager: this.stateManager,
            progression: this.progression,
            achievements: this.achievements,
        });

        this.stateManager.addListener((state) => {
            this.ui.render(state);
        });

        this.stateManager.addListener((state) => {
            if (state.lastSave !== this.lastSaveRender) {
                this.ui.showSaveFeedback();
                this.lastSaveRender = state.lastSave;
            }
        });

        this.lastFrame = performance.now();
        requestAnimationFrame(this._loop.bind(this));

        this.progression.recalculateFromState();
        this.streakSystem.evaluate();
        const unlocked = this.achievements.evaluate();
        if (unlocked.length) {
            this.ui.showUnlockedMessage(unlocked);
        }

        setInterval(() => {
            const unlockedAchievements = this.achievements.evaluate();
            if (unlockedAchievements.length) {
                this.ui.showUnlockedMessage(unlockedAchievements);
            }
        }, 5000);
    }

    _loop(now) {
        const delta = now - this.lastFrame;
        if (delta >= TICK_RATE) {
            const state = this.stateManager.getState();
            const deltaSeconds = delta / 1000;
            this.progression.handleTick(state, deltaSeconds);
            this.eventSystem.update();
            this.ui.render(this.stateManager.getState());
            this.lastFrame = now;
        }
        requestAnimationFrame(this._loop.bind(this));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new EverGrowGame();
});
