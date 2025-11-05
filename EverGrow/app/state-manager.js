const STORAGE_KEY = 'evergrow-save-v1';
const AUTO_SAVE_INTERVAL = 30000;

export class StateManager {
    constructor() {
        this.listeners = new Set();
        this.state = this._loadState();
        this._startAutosave();
    }

    getState() {
        return this.state;
    }

    update(partial) {
        this.state = {
            ...this.state,
            ...partial,
        };
        this._notify();
    }

    mutate(mutator) {
        this.state = mutator({ ...this.state });
        this._notify();
    }

    addListener(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    reset() {
        localStorage.removeItem(STORAGE_KEY);
        this.state = this._getDefaultState();
        this._notify();
    }

    recordSave() {
        this.update({ lastSave: Date.now() });
        this._persist();
    }

    _notify() {
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }

    _getDefaultState() {
        return {
            biomass: 0,
            totalBiomass: 0,
            growthPerSecond: 0,
            growthPerClick: 1,
            prestigePoints: 0,
            prestigeReadyAt: 5000,
            prestigeMultiplier: 1,
            clickMultiplier: 1,
            upgrades: {},
            achievements: {},
            streak: {
                current: 0,
                longest: 0,
                lastClaim: null,
            },
            event: null,
            lastEventCheck: Date.now(),
            lastTick: Date.now(),
            lastSave: Date.now(),
        };
    }

    _loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return this._getDefaultState();
            }
            const parsed = JSON.parse(raw);
            return { ...this._getDefaultState(), ...parsed };
        } catch (error) {
            console.error('Failed to load save', error);
            return this._getDefaultState();
        }
    }

    _persist() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to persist save', error);
        }
    }

    _startAutosave() {
        setInterval(() => {
            this.recordSave();
        }, AUTO_SAVE_INTERVAL);
    }
}
