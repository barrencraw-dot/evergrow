// AchievementSystem.js
// Implements achievement mechanics for goal-setting and dopamine rewards
// Based on psychological principles of goal gradient effect and variable rewards

class AchievementSystem {
    constructor(game) {
        this.game = game;
        
        // Achievement categories with psychological framing
        this.achievements = {
            // Progress achievements - Create sense of advancement
            progress: {
                firstClick: {
                    id: 'firstClick',
                    name: 'Baby Steps',
                    description: 'Click the grow button',
                    icon: '👶',
                    points: 10,
                    reward: { premiumCurrency: 5 },
                    hidden: false,
                    rarity: 'common',
                    unlocked: false,
                    progress: 0,
                    requirement: 1,
                    type: 'single'
                },
                
                currencyMilestones: [
                    {
                        id: 'reach100',
                        name: 'Seedling',
                        description: 'Reach 100 growth',
                        icon: '🌱',
                        points: 25,
                        reward: { premiumCurrency: 10, multiplier: 1.1 },
                        requirement: 100,
                        unlocked: false
                    },
                    {
                        id: 'reach1k',
                        name: 'Sapling',
                        description: 'Reach 1,000 growth',
                        icon: '🌿',
                        points: 50,
                        reward: { premiumCurrency: 20, multiplier: 1.2 },
                        requirement: 1000,
                        unlocked: false
                    },
                    {
                        id: 'reach1m',
                        name: 'Tree',
                        description: 'Reach 1,000,000 growth',
                        icon: '🌳',
                        points: 100,
                        reward: { premiumCurrency: 50, multiplier: 1.5 },
                        requirement: 1000000,
                        unlocked: false
                    },
                    {
                        id: 'reach1b',
                        name: 'Forest',
                        description: 'Reach 1,000,000,000 growth',
                        icon: '🌲',
                        points: 250,
                        reward: { premiumCurrency: 100, exclusive: 'golden_leaves' },
                        requirement: 1000000000,
                        unlocked: false
                    }
                ],
                
                cpsMilestones: [
                    {
                        id: 'cps10',
                        name: 'Automated',
                        description: 'Reach 10 growth per second',
                        icon: '⚙️',
                        requirement: 10,
                        reward: { clickPower: 2 }
                    },
                    {
                        id: 'cps1k',
                        name: 'Industrial',
                        description: 'Reach 1,000 growth per second',
                        icon: '🏭',
                        requirement: 1000,
                        reward: { productionBonus: 1.25 }
                    }
                ]
            },
            
            // Behavioral achievements - Reward specific actions
            behavioral: {
                clickAchievements: [
                    {
                        id: 'click100',
                        name: 'Clicker',
                        description: 'Click 100 times',
                        icon: '👆',
                        requirement: 100,
                        reward: { clickPower: 2 }
                    },
                    {
                        id: 'click10k',
                        name: 'Click Master',
                        description: 'Click 10,000 times',
                        icon: '💪',
                        requirement: 10000,
                        reward: { premiumCurrency: 30, title: 'Click Master' }
                    },
                    {
                        id: 'clickFrenzy',
                        name: 'Click Frenzy',
                        description: 'Click 100 times in 10 seconds',
                        icon: '⚡',
                        requirement: 100,
                        timeLimit: 10000,
                        reward: { temporaryMultiplier: { value: 5, duration: 60 } }
                    }
                ],
                
                purchaseAchievements: [
                    {
                        id: 'firstPurchase',
                        name: 'Investor',
                        description: 'Buy your first upgrade',
                        icon: '💰',
                        requirement: 1,
                        reward: { premiumCurrency: 10 }
                    },
                    {
                        id: 'bulk10',
                        name: 'Bulk Buyer',
                        description: 'Buy 10 of the same upgrade at once',
                        icon: '📦',
                        requirement: 10,
                        reward: { costReduction: 0.95 }
                    }
                ]
            },
            
            // Secret achievements - Discovery rewards
            secret: {
                luckyClick: {
                    id: 'luckyClick',
                    name: '???',
                    description: 'Get a 50x multiplier or higher',
                    revealedName: 'Lucky Strike',
                    icon: '🍀',
                    points: 100,
                    reward: { premiumCurrency: 50, badge: 'lucky' },
                    hidden: true,
                    hint: 'Sometimes clicks are extra special...',
                    unlocked: false
                },
                
                nightOwl: {
                    id: 'nightOwl',
                    name: '???',
                    description: 'Play between 2 AM and 4 AM',
                    revealedName: 'Night Owl',
                    icon: '🦉',
                    points: 50,
                    reward: { nightBonus: 1.5 },
                    hidden: true,
                    unlocked: false
                },
                
                dedication: {
                    id: 'dedication',
                    name: '???',
                    description: 'Play for 24 hours total',
                    revealedName: 'Dedicated Grower',
                    icon: '🏆',
                    points: 200,
                    reward: { premiumCurrency: 100, permanentMultiplier: 1.1 },
                    hidden: true,
                    requirement: 86400000, // milliseconds
                    unlocked: false
                }
            },
            
            // Social achievements - Viral mechanics
            social: {
                firstFriend: {
                    id: 'firstFriend',
                    name: 'Social Butterfly',
                    description: 'Add your first friend',
                    icon: '🦋',
                    requirement: 1,
                    reward: { premiumCurrency: 20, friendBonus: 1.05 }
                },
                
                referrer: {
                    id: 'referrer',
                    name: 'Evangelist',
                    description: 'Refer 5 friends who reach level 10',
                    icon: '📢',
                    requirement: 5,
                    reward: { premiumCurrency: 100, referralMultiplier: 2 }
                },
                
                guildMember: {
                    id: 'guildMember',
                    name: 'Team Player',
                    description: 'Join or create a guild',
                    icon: '⚔️',
                    reward: { guildBonus: 1.1 }
                }
            },
            
            // Prestige achievements - Long-term goals
            prestige: {
                firstPrestige: {
                    id: 'firstPrestige',
                    name: 'Reborn',
                    description: 'Prestige for the first time',
                    icon: '✨',
                    points: 500,
                    reward: { 
                        premiumCurrency: 100, 
                        prestigePoints: 10,
                        title: 'The Reborn'
                    }
                },
                
                prestigeMaster: {
                    id: 'prestigeMaster',
                    name: 'Master of Cycles',
                    description: 'Prestige 10 times',
                    icon: '♾️',
                    requirement: 10,
                    reward: {
                        premiumCurrency: 500,
                        autoPrestige: true,
                        cosmicSkin: true
                    }
                },
                
                speedPrestige: {
                    id: 'speedPrestige',
                    name: 'Speed Demon',
                    description: 'Prestige within 1 hour',
                    icon: '🏃',
                    timeLimit: 3600000,
                    reward: {
                        speedBonus: 1.5,
                        title: 'Speed Demon'
                    }
                }
            },
            
            // Collection achievements - Completionist psychology
            collection: {
                upgradeCollector: {
                    id: 'upgradeCollector',
                    name: 'Collector',
                    description: 'Own every type of upgrade',
                    icon: '🗂️',
                    reward: { collectorBonus: 1.2 }
                },
                
                achievementHunter: {
                    id: 'achievementHunter',
                    name: 'Completionist',
                    description: 'Unlock 50 achievements',
                    icon: '💯',
                    requirement: 50,
                    reward: {
                        premiumCurrency: 200,
                        completionistMultiplier: 2,
                        rainbowEffect: true
                    }
                }
            }
        };
        
        // Achievement notification queue
        this.unlockQueue = [];
        this.processingQueue = false;
        
        // Progress tracking
        this.progressTrackers = {
            clicks: 0,
            purchases: 0,
            timeSpent: 0,
            friends: 0,
            prestiges: 0
        };
        
        // Achievement points and rewards
        this.totalPoints = 0;
        this.pointsMultiplier = 1; // Points give production bonus
        
        // Visual effects configuration
        this.visualEffects = {
            common: {
                duration: 3000,
                particles: 20,
                colors: ['#90EE90', '#98FB98'],
                sound: 'achievement_common'
            },
            rare: {
                duration: 4000,
                particles: 50,
                colors: ['#4169E1', '#6495ED'],
                sound: 'achievement_rare'
            },
            epic: {
                duration: 5000,
                particles: 100,
                colors: ['#9370DB', '#BA55D3'],
                sound: 'achievement_epic'
            },
            legendary: {
                duration: 7000,
                particles: 200,
                colors: ['#FFD700', '#FFA500'],
                sound: 'achievement_legendary',
                screenShake: true
            }
        };
        
        // Psychological elements
        this.nearMissTracking = {
            enabled: true,
            threshold: 0.9, // Show when 90% complete
            shown: new Set()
        };
        
        // Statistics
        this.statistics = {
            totalUnlocked: 0,
            unlockedByCategory: {},
            averageUnlockTime: 0,
            rareUnlocks: 0,
            hiddenFound: 0
        };
    }
    
    initialize() {
        console.log('🏆 Achievement System initialized - Goal-based motivation active');
        
        // Set up progress tracking
        this.setupProgressTracking();
        
        // Check for any already-met achievements
        this.checkAllAchievements();
        
        // Start notification processor
        this.startNotificationProcessor();
    }
    
    setupProgressTracking() {
        // Track clicks
        this.game.eventBus.on('click', () => {
            this.progressTrackers.clicks++;
            this.checkClickAchievements();
        });
        
        // Track purchases
        this.game.eventBus.on('upgrade_purchased', (data) => {
            this.progressTrackers.purchases++;
            this.checkPurchaseAchievements(data);
        });
        
        // Track time
        setInterval(() => {
            this.progressTrackers.timeSpent += 1000;
            this.checkTimeAchievements();
        }, 1000);
        
        // Track currency milestones
        this.game.eventBus.on('currency_gained', () => {
            this.checkCurrencyMilestones();
        });
        
        // Track prestige
        this.game.eventBus.on('prestige_completed', () => {
            this.progressTrackers.prestiges++;
            this.checkPrestigeAchievements();
        });
    }
    
    startNotificationProcessor() {
        // Process unlock queue with delays for maximum impact
        setInterval(() => {
            if (this.unlockQueue.length > 0 && !this.processingQueue) {
                this.processNextUnlock();
            }
        }, 100);
    }
    
    checkAllAchievements() {
        // Check all achievement categories
        this.checkCurrencyMilestones();
        this.checkCPSMilestones();
        this.checkClickAchievements();
        this.checkTimeAchievements();
        this.checkSecretAchievements();
    }
    
    checkCurrencyMilestones() {
        const totalCurrency = this.game.state.totalCurrencyEarned;
        
        this.achievements.progress.currencyMilestones.forEach(milestone => {
            if (!milestone.unlocked && totalCurrency >= milestone.requirement) {
                // Check for near-miss first
                if (!milestone.nearMissShown && 
                    totalCurrency >= milestone.requirement * this.nearMissTracking.threshold) {
                    this.showNearMiss(milestone);
                    milestone.nearMissShown = true;
                }
                
                // Unlock achievement
                if (totalCurrency >= milestone.requirement) {
                    this.unlock(milestone);
                }
            }
        });
    }
    
    checkCPSMilestones() {
        const cps = this.game.state.currencyPerSecond;
        
        this.achievements.progress.cpsMilestones.forEach(milestone => {
            if (!milestone.unlocked && cps >= milestone.requirement) {
                this.unlock(milestone);
            }
        });
    }
    
    checkClickAchievements() {
        const clicks = this.progressTrackers.clicks;
        
        this.achievements.behavioral.clickAchievements.forEach(achievement => {
            if (!achievement.unlocked) {
                if (achievement.timeLimit) {
                    // Check click frenzy achievements
                    this.checkClickFrenzy(achievement);
                } else if (clicks >= achievement.requirement) {
                    this.unlock(achievement);
                }
            }
        });
        
        // First click
        if (!this.achievements.progress.firstClick.unlocked && clicks >= 1) {
            this.unlock(this.achievements.progress.firstClick);
        }
    }
    
    checkClickFrenzy(achievement) {
        // Track rapid clicking for frenzy achievements
        const recentClicks = this.game.flowState?.behaviorMetrics.clickTimes || [];
        const now = Date.now();
        const timeWindow = achievement.timeLimit;
        
        const clicksInWindow = recentClicks.filter(
            time => now - time < timeWindow
        ).length;
        
        if (clicksInWindow >= achievement.requirement) {
            this.unlock(achievement);
        }
    }
    
    checkPurchaseAchievements(purchaseData) {
        const purchases = this.progressTrackers.purchases;
        
        // First purchase
        const firstPurchase = this.achievements.behavioral.purchaseAchievements.find(
            a => a.id === 'firstPurchase'
        );
        if (firstPurchase && !firstPurchase.unlocked && purchases >= 1) {
            this.unlock(firstPurchase);
        }
        
        // Bulk purchase
        if (purchaseData.amount >= 10) {
            const bulkBuyer = this.achievements.behavioral.purchaseAchievements.find(
                a => a.id === 'bulk10'
            );
            if (bulkBuyer && !bulkBuyer.unlocked) {
                this.unlock(bulkBuyer);
            }
        }
    }
    
    checkTimeAchievements() {
        const timeSpent = this.progressTrackers.timeSpent;
        
        // Dedication achievement
        const dedication = this.achievements.secret.dedication;
        if (!dedication.unlocked && timeSpent >= dedication.requirement) {
            this.unlock(dedication, true); // true for secret reveal
        }
        
        // Night owl achievement
        const hour = new Date().getHours();
        if (hour >= 2 && hour <= 4) {
            const nightOwl = this.achievements.secret.nightOwl;
            if (!nightOwl.unlocked) {
                this.unlock(nightOwl, true);
            }
        }
    }
    
    checkSecretAchievements() {
        // Lucky click - checked when big multiplier hit
        this.game.eventBus.on('big_multiplier', (multiplier) => {
            if (multiplier >= 50) {
                const luckyClick = this.achievements.secret.luckyClick;
                if (!luckyClick.unlocked) {
                    this.unlock(luckyClick, true);
                }
            }
        });
    }
    
    checkPrestigeAchievements() {
        const prestiges = this.progressTrackers.prestiges;
        
        // First prestige
        if (prestiges === 1) {
            const firstPrestige = this.achievements.prestige.firstPrestige;
            if (!firstPrestige.unlocked) {
                this.unlock(firstPrestige);
            }
        }
        
        // Prestige master
        if (prestiges >= 10) {
            const prestigeMaster = this.achievements.prestige.prestigeMaster;
            if (!prestigeMaster.unlocked) {
                this.unlock(prestigeMaster);
            }
        }
        
        // Speed prestige - check run time
        const runTime = Date.now() - this.game.state.sessionStartTime;
        if (runTime < 3600000) { // Under 1 hour
            const speedPrestige = this.achievements.prestige.speedPrestige;
            if (!speedPrestige.unlocked) {
                this.unlock(speedPrestige);
            }
        }
    }
    
    unlock(achievement, isSecret = false) {
        if (achievement.unlocked) return;
        
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        
        // Add to unlock queue for staggered notifications
        this.unlockQueue.push({
            achievement,
            isSecret,
            timestamp: Date.now()
        });
        
        // Update statistics
        this.statistics.totalUnlocked++;
        if (achievement.rarity === 'rare' || achievement.rarity === 'epic') {
            this.statistics.rareUnlocks++;
        }
        if (isSecret) {
            this.statistics.hiddenFound++;
        }
        
        // Add achievement points
        this.totalPoints += achievement.points || 10;
        this.updatePointsMultiplier();
        
        // Track for analytics
        this.game.analytics.track('achievement_unlocked', {
            id: achievement.id,
            name: achievement.name,
            rarity: achievement.rarity,
            points: achievement.points,
            timeToUnlock: Date.now() - this.game.state.sessionStartTime
        });
    }
    
    processNextUnlock() {
        if (this.unlockQueue.length === 0) return;
        
        this.processingQueue = true;
        const unlock = this.unlockQueue.shift();
        const { achievement, isSecret } = unlock;
        
        // Determine rarity for effects
        const rarity = this.calculateRarity(achievement);
        achievement.rarity = rarity;
        
        // Show achievement notification
        this.showAchievementNotification(achievement, isSecret, rarity);
        
        // Apply rewards
        this.applyAchievementRewards(achievement);
        
        // Trigger dopamine response
        this.game.dopamine.triggerAchievementRush();
        
        // Social notification for rare achievements
        if (rarity === 'epic' || rarity === 'legendary') {
            this.game.socialProof.broadcastAchievement(achievement);
        }
        
        // Check meta-achievements
        this.checkMetaAchievements();
        
        // Continue processing after delay
        setTimeout(() => {
            this.processingQueue = false;
        }, 2000); // 2 second delay between achievements
    }
    
    calculateRarity(achievement) {
        // Determine rarity based on various factors
        if (achievement.rarity) return achievement.rarity;
        
        const points = achievement.points || 10;
        
        if (points >= 200) return 'legendary';
        if (points >= 100) return 'epic';
        if (points >= 50) return 'rare';
        return 'common';
    }
    
    showAchievementNotification(achievement, isSecret, rarity) {
        const effects = this.visualEffects[rarity];
        
        // Build notification data
        const notification = {
            title: isSecret ? '🎉 Secret Achievement Unlocked!' : '🏆 Achievement Unlocked!',
            name: isSecret ? achievement.revealedName : achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            points: achievement.points || 10,
            rarity: rarity,
            effects: effects
        };
        
        // Show with appropriate fanfare
        this.game.ui.showAchievement(notification);
        
        // Play sound
        this.game.music.playSound(effects.sound);
        
        // Screen shake for legendary
        if (effects.screenShake) {
            this.game.ui.screenShake(1000);
        }
        
        // Particle effects
        this.createAchievementParticles(effects);
    }
    
    createAchievementParticles(effects) {
        const particles = [];
        
        for (let i = 0; i < effects.particles; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight,
                color: effects.colors[Math.floor(Math.random() * effects.colors.length)],
                size: 5 + Math.random() * 10,
                velocity: {
                    x: (Math.random() - 0.5) * 5,
                    y: -5 - Math.random() * 10
                },
                lifetime: effects.duration
            });
        }
        
        this.game.ui.createParticleSystem(particles);
    }
    
    applyAchievementRewards(achievement) {
        const reward = achievement.reward;
        if (!reward) return;
        
        // Premium currency
        if (reward.premiumCurrency) {
            this.game.state.premiumCurrency += reward.premiumCurrency;
            this.game.ui.showRewardPopup(`+${reward.premiumCurrency} 💎`);
        }
        
        // Multipliers
        if (reward.multiplier) {
            this.game.progression.multipliers.global *= reward.multiplier;
            this.game.ui.showRewardPopup(`${reward.multiplier}x Production!`);
        }
        
        // Click power
        if (reward.clickPower) {
            this.game.state.clickPower *= reward.clickPower;
            this.game.ui.showRewardPopup(`${reward.clickPower}x Click Power!`);
        }
        
        // Temporary multipliers
        if (reward.temporaryMultiplier) {
            this.game.progression.addTemporaryMultiplier(
                'production',
                reward.temporaryMultiplier.value,
                reward.temporaryMultiplier.duration
            );
        }
        
        // Exclusive unlocks
        if (reward.exclusive) {
            this.unlockExclusiveContent(reward.exclusive);
        }
        
        // Titles
        if (reward.title) {
            this.game.ui.unlockTitle(reward.title);
        }
        
        // Special effects
        if (reward.rainbowEffect) {
            this.game.ui.enableRainbowMode();
        }
    }
    
    unlockExclusiveContent(contentId) {
        switch(contentId) {
            case 'golden_leaves':
                this.game.ui.enableGoldenLeaves();
                this.game.ui.showRewardPopup('Golden Leaves Effect Unlocked!');
                break;
                
            case 'cosmic_background':
                this.game.ui.enableCosmicBackground();
                break;
                
            default:
                console.log('Unknown exclusive content:', contentId);
        }
    }
    
    showNearMiss(achievement) {
        // Create anticipation for almost-unlocked achievements
        if (this.nearMissTracking.shown.has(achievement.id)) return;
        
        this.nearMissTracking.shown.add(achievement.id);
        
        const notification = {
            title: 'Almost there!',
            message: `${achievement.name} - ${Math.floor(
                (this.game.state.totalCurrencyEarned / achievement.requirement) * 100
            )}% complete!`,
            icon: achievement.icon,
            type: 'near-miss'
        };
        
        this.game.ui.showNearMissNotification(notification);
        
        // Increase dopamine anticipation
        this.game.dopamine.dopamineState.anticipationLevel += 10;
    }
    
    updatePointsMultiplier() {
        // Achievement points provide production bonus
        this.pointsMultiplier = 1 + (this.totalPoints / 1000); // 0.1% per point
        this.game.progression.multipliers.achievement = this.pointsMultiplier;
    }
    
    checkMetaAchievements() {
        // Achievements for getting achievements
        const totalUnlocked = this.statistics.totalUnlocked;
        
        // Achievement hunter
        const hunter = this.achievements.collection.achievementHunter;
        if (!hunter.unlocked && totalUnlocked >= hunter.requirement) {
            this.unlock(hunter);
        }
        
        // Category completion bonuses
        this.checkCategoryCompletion();
    }
    
    checkCategoryCompletion() {
        // Bonus for completing entire categories
        const categories = ['progress', 'behavioral', 'social', 'prestige'];
        
        categories.forEach(category => {
            const achievements = this.getAllInCategory(category);
            const unlocked = achievements.filter(a => a.unlocked).length;
            
            if (unlocked === achievements.length && achievements.length > 0) {
                // Category complete bonus
                this.game.ui.showCategoryComplete(category);
                this.game.state.premiumCurrency += 50;
                
                // Special effect for category
                this.applyCategoryBonus(category);
            }
        });
    }
    
    getAllInCategory(category) {
        const achievements = [];
        const categoryObj = this.achievements[category];
        
        if (!categoryObj) return achievements;
        
        // Flatten all achievements in category
        Object.values(categoryObj).forEach(item => {
            if (Array.isArray(item)) {
                achievements.push(...item);
            } else if (item.id) {
                achievements.push(item);
            }
        });
        
        return achievements;
    }
    
    applyCategoryBonus(category) {
        const bonuses = {
            progress: { multiplier: 1.5, message: 'Progress Master! 1.5x Production!' },
            behavioral: { clickPower: 2, message: 'Behavior Expert! 2x Click Power!' },
            social: { friendBonus: 1.2, message: 'Social Champion! Friend bonuses increased!' },
            prestige: { prestigeBonus: 1.5, message: 'Prestige Legend! 50% more prestige points!' }
        };
        
        const bonus = bonuses[category];
        if (bonus) {
            this.game.ui.showRewardPopup(bonus.message);
            
            if (bonus.multiplier) {
                this.game.progression.multipliers.categoryBonus = 
                    (this.game.progression.multipliers.categoryBonus || 1) * bonus.multiplier;
            }
        }
    }
    
    getProgress(achievementId) {
        // Get progress towards specific achievement
        const achievement = this.findAchievement(achievementId);
        if (!achievement) return 0;
        
        if (achievement.unlocked) return 1;
        
        // Calculate progress based on type
        switch(achievementId) {
            case 'reach100':
            case 'reach1k':
            case 'reach1m':
            case 'reach1b':
                return Math.min(1, this.game.state.totalCurrencyEarned / achievement.requirement);
                
            case 'click100':
            case 'click10k':
                return Math.min(1, this.progressTrackers.clicks / achievement.requirement);
                
            case 'prestigeMaster':
                return Math.min(1, this.progressTrackers.prestiges / achievement.requirement);
                
            default:
                return achievement.progress || 0;
        }
    }
    
    findAchievement(id) {
        // Search all categories for achievement
        for (const category of Object.values(this.achievements)) {
            for (const item of Object.values(category)) {
                if (Array.isArray(item)) {
                    const found = item.find(a => a.id === id);
                    if (found) return found;
                } else if (item.id === id) {
                    return item;
                }
            }
        }
        return null;
    }
    
    getUnlockedCount() {
        return this.statistics.totalUnlocked;
    }
    
    getTotalCount() {
        let total = 0;
        
        for (const category of Object.values(this.achievements)) {
            for (const item of Object.values(category)) {
                if (Array.isArray(item)) {
                    total += item.length;
                } else if (item.id) {
                    total++;
                }
            }
        }
        
        return total;
    }
    
    getCompletionPercentage() {
        return Math.floor((this.getUnlockedCount() / this.getTotalCount()) * 100);
    }
    
    getSaveData() {
        const saveData = {
            unlocked: {},
            progress: this.progressTrackers,
            statistics: this.statistics,
            totalPoints: this.totalPoints,
            nearMissShown: Array.from(this.nearMissTracking.shown)
        };
        
        // Save unlock status for all achievements
        for (const [categoryName, category] of Object.entries(this.achievements)) {
            saveData.unlocked[categoryName] = {};
            
            for (const [key, item] of Object.entries(category)) {
                if (Array.isArray(item)) {
                    saveData.unlocked[categoryName][key] = item.map(a => ({
                        id: a.id,
                        unlocked: a.unlocked,
                        unlockedAt: a.unlockedAt,
                        progress: a.progress
                    }));
                } else if (item.id) {
                    saveData.unlocked[categoryName][key] = {
                        unlocked: item.unlocked,
                        unlockedAt: item.unlockedAt,
                        progress: item.progress
                    };
                }
            }
        }
        
        return saveData;
    }
    
    loadSaveData(data) {
        if (!data) return;
        
        // Load progress
        if (data.progress) {
            Object.assign(this.progressTrackers, data.progress);
        }
        
        // Load statistics
        if (data.statistics) {
            Object.assign(this.statistics, data.statistics);
        }
        
        // Load total points
        if (data.totalPoints) {
            this.totalPoints = data.totalPoints;
            this.updatePointsMultiplier();
        }
        
        // Load near miss tracking
        if (data.nearMissShown) {
            this.nearMissTracking.shown = new Set(data.nearMissShown);
        }
        
        // Load unlock states
        if (data.unlocked) {
            for (const [categoryName, category] of Object.entries(data.unlocked)) {
                if (!this.achievements[categoryName]) continue;
                
                for (const [key, saved] of Object.entries(category)) {
                    const achievement = this.achievements[categoryName][key];
                    
                    if (Array.isArray(achievement)) {
                        saved.forEach(savedAchievement => {
                            const found = achievement.find(a => a.id === savedAchievement.id);
                            if (found) {
                                found.unlocked = savedAchievement.unlocked;
                                found.unlockedAt = savedAchievement.unlockedAt;
                                found.progress = savedAchievement.progress || 0;
                            }
                        });
                    } else if (achievement) {
                        achievement.unlocked = saved.unlocked;
                        achievement.unlockedAt = saved.unlockedAt;
                        achievement.progress = saved.progress || 0;
                    }
                }
            }
        }
    }
    
    update(deltaTime) {
        // Check for time-based achievements
        if (Math.random() < 0.1) { // Check occasionally
            this.checkTimeAchievements();
        }
    }
}

export default AchievementSystem;