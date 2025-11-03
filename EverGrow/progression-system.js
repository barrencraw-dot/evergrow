// ProgressionSystem.js
// Core idle game progression with psychological manipulation
// Implements exponential growth, upgrade systems, and dopamine-optimized feedback

class ProgressionSystem {
    constructor(game) {
        this.game = game;
        
        // Upgrade definitions with psychological pricing
        this.upgrades = {
            // Tier 1 - Early game hooks
            autoClicker: {
                id: 'autoClicker',
                name: 'Auto Clicker',
                description: 'Automatically clicks once per second',
                baseProduction: 1,
                baseCost: 10,
                costMultiplier: 1.15, // Fibonacci-like growth
                owned: 0,
                maxOwned: null,
                unlocked: true,
                icon: '🤖',
                
                // Psychological elements
                flavorText: 'Your first employee!',
                milestone: [10, 25, 50, 100], // Dopamine at milestones
                synergyWith: ['clickUpgrade']
            },
            
            clickUpgrade: {
                id: 'clickUpgrade',
                name: 'Better Mouse',
                description: 'Doubles your click power',
                baseClickPower: 1,
                baseCost: 50,
                costMultiplier: 2.5,
                owned: 0,
                maxOwned: 20, // Creates scarcity
                unlocked: true,
                icon: '🖱️',
                
                flavorText: 'Click smarter, not harder',
                specialEffect: 'particleBurst'
            },
            
            // Tier 2 - Mid game expansion
            growthFarm: {
                id: 'growthFarm',
                name: 'Growth Farm',
                description: 'Cultivates exponential growth',
                baseProduction: 10,
                baseCost: 500,
                costMultiplier: 1.18,
                owned: 0,
                maxOwned: null,
                unlocked: false,
                unlockAt: { currency: 100 },
                icon: '🌱',
                
                flavorText: 'Plant the seeds of success',
                milestone: [1, 10, 50, 100, 200],
                productionBonus: 0.1 // 10% bonus to all production per farm
            },
            
            synergySeed: {
                id: 'synergySeed',
                name: 'Synergy Seeds',
                description: 'Each building boosts others by 1%',
                baseCost: 5000,
                costMultiplier: 10,
                owned: 0,
                maxOwned: 10,
                unlocked: false,
                unlockAt: { totalBuildings: 50 },
                icon: '🌟',
                
                flavorText: 'Everything grows together',
                isMultiplier: true,
                effect: 'globalSynergy'
            },
            
            // Tier 3 - Late game power
            exponentialEngine: {
                id: 'exponentialEngine',
                name: 'Exponential Engine',
                description: 'Production increases by 1% every second',
                baseProduction: 100,
                baseCost: 50000,
                costMultiplier: 1.25,
                owned: 0,
                maxOwned: null,
                unlocked: false,
                unlockAt: { currency: 10000 },
                icon: '⚡',
                
                flavorText: 'Compound interest on steroids',
                milestone: [1, 5, 10, 25, 50],
                specialMechanic: 'compounding'
            },
            
            timeWarp: {
                id: 'timeWarp',
                name: 'Time Warp',
                description: 'Gain 1 hour of production instantly',
                baseCost: 10000,
                costMultiplier: 2,
                owned: 0,
                maxOwned: 5, // Daily limit creates FOMO
                unlocked: false,
                unlockAt: { prestigeLevel: 1 },
                icon: '⏰',
                
                flavorText: 'Time is money, literally',
                instantEffect: true,
                cooldown: 3600000 // 1 hour cooldown
            },
            
            // Tier 4 - Prestige tier
            soulHarvester: {
                id: 'soulHarvester',
                name: 'Soul Harvester',
                description: 'Converts achievements into soul currency',
                baseProduction: 0,
                baseCost: 100, // Cost in prestige points
                costMultiplier: 1.5,
                owned: 0,
                maxOwned: null,
                unlocked: false,
                unlockAt: { prestigeLevel: 2 },
                icon: '👻',
                costType: 'prestige',
                
                flavorText: 'Transcend mortal limits',
                soulGeneration: 0.1 // Per achievement per second
            }
        };
        
        // Milestone rewards for dopamine hits
        this.milestones = {
            currency: [
                { amount: 100, reward: { type: 'multiplier', value: 1.5 }, name: 'First Hundred' },
                { amount: 1000, reward: { type: 'unlock', upgrade: 'growthFarm' }, name: 'Thousand Club' },
                { amount: 10000, reward: { type: 'multiplier', value: 2 }, name: 'Five Figures' },
                { amount: 100000, reward: { type: 'premiumCurrency', value: 10 }, name: 'Big Spender' },
                { amount: 1000000, reward: { type: 'achievement', id: 'millionaire' }, name: 'Millionaire' }
            ],
            
            buildings: [
                { amount: 10, reward: { type: 'production', value: 1.1 }, name: 'Builder' },
                { amount: 50, reward: { type: 'unlock', upgrade: 'synergySeed' }, name: 'Architect' },
                { amount: 100, reward: { type: 'cost', value: 0.9 }, name: 'Empire Builder' },
                { amount: 500, reward: { type: 'clickPower', value: 2 }, name: 'Tycoon' }
            ],
            
            clicks: [
                { amount: 100, reward: { type: 'clickPower', value: 2 }, name: 'Click Novice' },
                { amount: 1000, reward: { type: 'autoClick', value: 1 }, name: 'Click Master' },
                { amount: 10000, reward: { type: 'critChance', value: 0.05 }, name: 'Click Legend' }
            ]
        };
        
        // Production multipliers (stacking buffs create power fantasy)
        this.multipliers = {
            global: 1,
            production: 1,
            click: 1,
            cost: 1,
            
            // Temporary buffs
            temporary: [],
            
            // Prestige multipliers (permanent)
            prestige: {
                production: 1,
                click: 1,
                soul: 1
            }
        };
        
        // Unlock queue for controlled dopamine release
        this.unlockQueue = [];
        this.lastUnlockTime = 0;
        this.unlockDelay = 2000; // 2 seconds between unlocks
        
        // Visual feedback queue
        this.feedbackQueue = [];
        
        // Auto-save production snapshot for offline calculation
        this.productionSnapshot = {
            cps: 0,
            timestamp: Date.now()
        };
    }
    
    initialize() {
        console.log('📈 Progression system initialized with psychological pricing curves');
        
        // Check initial unlocks
        this.checkUnlocks();
        
        // Start production loop
        this.startProductionLoop();
    }
    
    startProductionLoop() {
        // Update production values every 100ms for smooth numbers
        setInterval(() => {
            this.updateProduction();
        }, 100);
    }
    
    update(deltaTime) {
        // Process unlock queue (staggered for maximum impact)
        this.processUnlockQueue();
        
        // Update temporary multipliers
        this.updateTemporaryMultipliers(deltaTime);
        
        // Check for milestone rewards
        this.checkMilestones();
        
        // Apply special mechanics
        this.applySpecialMechanics(deltaTime);
        
        // Visual feedback processing
        this.processFeedbackQueue();
    }
    
    updateProduction() {
        let totalCPS = 0;
        
        // Calculate production from all buildings
        Object.values(this.upgrades).forEach(upgrade => {
            if (upgrade.owned > 0 && upgrade.baseProduction) {
                let production = upgrade.baseProduction * upgrade.owned;
                
                // Apply milestone bonuses
                production *= this.getMilestoneMultiplier(upgrade.id);
                
                // Apply synergy bonuses
                production *= this.getSynergyMultiplier(upgrade.id);
                
                // Apply global multipliers
                production *= this.multipliers.global * this.multipliers.production;
                
                // Apply prestige multipliers
                production *= this.multipliers.prestige.production;
                
                totalCPS += production;
            }
        });
        
        // Special mechanics
        if (this.upgrades.exponentialEngine.owned > 0) {
            // Compound growth creates excitement
            const compoundBonus = Math.pow(1.01, this.upgrades.exponentialEngine.owned);
            totalCPS *= compoundBonus;
        }
        
        // Update game state
        this.game.state.currencyPerSecond = totalCPS;
        this.productionSnapshot = {
            cps: totalCPS,
            timestamp: Date.now()
        };
    }
    
    purchaseUpgrade(upgradeId, amount = 1) {
        const upgrade = this.upgrades[upgradeId];
        if (!upgrade || !upgrade.unlocked) return false;
        
        // Calculate cost with bulk discount psychology
        const cost = this.calculateUpgradeCost(upgradeId, amount);
        const costType = upgrade.costType || 'currency';
        
        // Check if player can afford
        if (!this.canAfford(cost, costType)) {
            // Near-miss feedback if close
            const current = this.getCurrency(costType);
            if (current >= cost * 0.9) {
                this.game.dopamine.createNearMissExperience();
                this.game.ui.showAlmostAfford(upgrade.name, cost - current);
            }
            return false;
        }
        
        // Check max owned limit (scarcity psychology)
        if (upgrade.maxOwned && upgrade.owned + amount > upgrade.maxOwned) {
            amount = upgrade.maxOwned - upgrade.owned;
            if (amount <= 0) {
                this.game.ui.showError('Maximum owned!');
                return false;
            }
        }
        
        // Deduct cost
        this.spendCurrency(cost, costType);
        
        // Apply upgrade
        upgrade.owned += amount;
        
        // Instant effects
        if (upgrade.instantEffect) {
            this.applyInstantEffect(upgrade);
        }
        
        // Update click power
        if (upgrade.baseClickPower) {
            this.game.state.clickPower += upgrade.baseClickPower * amount;
        }
        
        // Visual and audio feedback
        this.triggerPurchaseFeedback(upgrade, amount);
        
        // Check for milestone unlocks
        this.checkUpgradeMilestone(upgrade);
        
        // Update production immediately
        this.updateProduction();
        
        // Check for new unlocks
        this.checkUnlocks();
        
        // Analytics
        this.game.analytics.track('upgrade_purchased', {
            upgradeId: upgradeId,
            amount: amount,
            totalOwned: upgrade.owned,
            cost: cost
        });
        
        return true;
    }
    
    calculateUpgradeCost(upgradeId, amount = 1) {
        const upgrade = this.upgrades[upgradeId];
        if (!upgrade) return Infinity;
        
        // Geometric series for bulk purchase
        let totalCost = 0;
        const baseCost = upgrade.baseCost;
        const multiplier = upgrade.costMultiplier;
        const owned = upgrade.owned;
        
        for (let i = 0; i < amount; i++) {
            totalCost += baseCost * Math.pow(multiplier, owned + i);
        }
        
        // Apply cost reduction multipliers
        totalCost *= this.multipliers.cost;
        
        // Bulk discount (psychological incentive for bigger purchases)
        if (amount >= 10) {
            totalCost *= 0.9; // 10% discount
        }
        if (amount >= 25) {
            totalCost *= 0.85; // 15% discount
        }
        if (amount >= 100) {
            totalCost *= 0.75; // 25% discount
        }
        
        return Math.floor(totalCost);
    }
    
    canAfford(cost, costType = 'currency') {
        return this.getCurrency(costType) >= cost;
    }
    
    getCurrency(type) {
        switch(type) {
            case 'currency':
                return this.game.state.currency;
            case 'prestige':
                return this.game.state.prestigePoints;
            case 'premium':
                return this.game.state.premiumCurrency;
            case 'soul':
                return this.game.state.soulCurrency;
            default:
                return 0;
        }
    }
    
    spendCurrency(amount, type = 'currency') {
        switch(type) {
            case 'currency':
                this.game.state.currency -= amount;
                break;
            case 'prestige':
                this.game.state.prestigePoints -= amount;
                break;
            case 'premium':
                this.game.state.premiumCurrency -= amount;
                break;
            case 'soul':
                this.game.state.soulCurrency -= amount;
                break;
        }
    }
    
    checkUnlocks() {
        let hasNewUnlock = false;
        
        Object.values(this.upgrades).forEach(upgrade => {
            if (!upgrade.unlocked && upgrade.unlockAt) {
                let shouldUnlock = true;
                
                // Check all unlock conditions
                for (const [key, value] of Object.entries(upgrade.unlockAt)) {
                    switch(key) {
                        case 'currency':
                            if (this.game.state.totalCurrencyEarned < value) shouldUnlock = false;
                            break;
                        case 'totalBuildings':
                            if (this.getTotalBuildings() < value) shouldUnlock = false;
                            break;
                        case 'prestigeLevel':
                            if (this.game.state.prestigeLevel < value) shouldUnlock = false;
                            break;
                    }
                }
                
                if (shouldUnlock) {
                    upgrade.unlocked = true;
                    hasNewUnlock = true;
                    
                    // Queue unlock notification for staggered dopamine
                    this.unlockQueue.push({
                        upgrade: upgrade,
                        timestamp: Date.now()
                    });
                }
            }
        });
        
        return hasNewUnlock;
    }
    
    processUnlockQueue() {
        if (this.unlockQueue.length === 0) return;
        
        const now = Date.now();
        if (now - this.lastUnlockTime < this.unlockDelay) return;
        
        const unlock = this.unlockQueue.shift();
        this.lastUnlockTime = now;
        
        // Dramatic unlock presentation
        this.game.ui.showNewUnlock(unlock.upgrade);
        this.game.music.playSound('achievement');
        
        // Trigger dopamine response
        this.game.dopamine.triggerAchievementRush();
        
        // Analytics
        this.game.analytics.track('upgrade_unlocked', {
            upgradeId: unlock.upgrade.id,
            timeToUnlock: now - this.game.state.sessionStartTime
        });
    }
    
    getTotalBuildings() {
        return Object.values(this.upgrades)
            .filter(u => u.baseProduction && u.owned > 0)
            .reduce((sum, u) => sum + u.owned, 0);
    }
    
    getMilestoneMultiplier(upgradeId) {
        const upgrade = this.upgrades[upgradeId];
        if (!upgrade.milestone) return 1;
        
        let multiplier = 1;
        
        // Each milestone reached adds a multiplier
        upgrade.milestone.forEach(milestone => {
            if (upgrade.owned >= milestone) {
                multiplier *= 1.5; // 50% bonus per milestone
            }
        });
        
        return multiplier;
    }
    
    getSynergyMultiplier(upgradeId) {
        let multiplier = 1;
        
        // Global synergy from synergy seeds
        if (this.upgrades.synergySeed.owned > 0) {
            const totalBuildings = this.getTotalBuildings();
            const synergyBonus = 1 + (0.01 * this.upgrades.synergySeed.owned * totalBuildings);
            multiplier *= synergyBonus;
        }
        
        // Specific synergies
        const upgrade = this.upgrades[upgradeId];
        if (upgrade.synergyWith) {
            upgrade.synergyWith.forEach(otherId => {
                const other = this.upgrades[otherId];
                if (other && other.owned > 0) {
                    multiplier *= 1 + (0.05 * Math.sqrt(other.owned)); // Diminishing returns
                }
            });
        }
        
        return multiplier;
    }
    
    checkMilestones() {
        // Check currency milestones
        this.milestones.currency.forEach(milestone => {
            if (!milestone.claimed && this.game.state.totalCurrencyEarned >= milestone.amount) {
                milestone.claimed = true;
                this.applyMilestoneReward(milestone);
            }
        });
        
        // Check building milestones
        const totalBuildings = this.getTotalBuildings();
        this.milestones.buildings.forEach(milestone => {
            if (!milestone.claimed && totalBuildings >= milestone.amount) {
                milestone.claimed = true;
                this.applyMilestoneReward(milestone);
            }
        });
        
        // Check click milestones
        this.milestones.clicks.forEach(milestone => {
            if (!milestone.claimed && this.game.state.clicksThisSession >= milestone.amount) {
                milestone.claimed = true;
                this.applyMilestoneReward(milestone);
            }
        });
    }
    
    applyMilestoneReward(milestone) {
        const reward = milestone.reward;
        
        switch(reward.type) {
            case 'multiplier':
                this.multipliers.global *= reward.value;
                this.game.ui.showMilestone(milestone.name, `${reward.value}x multiplier!`);
                break;
                
            case 'unlock':
                if (this.upgrades[reward.upgrade]) {
                    this.upgrades[reward.upgrade].unlocked = true;
                    this.unlockQueue.push({
                        upgrade: this.upgrades[reward.upgrade],
                        timestamp: Date.now()
                    });
                }
                break;
                
            case 'production':
                this.multipliers.production *= reward.value;
                this.game.ui.showMilestone(milestone.name, `Production ×${reward.value}!`);
                break;
                
            case 'cost':
                this.multipliers.cost *= reward.value;
                this.game.ui.showMilestone(milestone.name, `Costs reduced!`);
                break;
                
            case 'clickPower':
                this.game.state.clickPower *= reward.value;
                this.game.ui.showMilestone(milestone.name, `Click power ×${reward.value}!`);
                break;
                
            case 'premiumCurrency':
                this.game.state.premiumCurrency += reward.value;
                this.game.ui.showMilestone(milestone.name, `+${reward.value} Gems!`);
                break;
                
            case 'achievement':
                this.game.achievements.unlock(reward.id);
                break;
        }
        
        // Massive dopamine hit for milestones
        this.game.dopamine.triggerAchievementRush();
        this.game.music.playAchievementSound();
    }
    
    checkUpgradeMilestone(upgrade) {
        if (!upgrade.milestone) return;
        
        upgrade.milestone.forEach(milestone => {
            if (upgrade.owned === milestone) {
                // Special celebration for round numbers
                this.game.ui.showUpgradeMilestone(upgrade, milestone);
                this.game.music.playSound('achievement');
                
                // Bonus production burst
                this.addTemporaryMultiplier('production', 2, 10); // 2x for 10 seconds
            }
        });
    }
    
    addTemporaryMultiplier(type, value, duration) {
        const multiplier = {
            type: type,
            value: value,
            duration: duration * 1000, // Convert to milliseconds
            remaining: duration * 1000,
            id: Date.now()
        };
        
        this.multipliers.temporary.push(multiplier);
        
        // Immediate update
        this.updateProduction();
        
        // Visual indicator
        this.game.ui.showTemporaryBoost(type, value, duration);
    }
    
    updateTemporaryMultipliers(deltaTime) {
        const deltaMs = deltaTime * 1000;
        
        // Update and remove expired multipliers
        this.multipliers.temporary = this.multipliers.temporary.filter(mult => {
            mult.remaining -= deltaMs;
            
            if (mult.remaining <= 0) {
                // Multiplier expired
                this.game.ui.hideTemporaryBoost(mult.id);
                return false;
            }
            
            return true;
        });
        
        // Recalculate total temporary multipliers
        let tempProduction = 1;
        let tempClick = 1;
        
        this.multipliers.temporary.forEach(mult => {
            if (mult.type === 'production') tempProduction *= mult.value;
            if (mult.type === 'click') tempClick *= mult.value;
        });
        
        // Apply to main multipliers
        this.multipliers.production = this.multipliers.production * tempProduction;
        this.multipliers.click = this.multipliers.click * tempClick;
    }
    
    applySpecialMechanics(deltaTime) {
        // Exponential engine compound growth
        if (this.upgrades.exponentialEngine.owned > 0) {
            const growthRate = 0.01 * this.upgrades.exponentialEngine.owned;
            const compoundFactor = Math.pow(1 + growthRate, deltaTime);
            
            // Visual feedback for compounding
            if (Math.random() < 0.1) { // 10% chance per update
                this.feedbackQueue.push({
                    type: 'compound',
                    value: growthRate
                });
            }
        }
        
        // Soul harvester generation
        if (this.upgrades.soulHarvester.owned > 0) {
            const achievementCount = this.game.achievements.getUnlockedCount();
            const soulGeneration = this.upgrades.soulHarvester.soulGeneration * 
                                 this.upgrades.soulHarvester.owned * 
                                 achievementCount * 
                                 deltaTime;
            
            this.game.state.soulCurrency += soulGeneration;
        }
    }
    
    applyInstantEffect(upgrade) {
        switch(upgrade.id) {
            case 'timeWarp':
                // Instant production based on current CPS
                const instantProduction = this.game.state.currencyPerSecond * 3600; // 1 hour
                this.game.addCurrency(instantProduction);
                
                // Epic visual effect
                this.game.ui.showTimeWarp(instantProduction);
                this.game.music.triggerClimax('time_warp');
                
                // Set cooldown
                upgrade.lastUsed = Date.now();
                break;
        }
    }
    
    triggerPurchaseFeedback(upgrade, amount) {
        // Visual feedback intensity based on purchase size
        if (amount >= 100) {
            this.game.ui.screenShake(500);
            this.game.ui.showMegaPurchase(upgrade, amount);
        } else if (amount >= 10) {
            this.game.ui.showBulkPurchase(upgrade, amount);
        } else {
            this.game.ui.showPurchase(upgrade);
        }
        
        // Audio feedback
        if (upgrade.specialEffect === 'particleBurst') {
            this.game.ui.particleExplosion(upgrade.icon);
        }
        
        // Dopamine trigger for expensive purchases
        const cost = this.calculateUpgradeCost(upgrade.id, amount);
        if (cost > this.game.state.currencyPerSecond * 60) { // More than 1 minute of production
            this.game.dopamine.triggerReward(cost);
        }
    }
    
    processFeedbackQueue() {
        while (this.feedbackQueue.length > 0) {
            const feedback = this.feedbackQueue.shift();
            
            switch(feedback.type) {
                case 'compound':
                    this.game.ui.showCompoundGrowth(feedback.value);
                    break;
            }
        }
    }
    
    resetForPrestige() {
        // Reset owned counts but keep unlocks
        Object.values(this.upgrades).forEach(upgrade => {
            if (upgrade.costType !== 'prestige') {
                upgrade.owned = 0;
            }
        });
        
        // Reset non-prestige multipliers
        this.multipliers.global = 1;
        this.multipliers.production = 1;
        this.multipliers.click = 1;
        this.multipliers.cost = 1;
        this.multipliers.temporary = [];
        
        // Reset milestones
        this.milestones.currency.forEach(m => m.claimed = false);
        this.milestones.buildings.forEach(m => m.claimed = false);
        this.milestones.clicks.forEach(m => m.claimed = false);
        
        // Update production
        this.updateProduction();
    }
    
    applyPrestigeBonus(level, points) {
        // Each prestige level gives permanent bonuses
        this.multipliers.prestige.production = 1 + (level * 0.5); // 50% per prestige
        this.multipliers.prestige.click = 1 + (level * 0.25); // 25% per prestige
        
        // Prestige points give smaller bonuses
        this.multipliers.prestige.production *= 1 + (points * 0.01); // 1% per point
    }
    
    getSaveData() {
        return {
            upgrades: Object.fromEntries(
                Object.entries(this.upgrades).map(([id, upgrade]) => [
                    id, 
                    { 
                        owned: upgrade.owned, 
                        unlocked: upgrade.unlocked,
                        lastUsed: upgrade.lastUsed
                    }
                ])
            ),
            multipliers: this.multipliers,
            milestones: {
                currency: this.milestones.currency.map(m => ({ claimed: m.claimed })),
                buildings: this.milestones.buildings.map(m => ({ claimed: m.claimed })),
                clicks: this.milestones.clicks.map(m => ({ claimed: m.claimed }))
            }
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        
        // Load upgrade states
        if (data.upgrades) {
            Object.entries(data.upgrades).forEach(([id, saved]) => {
                if (this.upgrades[id]) {
                    this.upgrades[id].owned = saved.owned || 0;
                    this.upgrades[id].unlocked = saved.unlocked || false;
                    this.upgrades[id].lastUsed = saved.lastUsed;
                }
            });
        }
        
        // Load multipliers
        if (data.multipliers) {
            Object.assign(this.multipliers, data.multipliers);
            this.multipliers.temporary = []; // Clear temporary on load
        }
        
        // Load milestone states
        if (data.milestones) {
            if (data.milestones.currency) {
                data.milestones.currency.forEach((saved, i) => {
                    if (this.milestones.currency[i]) {
                        this.milestones.currency[i].claimed = saved.claimed;
                    }
                });
            }
            // Similar for buildings and clicks
        }
        
        // Update production with loaded values
        this.updateProduction();
    }
}

export default ProgressionSystem;