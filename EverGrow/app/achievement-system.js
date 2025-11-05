const ACHIEVEMENTS = [
    {
        id: 'first-growth',
        name: 'First Sprout',
        description: 'Generate 50 biomass in total.',
        condition: (state) => state.totalBiomass >= 50,
    },
    {
        id: 'click-master',
        name: 'Click Master',
        description: 'Reach 10 biomass per click.',
        condition: (state) => state.growthPerClick >= 10,
    },
    {
        id: 'automated',
        name: 'Automation Station',
        description: 'Produce 100 biomass per second.',
        condition: (state) => state.growthPerSecond >= 100,
    },
    {
        id: 'prestiged',
        name: 'New Cycle',
        description: 'Complete a prestige reset.',
        condition: (state) => state.prestigePoints > 0,
    },
    {
        id: 'planetary',
        name: 'Planetary Guardian',
        description: 'Reach a total of 100,000 biomass.',
        condition: (state) => state.totalBiomass >= 100000,
    },
];

export class AchievementSystem {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    evaluate() {
        const state = this.stateManager.getState();
        const unlocked = [];
        this.stateManager.mutate((draft) => {
            for (const achievement of ACHIEVEMENTS) {
                const alreadyUnlocked = draft.achievements[achievement.id]?.unlocked;
                if (alreadyUnlocked) continue;
                if (achievement.condition(draft)) {
                    draft.achievements[achievement.id] = {
                        unlocked: true,
                        unlockedAt: Date.now(),
                    };
                    unlocked.push(achievement);
                }
            }
            return draft;
        });
        if (unlocked.length) {
            this.stateManager.recordSave();
        }
        return unlocked;
    }

    getAchievements(state) {
        return ACHIEVEMENTS.map((achievement) => ({
            ...achievement,
            unlocked: state.achievements[achievement.id]?.unlocked ?? false,
        }));
    }
}
