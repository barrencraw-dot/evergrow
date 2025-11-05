const EVENT_INTERVAL = 5 * 60 * 1000; // 5 minutes
const EVENT_DURATION = 60 * 1000; // 1 minute

const EVENTS = [
    {
        id: 'solar-flare',
        title: 'Solar Flare',
        description: 'All production doubled for one minute.',
        multiplier: 2,
    },
    {
        id: 'seed-rain',
        title: 'Seed Rain',
        description: 'Clicks grant triple biomass for one minute.',
        clickMultiplier: 3,
    },
    {
        id: 'time-rift',
        title: 'Time Rift',
        description: 'Instantly gain 60 seconds of passive production.',
        instantSeconds: 60,
    },
];

export class EventSystem {
    constructor(stateManager, progression) {
        this.stateManager = stateManager;
        this.progression = progression;
        this.activeEvent = null;
    }

    update() {
        const state = this.stateManager.getState();
        const now = Date.now();

        if (this.activeEvent && now >= this.activeEvent.endsAt) {
            this._endEvent();
        }

        if (now - state.lastEventCheck < EVENT_INTERVAL || this.activeEvent) {
            return;
        }

        const shouldTrigger = Math.random() < 0.2;
        this.stateManager.mutate((draft) => {
            draft.lastEventCheck = now;
            return draft;
        });

        if (!shouldTrigger) {
            return;
        }

        const event = this._createEvent();
        this._applyEvent(event);
    }

    _createEvent() {
        const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        return {
            ...event,
            startedAt: Date.now(),
            endsAt: Date.now() + EVENT_DURATION,
        };
    }

    _applyEvent(event) {
        this.activeEvent = event;
        this.stateManager.mutate((draft) => {
            const snapshot = {
                growthPerSecond: draft.growthPerSecond,
                growthPerClick: draft.growthPerClick,
                clickMultiplier: draft.clickMultiplier,
            };
            if (event.instantSeconds) {
                const gain = draft.growthPerSecond * event.instantSeconds;
                draft.biomass += gain;
                draft.totalBiomass += gain;
            }
            if (event.multiplier) {
                draft.growthPerSecond *= event.multiplier;
                draft.growthPerClick *= event.multiplier;
                draft.clickMultiplier *= event.multiplier;
            }
            if (event.clickMultiplier) {
                draft.growthPerClick *= event.clickMultiplier;
                draft.clickMultiplier *= event.clickMultiplier;
            }
            draft.event = {
                ...event,
                snapshot,
            };
            return draft;
        });
    }

    _endEvent() {
        const event = this.activeEvent;
        this.activeEvent = null;
        if (!event) return;

        this.stateManager.mutate((draft) => {
            if (draft.event?.id !== event.id) {
                draft.event = null;
                return draft;
            }
            draft.growthPerSecond = draft.event.snapshot.growthPerSecond;
            draft.growthPerClick = draft.event.snapshot.growthPerClick;
            draft.clickMultiplier = draft.event.snapshot.clickMultiplier;
            draft.event = null;
            return draft;
        });
    }
}
