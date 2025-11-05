const ONE_DAY = 24 * 60 * 60 * 1000;

export class StreakSystem {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    evaluate() {
        const now = Date.now();
        this.stateManager.mutate((draft) => {
            const lastClaim = draft.streak.lastClaim;
            if (!lastClaim) {
                draft.streak.current = 1;
                draft.streak.longest = Math.max(draft.streak.longest, 1);
                draft.streak.lastClaim = now;
                return draft;
            }

            const diff = now - lastClaim;
            if (diff >= ONE_DAY && diff < ONE_DAY * 2) {
                draft.streak.current += 1;
                draft.streak.longest = Math.max(draft.streak.longest, draft.streak.current);
                draft.streak.lastClaim = now;
            } else if (diff >= ONE_DAY * 2) {
                draft.streak.current = 1;
                draft.streak.lastClaim = now;
            }
            return draft;
        });
    }

    getStreak(state) {
        return {
            current: state.streak.current,
            longest: state.streak.longest,
            lastClaim: state.streak.lastClaim,
        };
    }
}
