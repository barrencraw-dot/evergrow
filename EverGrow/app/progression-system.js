const UPGRADE_DEFINITIONS = [
    {
        id: 'photosynthesis',
        name: 'Photosynthesis Pods',
        description: 'Generate 1 biomass per second.',
        baseCost: 10,
        costScaling: 1.15,
        growthPerSecond: 1,
    },
    {
        id: 'rainmaker',
        name: 'Rainmaker Drones',
        description: 'Each drone adds 5 biomass per second.',
        baseCost: 75,
        costScaling: 1.18,
        growthPerSecond: 5,
    },
    {
        id: 'biosphere',
        name: 'Orbital Biosphere',
        description: 'Terraformers add 25 biomass per second.',
        baseCost: 350,
        costScaling: 1.2,
        growthPerSecond: 25,
    },
    {
        id: 'pulse',
        name: 'Pulse Amplifiers',
        description: 'Boost click strength by +1 per amplifier.',
        baseCost: 60,
        costScaling: 1.35,
        growthPerClick: 1,
    },
    {
        id: 'grove',
        name: 'Fractal Grove',
        description: 'Multiplies all production by 4%.',
        baseCost: 1200,
        costScaling: 1.4,
        multiplier: 0.04,
    },
];

export class ProgressionSystem {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    getUpgrades(state) {
        return UPGRADE_DEFINITIONS.map((definition) => {
            const owned = state.upgrades[definition.id]?.owned ?? 0;
            const cost = this._calculateCost(definition.baseCost, definition.costScaling, owned);
            return {
                ...definition,
                owned,
                cost,
            };
        });
    }

    purchase(id) {
        const definition = UPGRADE_DEFINITIONS.find((upgrade) => upgrade.id === id);
        if (!definition) {
            return false;
        }

        let purchased = false;

        this.stateManager.mutate((draft) => {
            const owned = draft.upgrades[id]?.owned ?? 0;
            const cost = this._calculateCost(definition.baseCost, definition.costScaling, owned);
            if (draft.biomass < cost) {
                return draft;
            }

            draft.biomass -= cost;
            draft.upgrades[id] = {
                owned: owned + 1,
            };

            this._recalculateProduction(draft);
            purchased = true;
            return draft;
        });

        if (purchased) {
            this.stateManager.recordSave();
        }

        return purchased;
    }

    handleTick(state, deltaSeconds) {
        const gain = state.growthPerSecond * deltaSeconds;
        if (gain <= 0) {
            return;
        }
        this.stateManager.mutate((draft) => {
            draft.biomass += gain;
            draft.totalBiomass += gain;
            draft.lastTick = Date.now();
            return draft;
        });
    }

    handleManualGrowth() {
        const state = this.stateManager.getState();
        const gain = state.growthPerClick;
        this.stateManager.mutate((draft) => {
            draft.biomass += gain;
            draft.totalBiomass += gain;
            draft.lastTick = Date.now();
            return draft;
        });
    }

    calculatePrestigeReady(state) {
        const threshold = state.prestigeReadyAt;
        return {
            progress: Math.min(state.biomass / threshold, 1),
            canPrestige: state.biomass >= threshold,
            reward: Math.floor(Math.sqrt(state.biomass / threshold) * 5),
        };
    }

    prestige() {
        const state = this.stateManager.getState();
        const { canPrestige, reward } = this.calculatePrestigeReady(state);
        if (!canPrestige || reward <= 0) {
            return false;
        }

        this.stateManager.mutate((draft) => {
            draft.biomass = 0;
            draft.growthPerSecond = 0;
            draft.totalBiomass = 0;
            draft.upgrades = {};
            draft.growthPerClick = 1;
            draft.clickMultiplier = 1;
            draft.prestigePoints += reward;
            draft.prestigeMultiplier += reward * 0.05;
            draft.prestigeReadyAt = Math.floor(draft.prestigeReadyAt * 2.5);
            draft.lastTick = Date.now();
            this._recalculateProduction(draft);
            return draft;
        });

        this.stateManager.recordSave();
        return true;
    }

    _calculateCost(base, scaling, owned) {
        return Math.ceil(base * Math.pow(scaling, owned));
    }

    _recalculateProduction(state) {
        let passive = 0;
        let click = 1;
        let multiplier = state.prestigeMultiplier;

        for (const definition of UPGRADE_DEFINITIONS) {
            const owned = state.upgrades[definition.id]?.owned ?? 0;
            if (!owned) continue;
            if (definition.growthPerSecond) {
                passive += definition.growthPerSecond * owned;
            }
            if (definition.growthPerClick) {
                click += definition.growthPerClick * owned;
            }
            if (definition.multiplier) {
                multiplier += definition.multiplier * owned;
            }
        }

        state.growthPerSecond = passive * multiplier;
        state.growthPerClick = click * multiplier;
        state.clickMultiplier = multiplier;
    }

    recalculateFromState() {
        this.stateManager.mutate((draft) => {
            this._recalculateProduction(draft);
            return draft;
        });
    }
}
