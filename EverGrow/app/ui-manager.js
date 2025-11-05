const numberFormatter = new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 2,
});

export class UIManager {
    constructor({
        stateManager,
        progression,
        achievements,
    }) {
        this.stateManager = stateManager;
        this.progression = progression;
        this.achievements = achievements;

        this.elements = {
            biomass: document.getElementById('biomass'),
            growthPerSecond: document.getElementById('growth-per-second'),
            growthPerClick: document.getElementById('growth-per-click'),
            growButton: document.getElementById('grow-button'),
            upgradeList: document.getElementById('upgrade-list'),
            achievementList: document.getElementById('achievement-list'),
            streak: document.getElementById('streak'),
            event: document.getElementById('event'),
            prestigeProgress: document.getElementById('prestige-progress'),
            prestigeHint: document.getElementById('prestige-hint'),
            prestigeButton: document.getElementById('prestige-button'),
            saveStatus: document.getElementById('save-status'),
            resetButton: document.getElementById('reset-save'),
        };

        this._bindEvents();
        this.render(this.stateManager.getState());
    }

    render(state) {
        this.elements.biomass.textContent = numberFormatter.format(state.biomass);
        this.elements.growthPerSecond.textContent = numberFormatter.format(state.growthPerSecond);
        this.elements.growthPerClick.textContent = numberFormatter.format(state.growthPerClick);

        this._renderUpgrades(state);
        this._renderAchievements(state);
        this._renderStreak(state);
        this._renderEvent(state);
        this._renderPrestige(state);
    }

    showSaveFeedback() {
        const timestamp = new Date().toLocaleTimeString();
        this.elements.saveStatus.textContent = `Saved at ${timestamp}`;
        setTimeout(() => {
            if (this.elements.saveStatus.textContent?.startsWith('Saved')) {
                this.elements.saveStatus.textContent = '';
            }
        }, 5000);
    }

    showUnlockedMessage(unlocked) {
        if (!unlocked.length) return;
        const names = unlocked.map((a) => a.name).join(', ');
        this.elements.saveStatus.textContent = `Unlocked: ${names}`;
        setTimeout(() => {
            if (this.elements.saveStatus.textContent?.startsWith('Unlocked')) {
                this.elements.saveStatus.textContent = '';
            }
        }, 7000);
    }

    _bindEvents() {
        this.elements.growButton.addEventListener('click', () => {
            this.progression.handleManualGrowth();
            const unlocked = this.achievements.evaluate();
            this.showUnlockedMessage(unlocked);
        });

        this.elements.prestigeButton.addEventListener('click', () => {
            const success = this.progression.prestige();
            if (success) {
                this.elements.saveStatus.textContent = 'Evolution complete! Production multiplied.';
                setTimeout(() => {
                    if (this.elements.saveStatus.textContent.startsWith('Evolution')) {
                        this.elements.saveStatus.textContent = '';
                    }
                }, 7000);
                this.render(this.stateManager.getState());
            }
        });

        this.elements.resetButton.addEventListener('click', () => {
            if (confirm('Reset your save? This cannot be undone.')) {
                this.stateManager.reset();
                this.elements.saveStatus.textContent = 'Save cleared.';
                setTimeout(() => {
                    if (this.elements.saveStatus.textContent.startsWith('Save cleared')) {
                        this.elements.saveStatus.textContent = '';
                    }
                }, 5000);
            }
        });
    }

    _renderUpgrades(state) {
        const upgrades = this.progression.getUpgrades(state);
        this.elements.upgradeList.innerHTML = '';
        for (const upgrade of upgrades) {
            const li = document.createElement('li');
            li.className = 'upgrade';

            const info = document.createElement('div');
            const actions = document.createElement('div');
            actions.className = 'upgrade__actions';

            info.innerHTML = `
                <h3 class="upgrade__name">${upgrade.name}</h3>
                <p class="upgrade__description">${upgrade.description}</p>
                <p class="upgrade__stats">
                    <span>Owned: ${upgrade.owned}</span>
                    ${upgrade.growthPerSecond ? `<span>+${upgrade.growthPerSecond} / s</span>` : ''}
                    ${upgrade.growthPerClick ? `<span>+${upgrade.growthPerClick} / click</span>` : ''}
                    ${upgrade.multiplier ? `<span>+${(upgrade.multiplier * 100).toFixed(1)}% global</span>` : ''}
                </p>
            `;

            const cost = document.createElement('div');
            cost.className = 'upgrade__cost';
            cost.textContent = `${numberFormatter.format(upgrade.cost)} biomass`;

            const button = document.createElement('button');
            button.className = 'button button--secondary';
            button.textContent = 'Purchase';
            button.disabled = state.biomass < upgrade.cost;
            button.addEventListener('click', () => {
                const success = this.progression.purchase(upgrade.id);
                if (success) {
                    const unlocked = this.achievements.evaluate();
                    this.showUnlockedMessage(unlocked);
                    this.render(this.stateManager.getState());
                }
            });

            actions.append(cost, button);
            li.append(info, actions);
            this.elements.upgradeList.appendChild(li);
        }
    }

    _renderAchievements(state) {
        const achievements = this.achievements.getAchievements(state);
        this.elements.achievementList.innerHTML = '';
        for (const achievement of achievements) {
            const li = document.createElement('li');
            li.className = `achievement ${achievement.unlocked ? '' : 'achievement--locked'}`;
            li.innerHTML = `
                <div class="achievement__title">${achievement.name}</div>
                <div class="achievement__description">${achievement.description}</div>
            `;
            this.elements.achievementList.appendChild(li);
        }
    }

    _renderStreak(state) {
        const streak = state.streak;
        const lastClaim = streak.lastClaim ? new Date(streak.lastClaim).toLocaleDateString() : 'Never';
        this.elements.streak.innerHTML = `
            <p><strong>Current streak:</strong> ${streak.current || 0} days</p>
            <p><strong>Longest streak:</strong> ${streak.longest || 0} days</p>
            <p><strong>Last check-in:</strong> ${lastClaim}</p>
        `;
    }

    _renderEvent(state) {
        const event = state.event;
        if (!event) {
            this.elements.event.innerHTML = '<p>No active events. Keep growing!</p>';
            return;
        }
        const remaining = Math.max(0, Math.floor((event.endsAt - Date.now()) / 1000));
        this.elements.event.innerHTML = `
            <h4>${event.title}</h4>
            <p>${event.description}</p>
            <p><strong>Ends in:</strong> ${remaining} seconds</p>
        `;
    }

    _renderPrestige(state) {
        const info = this.progression.calculatePrestigeReady(state);
        this.elements.prestigeProgress.value = info.progress;
        this.elements.prestigeButton.disabled = !info.canPrestige;
        this.elements.prestigeHint.textContent = info.canPrestige
            ? `Rebirth now to earn ${info.reward} evolution points.`
            : `Earn ${numberFormatter.format(state.prestigeReadyAt - state.biomass)} more biomass to evolve.`;
    }
}
