// PrestigeSystem.js
// Implements prestige mechanics for meta-progression
// Based on logarithmic growth and psychological commitment

class PrestigeSystem {
    constructor(game) {
        this.game = game;
        
        // Prestige configuration
        this.config = {
            // Base requirement for first prestige
            baseRequirement: 1000000, // 1 million
            
            // Exponential growth factor
            requirementGrowth: 2.5,
            
            // Reward calculations
            pointsFormula: 'logarithmic',
            soulsFormula: 'root',
            
            // Multipliers
            productionMultiplierPerLevel: 0.5, // 50% per prestige
            clickMultiplierPerLevel: 0.25, // 25% per prestige
            
            // Special bonuses at milestone prestiges
            milestones: [1, 5, 10, 25, 50, 100, 250, 500, 1000]
        };
        
        // Prestige shop with psychological pricing
        this.prestigeUpgrades = {
            // Tier 1 - Essential upgrades
            startingCurrency: {
                id: 'startingCurrency',
                name: 'Head Start',
                description: 'Start with bonus currency after prestige',
                icon: '💰',
                baseCost: 1,
                costMultiplier: 1.5,
                owned: 0,
                maxLevel: 100,
                effect: {
                    type: 'starting_currency',
                    value: 1000,
                    scaling: 'exponential'
                },
                flavorText: 'Hit the ground running!'
            },
            
            startingProduction: {
                id: 'startingProduction',
                name: 'Production Kickstart',
                description: 'Begin with free auto-clickers',
                icon: '🏭',
                baseCost: 2,
                costMultiplier: 1.8,
                owned: 0,
                maxLevel: 50,
                effect: {
                    type: 'starting_buildings',
                    value: 1,
                    scaling: 'linear'
                },
                flavorText: 'Pre-built infrastructure'
            },
            
            // Tier 2 - Power multipliers
            globalMultiplier: {
                id: 'globalMultiplier',
                name: 'Universal Amplifier',
                description: 'Multiply ALL production by 2x',
                icon: '🌍',
                baseCost: 10,
                costMultiplier: 3,
                owned: 0,
                maxLevel: 20,
                effect: {
                    type: 'global_multiplier',
                    value: 2,
                    stacking: 'multiplicative'
                },
                flavorText: 'Everything grows faster!'
            },
            
            clickPowerScaling: {
                id: 'clickPowerScaling',
                name: 'Exponential Clicking',
                description: 'Clicks scale with total production',
                icon: '👆',
                baseCost: 15,
                costMultiplier: 2.5,
                owned: 0,
                maxLevel: 10,
                effect: {
                    type: 'click_scaling',
                    value: 0.01, // 1% of CPS added to clicks
                    scaling: 'additive'
                },
                flavorText: 'Your fingers channel cosmic energy'
            },
            
            // Tier 3 - Game changers
            offlineProgression: {
                id: 'offlineProgression',
                name: 'Temporal Persistence',
                description: 'Gain 90% production while offline',
                icon: '⏰',
                baseCost: 50,
                costMultiplier: 5,
                owned: 0,
                maxLevel: 5,
                effect: {
                    type: 'offline_efficiency',
                    value: 0.9,
                    scaling: 'diminishing'
                },
                flavorText: 'Time bends to your will'
            },
            
            autoPrestige: {
                id: 'autoPrestige',
                name: 'Ascension Engine',
                description: 'Automatically prestige at optimal times',
                icon: '♾️',
                baseCost: 100,
                costMultiplier: 10,
                owned: 0,
                maxLevel: 1,
                effect: {
                    type: 'auto_prestige',
                    value: true
                },
                flavorText: 'Infinite cycles of rebirth'
            },
            
            // Soul currency generators
            soulHarvest: {
                id: 'soulHarvest',
                name: 'Soul Harvester',
                description: 'Generate soul currency over time',
                icon: '👻',
                baseCost: 25,
                costMultiplier: 2,
                owned: 0,
                maxLevel: null,
                effect: {
                    type: 'soul_generation',
                    value: 0.1, // Per second
                    scaling: 'linear'
                },
                costType: 'prestige',
                flavorText: 'Harvest the essence of progress'
            },
            
            soulMultiplier: {
                id: 'soulMultiplier',
                name: 'Soul Resonance',
                description: 'Souls provide production bonus',
                icon: '✨',
                baseCost: 10,
                costMultiplier: 1.5,
                owned: 0,
                maxLevel: null,
                effect: {
                    type: 'soul_multiplier',
                    value: 0.01, // 1% per soul
                    scaling: 'logarithmic'
                },
                costType: 'soul',
                flavorText: 'Echoes of past lives empower you'
            }
        };
        
        // Prestige milestones with massive rewards
        this.milestoneRewards = {
            1: {
                name: 'First Transcendence',
                icon: '🌟',
                rewards: {
                    premiumCurrency: 100,
                    permanentMultiplier: 2,
                    achievement: 'first_prestige',
                    unlock: 'prestigeShop'
                },
                message: 'You have taken your first step beyond mortal limits!'
            },
            5: {
                name: 'Experienced Ascender',
                icon: '⭐',
                rewards: {
                    premiumCurrency: 250,
                    soulCurrency: 50,
                    newUpgrade: 'soulHarvest',
                    achievement: 'prestige_veteran'
                },
                message: 'The cycles of rebirth become familiar...'
            },
            10: {
                name: 'Master of Rebirth',
                icon: '🌠',
                rewards: {
                    premiumCurrency: 500,
                    exclusiveTheme: 'cosmic',
                    globalMultiplier: 1.5,
                    achievement: 'prestige_master'
                },
                message: 'You have mastered the art of transcendence!'
            },
            25: {
                name: 'Eternal One',
                icon: '💫',
                rewards: {
                    premiumCurrency: 1000,
                    autoPrestigeUnlock: true,
                    cosmicMultiplier: 2,
                    achievement: 'eternal_one'
                },
                message: 'Time itself bows to your eternal nature!'
            },
            100: {
                name: 'Godhood',
                icon: '🌌',
                rewards: {
                    premiumCurrency: 10000,
                    divineMultiplier: 10,
                    exclusiveTitle: 'The Eternal',
                    achievement: 'ascended_god'
                },
                message: 'You have transcended mortality itself!'
            }
        };
        
        // Visual and audio elements for prestige
        this.prestigeEffects = {
            visual: {
                screenFlash: true,
                particleExplosion: true,
                cosmicBackground: true,
                glowEffect: true,
                duration: 5000
            },
            audio: {
                buildUp: 'prestige_buildup.wav',
                climax: 'prestige_explosion.wav',
                ambient: 'cosmic_ambience.wav'
            },
            ui: {
                showStats: true,
                comparison: true,
                rewardPreview: true
            }
        };
        
        // Prestige statistics tracking
        this.statistics = {
            totalPrestiges: 0,
            fastestPrestige: Infinity,
            totalPointsEarned: 0,
            totalSoulsEarned: 0,
            currentRunTime: 0,
            bestCurrencyBeforePrestige: 0,
            prestigeTimes: [],
            averagePrestigeTime: 0
        };
        
        // Auto-prestige configuration
        this.autoPrestige = {
            enabled: false,
            targetMultiplier: 10, // Prestige when points would be 10x current
            minTime: 3600, // Minimum 1 hour between prestiges
            lastPrestigeTime: 0,
            checkInterval: 60000 // Check every minute
        };
    }
    
    initialize() {
        console.log('✨ Prestige System initialized - Meta-progression active');
        
        // Load prestige upgrades state
        this.loadPrestigeUpgrades();
        
        // Apply permanent bonuses
        this.applyPrestigeBonuses();
        
        // Start auto-prestige checking if unlocked
        if (this.autoPrestige.enabled) {
            this.startAutoPrestigeMonitoring();
        }
    }
    
    canPrestige(gameState) {
        const requirement = this.calculatePrestigeRequirement(gameState.prestigeLevel);
        return gameState.totalCurrencyEarned >= requirement;
    }
    
    calculatePrestigeRequirement(level) {
        // Exponential requirement growth
        return this.config.baseRequirement * Math.pow(this.config.requirementGrowth, level);
    }
    
    calculateRewards(gameState) {
        const rewards = {
            points: 0,
            souls: 0,
            multiplier: 0,
            bonuses: []
        };
        
        // Prestige points calculation (logarithmic)
        const earnedRatio = gameState.totalCurrencyEarned / this.config.baseRequirement;
        rewards.points = Math.floor(Math.log10(earnedRatio) * 10 * (1 + gameState.prestigeLevel * 0.1));
        
        // Soul currency (square root based)
        rewards.souls = Math.floor(Math.sqrt(rewards.points) * (1 + gameState.prestigeLevel * 0.05));
        
        // Production multiplier
        rewards.multiplier = 1 + (gameState.prestigeLevel + 1) * this.config.productionMultiplierPerLevel;
        
        // Check for milestone rewards
        const nextLevel = gameState.prestigeLevel + 1;
        if (this.config.milestones.includes(nextLevel)) {
            const milestone = this.milestoneRewards[nextLevel];
            if (milestone) {
                rewards.bonuses.push(milestone);
            }
        }
        
        // Time-based bonuses
        const runTime = Date.now() - gameState.sessionStartTime;
        if (runTime < 3600000) { // Less than 1 hour
            rewards.points *= 1.5; // Speed bonus
            rewards.bonuses.push({
                name: 'Speed Demon',
                bonus: '50% more prestige points!'
            });
        }
        
        return rewards;
    }
    
    async executePrestige(gameState) {
        // Store statistics
        this.updateStatistics(gameState);
        
        // Calculate final rewards
        const rewards = this.calculateRewards(gameState);
        
        // Show prestige animation
        await this.playPrestigeAnimation(rewards);
        
        // Apply milestone rewards
        this.applyMilestoneRewards(rewards.bonuses, gameState.prestigeLevel + 1);
        
        // Update prestige shop availability
        this.unlockPrestigeUpgrades(gameState.prestigeLevel + 1);
        
        // Trigger psychological reward
        this.triggerPrestigeRush(rewards);
        
        return rewards;
    }
    
    async playPrestigeAnimation(rewards) {
        // Start buildup
        this.game.music.playSound(this.prestigeEffects.audio.buildUp);
        
        // Screen effects
        this.game.ui.startPrestigeAnimation({
            phase: 'buildup',
            duration: 3000
        });
        
        // Show what's being lost (loss aversion)
        await this.game.ui.showPrestigeLosses();
        
        // Climax
        setTimeout(() => {
            this.game.music.playSound(this.prestigeEffects.audio.climax);
            
            // Visual explosion
            this.game.ui.prestigeExplosion({
                particles: 1000,
                colors: ['#FFD700', '#FF6B6B', '#4169E1', '#90EE90'],
                duration: 2000
            });
            
            // Show rewards
            this.game.ui.showPrestigeRewards(rewards);
            
            // Change background to cosmic
            if (this.prestigeEffects.visual.cosmicBackground) {
                this.game.ui.setCosmicBackground(true);
            }
            
        }, 3000);
        
        // Return to normal after effect
        return new Promise(resolve => {
            setTimeout(() => {
                this.game.ui.setCosmicBackground(false);
                resolve();
            }, this.prestigeEffects.visual.duration);
        });
    }
    
    triggerPrestigeRush(rewards) {
        // Massive dopamine release
        this.game.dopamine.triggerPrestigeRush(rewards);
        
        // Update music to epic/triumphant
        this.game.music.setEmotionState('satisfaction');
        this.game.music.playSound(this.prestigeEffects.audio.ambient);
        
        // Social notification
        this.game.socialProof.broadcastPrestige({
            level: this.game.state.prestigeLevel,
            points: rewards.points,
            souls: rewards.souls
        });
        
        // Analytics
        this.game.analytics.track('prestige_completed', {
            level: this.game.state.prestigeLevel,
            points: rewards.points,
            souls: rewards.souls,
            runTime: this.statistics.currentRunTime,
            totalCurrency: this.game.state.totalCurrencyEarned
        });
    }
    
    applyMilestoneRewards(bonuses, newLevel) {
        bonuses.forEach(bonus => {
            // Premium currency rewards
            if (bonus.rewards.premiumCurrency) {
                this.game.state.premiumCurrency += bonus.rewards.premiumCurrency;
                this.game.ui.showPremiumReward(bonus.rewards.premiumCurrency);
            }
            
            // Permanent multipliers
            if (bonus.rewards.permanentMultiplier) {
                this.game.progression.multipliers.prestige.production *= 
                    bonus.rewards.permanentMultiplier;
            }
            
            // Unlock new features
            if (bonus.rewards.unlock) {
                this.unlockFeature(bonus.rewards.unlock);
            }
            
            // Achievements
            if (bonus.rewards.achievement) {
                this.game.achievements.unlock(bonus.rewards.achievement);
            }
            
            // Show epic notification
            this.game.ui.showMilestoneReward(bonus);
        });
    }
    
    purchasePrestigeUpgrade(upgradeId) {
        const upgrade = this.prestigeUpgrades[upgradeId];
        if (!upgrade) return false;
        
        const cost = this.calculatePrestigeUpgradeCost(upgradeId);
        const costType = upgrade.costType || 'prestige';
        
        // Check if can afford
        if (!this.canAffordPrestigeUpgrade(cost, costType)) {
            // Near-miss psychology
            const current = this.getCurrency(costType);
            if (current >= cost * 0.8) {
                this.game.ui.showAlmostAffordPrestige(upgrade.name, cost - current);
            }
            return false;
        }
        
        // Check max level
        if (upgrade.maxLevel && upgrade.owned >= upgrade.maxLevel) {
            return false;
        }
        
        // Purchase upgrade
        this.spendPrestigeCurrency(cost, costType);
        upgrade.owned++;
        
        // Apply effects immediately
        this.applyPrestigeUpgradeEffect(upgrade);
        
        // Special unlocks
        if (upgrade.id === 'autoPrestige' && upgrade.owned === 1) {
            this.enableAutoPrestige();
        }
        
        // Visual feedback
        this.game.ui.showPrestigeUpgradePurchase(upgrade);
        
        // Save state
        this.savePrestigeUpgrades();
        
        return true;
    }
    
    calculatePrestigeUpgradeCost(upgradeId) {
        const upgrade = this.prestigeUpgrades[upgradeId];
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.owned));
    }
    
    canAffordPrestigeUpgrade(cost, costType) {
        return this.getCurrency(costType) >= cost;
    }
    
    getCurrency(type) {
        switch(type) {
            case 'prestige':
                return this.game.state.prestigePoints;
            case 'soul':
                return this.game.state.soulCurrency;
            default:
                return 0;
        }
    }
    
    spendPrestigeCurrency(amount, type) {
        switch(type) {
            case 'prestige':
                this.game.state.prestigePoints -= amount;
                break;
            case 'soul':
                this.game.state.soulCurrency -= amount;
                break;
        }
    }
    
    applyPrestigeUpgradeEffect(upgrade) {
        const effect = upgrade.effect;
        const level = upgrade.owned;
        
        switch(effect.type) {
            case 'starting_currency':
                // Will apply on next prestige
                const startAmount = effect.value * Math.pow(2, level - 1);
                this.config.startingCurrency = startAmount;
                break;
                
            case 'starting_buildings':
                // Will apply on next prestige
                this.config.startingBuildings = effect.value * level;
                break;
                
            case 'global_multiplier':
                // Apply immediately
                const multiplier = effect.stacking === 'multiplicative' ? 
                    Math.pow(effect.value, level) : 
                    1 + (effect.value - 1) * level;
                
                this.game.progression.multipliers.prestige.production *= 
                    multiplier / (level > 1 ? Math.pow(effect.value, level - 1) : 1);
                break;
                
            case 'click_scaling':
                // Clicks now scale with CPS
                this.config.clickCPSScaling = effect.value * level;
                break;
                
            case 'offline_efficiency':
                // Improve offline gains
                const efficiency = effect.scaling === 'diminishing' ?
                    1 - Math.pow(1 - effect.value, level) :
                    effect.value * level;
                
                this.config.offlineEfficiency = Math.min(0.95, efficiency);
                break;
                
            case 'soul_generation':
                // Start generating souls
                this.config.soulGeneration = effect.value * level;
                break;
                
            case 'soul_multiplier':
                // Souls boost production
                const soulBonus = 1 + (this.game.state.soulCurrency * effect.value * level);
                this.game.progression.multipliers.prestige.soul = soulBonus;
                break;
        }
        
        // Update production immediately
        this.game.progression.updateProduction();
    }
    
    applyPrestigeBonuses() {
        // Apply all owned prestige upgrades
        Object.values(this.prestigeUpgrades).forEach(upgrade => {
            if (upgrade.owned > 0) {
                // Re-apply each level
                for (let i = 0; i < upgrade.owned; i++) {
                    const tempOwned = upgrade.owned;
                    upgrade.owned = i + 1;
                    this.applyPrestigeUpgradeEffect(upgrade);
                    upgrade.owned = tempOwned;
                }
            }
        });
        
        // Apply starting bonuses if prestiged
        if (this.game.state.prestigeLevel > 0) {
            // Starting currency
            if (this.config.startingCurrency) {
                this.game.state.currency = this.config.startingCurrency;
            }
            
            // Starting buildings
            if (this.config.startingBuildings) {
                this.game.progression.upgrades.autoClicker.owned = this.config.startingBuildings;
                this.game.progression.updateProduction();
            }
        }
    }
    
    unlockPrestigeUpgrades(level) {
        // Progressive unlock system
        const unlocks = {
            1: ['startingCurrency', 'startingProduction'],
            2: ['globalMultiplier'],
            3: ['clickPowerScaling'],
            5: ['soulHarvest', 'offlineProgression'],
            10: ['soulMultiplier'],
            25: ['autoPrestige']
        };
        
        Object.entries(unlocks).forEach(([reqLevel, upgradeIds]) => {
            if (level >= parseInt(reqLevel)) {
                upgradeIds.forEach(id => {
                    if (this.prestigeUpgrades[id]) {
                        this.prestigeUpgrades[id].unlocked = true;
                    }
                });
            }
        });
    }
    
    unlockFeature(feature) {
        switch(feature) {
            case 'prestigeShop':
                this.game.ui.unlockPrestigeShop();
                this.game.ui.showNewFeature('Prestige Shop', 'Spend points on permanent upgrades!');
                break;
                
            case 'soulCurrency':
                this.game.ui.showSoulCurrency(true);
                this.game.ui.showNewFeature('Soul Currency', 'A new form of eternal power!');
                break;
                
            case 'autoPrestige':
                this.enableAutoPrestige();
                break;
        }
    }
    
    enableAutoPrestige() {
        this.autoPrestige.enabled = true;
        this.startAutoPrestigeMonitoring();
        
        this.game.ui.showNewFeature(
            'Auto-Prestige Enabled!', 
            'The game will automatically prestige at optimal times!'
        );
    }
    
    startAutoPrestigeMonitoring() {
        setInterval(() => {
            if (!this.autoPrestige.enabled) return;
            
            const timeSinceLastPrestige = Date.now() - this.autoPrestige.lastPrestigeTime;
            
            // Check minimum time
            if (timeSinceLastPrestige < this.autoPrestige.minTime * 1000) return;
            
            // Check if prestige would give significantly more points
            if (this.canPrestige(this.game.state)) {
                const currentRewards = this.calculateRewards(this.game.state);
                const optimalRatio = currentRewards.points / 
                    (this.game.state.prestigePoints || 1);
                
                if (optimalRatio >= this.autoPrestige.targetMultiplier) {
                    // Auto prestige!
                    this.game.ui.showAutoPrestigeWarning();
                    
                    setTimeout(() => {
                        this.game.attemptPrestige();
                        this.autoPrestige.lastPrestigeTime = Date.now();
                    }, 5000); // 5 second warning
                }
            }
        }, this.autoPrestige.checkInterval);
    }
    
    updateStatistics(gameState) {
        const runTime = Date.now() - (this.statistics.currentRunTime || gameState.sessionStartTime);
        
        this.statistics.totalPrestiges++;
        this.statistics.totalPointsEarned += this.calculateRewards(gameState).points;
        this.statistics.totalSoulsEarned += this.calculateRewards(gameState).souls;
        
        if (runTime < this.statistics.fastestPrestige) {
            this.statistics.fastestPrestige = runTime;
            
            // Achievement for speed
            if (runTime < 3600000) { // Under 1 hour
                this.game.achievements.unlock('speed_prestige');
            }
        }
        
        if (gameState.totalCurrencyEarned > this.statistics.bestCurrencyBeforePrestige) {
            this.statistics.bestCurrencyBeforePrestige = gameState.totalCurrencyEarned;
        }
        
        // Track prestige times for average
        this.statistics.prestigeTimes.push(runTime);
        if (this.statistics.prestigeTimes.length > 10) {
            this.statistics.prestigeTimes.shift(); // Keep last 10
        }
        
        this.statistics.averagePrestigeTime = 
            this.statistics.prestigeTimes.reduce((a, b) => a + b, 0) / 
            this.statistics.prestigeTimes.length;
        
        // Reset run timer
        this.statistics.currentRunTime = Date.now();
    }
    
    resetForPrestige() {
        // Apply starting bonuses from prestige upgrades
        this.applyPrestigeBonuses();
        
        // Reset statistics for new run
        this.statistics.currentRunTime = Date.now();
    }
    
    getSaveData() {
        return {
            upgrades: Object.fromEntries(
                Object.entries(this.prestigeUpgrades).map(([id, upgrade]) => [
                    id,
                    { owned: upgrade.owned, unlocked: upgrade.unlocked }
                ])
            ),
            statistics: this.statistics,
            autoPrestige: this.autoPrestige,
            config: {
                startingCurrency: this.config.startingCurrency,
                startingBuildings: this.config.startingBuildings,
                offlineEfficiency: this.config.offlineEfficiency,
                clickCPSScaling: this.config.clickCPSScaling,
                soulGeneration: this.config.soulGeneration
            }
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        
        // Load upgrades
        if (data.upgrades) {
            Object.entries(data.upgrades).forEach(([id, saved]) => {
                if (this.prestigeUpgrades[id]) {
                    this.prestigeUpgrades[id].owned = saved.owned || 0;
                    this.prestigeUpgrades[id].unlocked = saved.unlocked || false;
                }
            });
        }
        
        // Load statistics
        if (data.statistics) {
            Object.assign(this.statistics, data.statistics);
        }
        
        // Load auto-prestige settings
        if (data.autoPrestige) {
            Object.assign(this.autoPrestige, data.autoPrestige);
        }
        
        // Load config
        if (data.config) {
            Object.assign(this.config, data.config);
        }
    }
    
    savePrestigeUpgrades() {
        // Trigger save
        this.game.saveGameState();
    }
    
    loadPrestigeUpgrades() {
        // Handled by loadSaveData
    }
    
    update(deltaTime) {
        // Generate soul currency if unlocked
        if (this.config.soulGeneration && this.config.soulGeneration > 0) {
            this.game.state.soulCurrency += this.config.soulGeneration * deltaTime;
        }
        
        // Update click power with CPS scaling
        if (this.config.clickCPSScaling) {
            const scaledPower = this.game.state.currencyPerSecond * this.config.clickCPSScaling;
            this.game.state.clickPower = 1 + scaledPower;
        }
    }
}

export default PrestigeSystem;