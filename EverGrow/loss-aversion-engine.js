// LossAversionEngine.js
// Implements loss aversion psychology to maximize retention
// Based on Kahneman & Tversky's prospect theory - losses feel twice as powerful as gains

class LossAversionEngine {
    constructor(game) {
        this.game = game;
        
        // Loss aversion mechanics
        this.lossAversion = {
            // Streak protection
            streakAtRisk: false,
            streakValue: 0,
            streakProtectionOffered: false,
            
            // Prestige loss framing
            prestigeLosses: {
                currency: 0,
                buildings: 0,
                progress: 0,
                timeInvested: 0
            },
            
            // Time-limited opportunities
            activeOffers: [],
            missedOpportunities: [],
            
            // Resource decay threats
            decayWarnings: {
                shown: false,
                nextDecayTime: 0,
                potentialLoss: 0
            },
            
            // Social loss framing
            leaderboardPosition: 0,
            friendsAhead: 0,
            aboutToBeOvertaken: false
        };
        
        // FOMO (Fear of Missing Out) systems
        this.fomo = {
            // Limited-time events
            currentEvent: null,
            eventEndTime: 0,
            eventRewards: [],
            participationLevel: 0,
            
            // Flash sales
            flashSale: {
                active: false,
                item: null,
                discount: 0,
                endTime: 0,
                originalPrice: 0,
                urgencyLevel: 0
            },
            
            // Exclusive unlocks
            limitedUnlocks: [],
            expiringContent: [],
            
            // Social FOMO
            friendsPlaying: 0,
            friendsAchievements: [],
            missedSocialEvents: 0
        };
        
        // Sunk cost exploitation
        this.sunkCost = {
            totalTimeInvested: 0,
            totalClicksInvested: 0,
            totalPurchases: 0,
            progressToNextMilestone: 0,
            
            // Investment reminders
            lastReminderTime: 0,
            reminderFrequency: 3600000, // 1 hour
            
            // Progress anchoring
            peakCurrency: 0,
            peakCPS: 0,
            peakAchievements: 0
        };
        
        // Abandonment prevention
        this.abandonmentPrevention = {
            inactivityThreshold: 300000, // 5 minutes
            lastActivityTime: Date.now(),
            interventionStage: 0,
            
            // Escalating interventions
            interventions: [
                { delay: 60000, type: 'gentle_reminder' },
                { delay: 180000, type: 'progress_at_risk' },
                { delay: 300000, type: 'special_offer' },
                { delay: 600000, type: 'final_warning' }
            ]
        };
        
        // Psychological anchoring
        this.anchoring = {
            // Price anchoring for IAP
            premiumAnchors: [
                { price: 99.99, value: 50000, label: "Best Value!" },
                { price: 49.99, value: 20000, label: "Popular!" },
                { price: 19.99, value: 7000, label: "" },
                { price: 4.99, value: 1000, label: "" }
            ],
            
            // Progress anchoring
            nextMilestoneShown: false,
            comparisonPoints: [],
            
            // Social anchoring
            averagePlayerStats: {
                currency: 10000,
                cps: 100,
                prestigeLevel: 2
            }
        };
        
        // Urgency creation
        this.urgency = {
            // Countdown timers
            activeTimers: [],
            
            // Scarcity mechanics
            limitedStock: {},
            
            // Deadline pressure
            deadlines: [],
            
            // Increasing costs
            dynamicPricing: {
                enabled: true,
                priceIncreaseRate: 0.01,
                lastUpdateTime: Date.now()
            }
        };
        
        // Notification timing
        this.notificationSchedule = {
            streakReminder: { hour: 20, sent: false }, // 8 PM
            dailyBonus: { hour: 12, sent: false }, // Noon
            eventReminder: { hour: 18, sent: false }, // 6 PM
            
            // Retention notifications
            returnReminders: [
                { delay: 3600000, message: "Your farms are producing!" },
                { delay: 14400000, message: "Don't lose your streak!" },
                { delay: 86400000, message: "Your friends are getting ahead!" }
            ]
        };
    }
    
    initialize() {
        console.log('😰 Loss Aversion Engine initialized - Maximizing psychological retention');
        
        // Start monitoring systems
        this.startLossMonitoring();
        this.startFOMOGeneration();
        this.startUrgencyCreation();
        
        // Initialize with player's peak values
        this.updatePeakValues();
    }
    
    startLossMonitoring() {
        // Monitor for potential losses every second
        setInterval(() => {
            this.checkStreakStatus();
            this.checkProgressDecay();
            this.checkSocialPosition();
            this.updateSunkCost();
        }, 1000);
        
        // Check for abandonment every 30 seconds
        setInterval(() => {
            this.checkForAbandonment();
        }, 30000);
    }
    
    startFOMOGeneration() {
        // Generate FOMO events every few minutes
        setInterval(() => {
            this.generateFOMOEvent();
            this.updateFlashSales();
        }, 180000); // 3 minutes
        
        // Update urgency every minute
        setInterval(() => {
            this.updateUrgencyLevels();
        }, 60000);
    }
    
    startUrgencyCreation() {
        // Dynamic pricing updates
        setInterval(() => {
            if (this.urgency.dynamicPricing.enabled) {
                this.updateDynamicPricing();
            }
        }, 30000); // 30 seconds
        
        // Timer updates
        setInterval(() => {
            this.updateAllTimers();
        }, 1000);
    }
    
    checkStreakStatus() {
        const streak = this.game.streaks;
        if (!streak) return;
        
        // Calculate time until streak loss
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const timeUntilMidnight = midnight - now;
        
        // Streak at risk if less than 4 hours until midnight
        if (timeUntilMidnight < 14400000 && !this.lossAversion.streakAtRisk) {
            this.lossAversion.streakAtRisk = true;
            this.lossAversion.streakValue = this.calculateStreakValue();
            
            if (!this.lossAversion.streakProtectionOffered) {
                this.offerStreakProtection();
            }
        }
    }
    
    calculateStreakValue() {
        const streakDays = this.game.state.streakDays || 0;
        
        // Exponentially increasing value with streak length
        const baseValue = this.game.state.currencyPerSecond * 300; // 5 minutes
        const streakMultiplier = Math.pow(1.5, streakDays);
        
        return baseValue * streakMultiplier * streakDays;
    }
    
    offerStreakProtection() {
        console.log('🛡️ Offering streak protection');
        
        this.lossAversion.streakProtectionOffered = true;
        
        // Create urgent notification
        const protection = {
            title: `Don't lose your ${this.game.state.streakDays} day streak!`,
            message: `You'll lose ${this.formatNumber(this.lossAversion.streakValue)} in bonuses!`,
            options: [
                {
                    text: 'Watch Ad to Save Streak',
                    action: () => this.saveStreakWithAd(),
                    style: 'primary'
                },
                {
                    text: 'Use 10 Gems',
                    action: () => this.saveStreakWithGems(),
                    style: 'secondary'
                },
                {
                    text: 'Let it go...',
                    action: () => this.acceptStreakLoss(),
                    style: 'danger'
                }
            ],
            urgency: 'high',
            countdown: true,
            countdownEnd: new Date().setHours(24, 0, 0, 0)
        };
        
        this.game.ui.showUrgentChoice(protection);
        
        // Track event
        this.game.analytics.track('streak_at_risk', {
            streakDays: this.game.state.streakDays,
            potentialLoss: this.lossAversion.streakValue
        });
    }
    
    saveStreakWithAd() {
        this.game.ads.showRewardedVideo('streak_protection').then(watched => {
            if (watched) {
                this.game.streaks.protectStreak();
                this.lossAversion.streakAtRisk = false;
                this.game.ui.showSuccess('Streak saved! 🔥');
                
                // Dopamine reward for smart decision
                this.game.dopamine.triggerReward(this.lossAversion.streakValue);
            }
        });
    }
    
    saveStreakWithGems() {
        if (this.game.state.premiumCurrency >= 10) {
            this.game.state.premiumCurrency -= 10;
            this.game.streaks.protectStreak();
            this.lossAversion.streakAtRisk = false;
            this.game.ui.showSuccess('Streak saved! 🔥');
        } else {
            // Exploit sunk cost - offer gem purchase
            this.offerGemPurchaseForStreak();
        }
    }
    
    offerGemPurchaseForStreak() {
        const offer = {
            title: "Save your streak!",
            message: `Buy gems now to protect your ${this.game.state.streakDays} day streak!`,
            urgency: 'critical',
            packages: this.anchoring.premiumAnchors,
            countdown: true
        };
        
        this.game.ui.showIAPOffer(offer);
    }
    
    acceptStreakLoss() {
        // Make them feel the loss
        this.game.ui.showLossAnimation({
            type: 'streak',
            value: this.game.state.streakDays,
            consequence: `Lost ${this.formatNumber(this.lossAversion.streakValue)} in bonuses`
        });
        
        // Reset streak with regret
        this.game.state.streakDays = 0;
        this.lossAversion.streakAtRisk = false;
        
        // Track for re-engagement
        this.game.analytics.track('streak_lost', {
            daysLost: this.game.state.streakDays,
            valueLost: this.lossAversion.streakValue
        });
    }
    
    async confirmPrestige(gameState) {
        // Calculate everything player will lose
        this.calculatePrestigeLosses(gameState);
        
        // Frame the choice with loss emphasis
        const losses = this.lossAversion.prestigeLosses;
        
        const confirmation = await this.game.ui.showPrestigeConfirmation({
            title: "⚠️ Are you SURE you want to Prestige?",
            losses: [
                {
                    icon: '💰',
                    label: 'Currency',
                    value: this.formatNumber(losses.currency),
                    emphasis: 'You will LOSE all of this!'
                },
                {
                    icon: '🏭',
                    label: 'Buildings',
                    value: `${losses.buildings} upgrades`,
                    emphasis: 'Back to square one!'
                },
                {
                    icon: '📈',
                    label: 'Production',
                    value: `${this.formatNumber(gameState.currencyPerSecond)}/sec`,
                    emphasis: 'Start from ZERO again!'
                },
                {
                    icon: '⏱️',
                    label: 'Time Invested',
                    value: this.formatTime(losses.timeInvested),
                    emphasis: 'Hours of progress... gone!'
                }
            ],
            gains: [
                {
                    icon: '✨',
                    label: 'Prestige Points',
                    value: this.calculatePrestigePoints(gameState),
                    emphasis: 'Permanent bonus'
                },
                {
                    icon: '💪',
                    label: 'Production Multiplier',
                    value: `+${(gameState.prestigeLevel + 1) * 50}%`,
                    emphasis: 'Forever'
                }
            ],
            // Make "No" button more prominent
            buttons: [
                {
                    text: "Keep Playing",
                    style: 'primary',
                    action: 'cancel'
                },
                {
                    text: "Yes, Reset Everything",
                    style: 'danger',
                    action: 'confirm',
                    requireHold: true // Require holding button
                }
            ]
        });
        
        if (!confirmation) {
            // They chose to keep playing - reward the decision
            this.rewardPrestigeCancel();
        }
        
        return confirmation;
    }
    
    calculatePrestigeLosses(gameState) {
        // Calculate tangible losses
        this.lossAversion.prestigeLosses = {
            currency: gameState.currency,
            buildings: Object.values(this.game.progression.upgrades)
                .reduce((sum, u) => sum + u.owned, 0),
            progress: gameState.totalCurrencyEarned,
            timeInvested: Date.now() - gameState.sessionStartTime
        };
    }
    
    calculatePrestigePoints(gameState) {
        // Logarithmic prestige point calculation
        return Math.floor(Math.log10(gameState.totalCurrencyEarned / 1000000) * 10);
    }
    
    rewardPrestigeCancel() {
        // Give small reward for "smart" decision to keep playing
        const bonus = this.game.state.currencyPerSecond * 60;
        this.game.addCurrency(bonus);
        
        this.game.ui.showMessage("Smart choice! Here's a bonus for continuing! 🎁");
        
        // Track for optimization
        this.game.analytics.track('prestige_cancelled_by_loss_aversion');
    }
    
    showWhatYouLose() {
        // Visual preview of losses during prestige consideration
        const preview = {
            currentProduction: this.game.state.currencyPerSecond,
            afterPrestige: 0,
            currentBuildings: Object.values(this.game.progression.upgrades)
                .map(u => ({ name: u.name, owned: u.owned }))
                .filter(u => u.owned > 0),
            timeToRecover: this.estimateRecoveryTime()
        };
        
        this.game.ui.showLossPreview(preview);
    }
    
    estimateRecoveryTime() {
        // Estimate how long to get back to current state after prestige
        const currentWorth = this.game.state.currency + 
            (this.game.state.currencyPerSecond * 3600); // 1 hour of production
        
        const prestigeBonus = 1 + (this.game.state.prestigeLevel + 1) * 0.5;
        const estimatedTime = currentWorth / (10 * prestigeBonus); // Rough estimate
        
        return estimatedTime;
    }
    
    generateFOMOEvent() {
        // Random FOMO events
        const eventTypes = [
            'limited_upgrade',
            'double_production',
            'exclusive_achievement',
            'community_goal',
            'flash_discount'
        ];
        
        if (Math.random() < 0.3 && !this.fomo.currentEvent) { // 30% chance
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            this.createFOMOEvent(eventType);
        }
    }
    
    createFOMOEvent(type) {
        const duration = 300000 + Math.random() * 600000; // 5-15 minutes
        
        const events = {
            limited_upgrade: {
                title: "🌟 Limited Edition Upgrade!",
                description: "Golden Seeds - 3x click power!",
                reward: { type: 'upgrade', multiplier: 3 },
                cost: this.game.state.currencyPerSecond * 600,
                stock: 100,
                playersParticipating: Math.floor(Math.random() * 1000) + 500
            },
            double_production: {
                title: "⚡ Double Production Hour!",
                description: "All production DOUBLED for participating players!",
                reward: { type: 'multiplier', value: 2, duration: 3600 },
                cost: 0,
                requirement: 'click 100 times',
                playersParticipating: Math.floor(Math.random() * 5000) + 2000
            },
            exclusive_achievement: {
                title: "🏆 Exclusive Achievement Available!",
                description: "Early Bird - Only for the next 10 minutes!",
                reward: { type: 'achievement', gems: 50 },
                requirement: 'prestige during event',
                playersEarned: Math.floor(Math.random() * 100)
            },
            community_goal: {
                title: "🤝 Community Challenge!",
                description: "Together we grow! Collective clicking goal!",
                goal: 1000000,
                current: Math.floor(Math.random() * 500000),
                reward: { type: 'global', multiplier: 1.5, duration: 86400 },
                contributors: Math.floor(Math.random() * 10000) + 5000
            },
            flash_discount: {
                title: "💸 FLASH SALE - 70% OFF!",
                description: "Premium currency at INSANE prices!",
                discount: 0.7,
                originalPrice: 9.99,
                salePrice: 2.99,
                bought: Math.floor(Math.random() * 200) + 100
            }
        };
        
        this.fomo.currentEvent = {
            type: type,
            data: events[type],
            startTime: Date.now(),
            endTime: Date.now() + duration,
            participated: false
        };
        
        // Show event notification
        this.game.ui.showFOMOEvent(this.fomo.currentEvent);
        
        // Start countdown
        this.addUrgencyTimer({
            id: 'fomo_event',
            endTime: this.fomo.currentEvent.endTime,
            onExpire: () => this.endFOMOEvent(),
            critical: true
        });
    }
    
    endFOMOEvent() {
        if (!this.fomo.currentEvent) return;
        
        // If player didn't participate, emphasize the loss
        if (!this.fomo.currentEvent.participated) {
            this.fomo.missedOpportunities.push({
                event: this.fomo.currentEvent.data.title,
                potentialReward: this.fomo.currentEvent.data.reward,
                missedAt: Date.now()
            });
            
            this.game.ui.showMissedOpportunity(this.fomo.currentEvent);
        }
        
        this.fomo.currentEvent = null;
    }
    
    updateFlashSales() {
        // Random flash sales for premium currency
        if (!this.fomo.flashSale.active && Math.random() < 0.1) { // 10% chance
            const packages = this.anchoring.premiumAnchors;
            const package = packages[Math.floor(Math.random() * packages.length)];
            
            this.fomo.flashSale = {
                active: true,
                item: package,
                discount: 0.3 + Math.random() * 0.4, // 30-70% off
                endTime: Date.now() + 600000, // 10 minutes
                originalPrice: package.price,
                urgencyLevel: 0
            };
            
            this.game.ui.showFlashSale(this.fomo.flashSale);
            
            // Escalating urgency
            this.startFlashSaleUrgency();
        }
    }
    
    startFlashSaleUrgency() {
        const urgencyIntervals = [300000, 180000, 60000, 30000]; // 5min, 3min, 1min, 30sec
        
        urgencyIntervals.forEach((interval, index) => {
            setTimeout(() => {
                if (this.fomo.flashSale.active) {
                    this.fomo.flashSale.urgencyLevel = index + 1;
                    this.game.ui.escalateFlashSaleUrgency(this.fomo.flashSale);
                }
            }, 600000 - interval);
        });
        
        // End sale
        setTimeout(() => {
            if (this.fomo.flashSale.active) {
                this.game.ui.hideFlashSale();
                this.fomo.flashSale.active = false;
                
                // Show regret
                this.game.ui.showMessage("Flash sale ended! You missed out on huge savings! 😢");
            }
        }, 600000);
    }
    
    checkProgressDecay() {
        // Threaten progress decay for extended inactivity
        const idleTime = Date.now() - this.game.state.lastActiveTime;
        
        if (idleTime > 3600000 && !this.lossAversion.decayWarnings.shown) { // 1 hour
            this.lossAversion.decayWarnings.shown = true;
            this.lossAversion.decayWarnings.nextDecayTime = Date.now() + 1800000; // 30 min
            this.lossAversion.decayWarnings.potentialLoss = this.game.state.currency * 0.1;
            
            this.showDecayWarning();
        }
    }
    
    showDecayWarning() {
        const warning = {
            title: "⚠️ Your growth is stagnating!",
            message: `You'll start losing ${this.formatNumber(this.lossAversion.decayWarnings.potentialLoss)} every hour if you don't play!`,
            timer: this.lossAversion.decayWarnings.nextDecayTime,
            actions: [
                {
                    text: "Play Now",
                    action: () => this.preventDecay()
                },
                {
                    text: "Buy Decay Shield (20 Gems)",
                    action: () => this.buyDecayShield()
                }
            ]
        };
        
        this.game.ui.showDecayWarning(warning);
    }
    
    preventDecay() {
        this.lossAversion.decayWarnings.shown = false;
        this.game.ui.hideDecayWarning();
        
        // Reward for returning
        const bonus = this.game.state.currencyPerSecond * 300;
        this.game.addCurrency(bonus);
        this.game.ui.showMessage("Welcome back! Here's a bonus for staying active! 🎁");
    }
    
    buyDecayShield() {
        if (this.game.state.premiumCurrency >= 20) {
            this.game.state.premiumCurrency -= 20;
            this.lossAversion.decayWarnings.shown = false;
            this.game.ui.showSuccess("Decay Shield active for 7 days!");
        } else {
            this.offerGemPurchase("Protect your progress from decay!");
        }
    }
    
    checkSocialPosition() {
        // Simulate social comparison for loss aversion
        const mockLeaderboard = this.generateMockLeaderboard();
        const playerRank = Math.floor(Math.random() * 100) + 50;
        
        // Check if about to be overtaken
        if (playerRank > this.lossAversion.leaderboardPosition && 
            this.lossAversion.leaderboardPosition > 0) {
            
            this.lossAversion.aboutToBeOvertaken = true;
            this.showOvertakeWarning(playerRank);
        }
        
        this.lossAversion.leaderboardPosition = playerRank;
    }
    
    generateMockLeaderboard() {
        // Simulate competitive environment
        return {
            playerAbove: {
                name: `Player${Math.floor(Math.random() * 9999)}`,
                score: this.game.state.totalCurrencyEarned * 1.1,
                gaining: true
            },
            playerBelow: {
                name: `Player${Math.floor(Math.random() * 9999)}`,
                score: this.game.state.totalCurrencyEarned * 0.95,
                gaining: true
            }
        };
    }
    
    showOvertakeWarning(newRank) {
        const warning = {
            title: "📉 You're losing your rank!",
            message: `You've dropped from #${this.lossAversion.leaderboardPosition} to #${newRank}!`,
            competitor: `Player${Math.floor(Math.random() * 9999)} is about to pass you!`,
            action: "Play now to defend your position!"
        };
        
        this.game.ui.showSocialWarning(warning);
    }
    
    updateSunkCost() {
        // Track total investment
        this.sunkCost.totalTimeInvested = Date.now() - this.game.state.startTime;
        this.sunkCost.totalClicksInvested = this.game.state.totalClicks;
        
        // Update peak values
        this.updatePeakValues();
        
        // Remind of investment periodically
        if (Date.now() - this.sunkCost.lastReminderTime > this.sunkCost.reminderFrequency) {
            this.remindOfInvestment();
            this.sunkCost.lastReminderTime = Date.now();
        }
    }
    
    updatePeakValues() {
        this.sunkCost.peakCurrency = Math.max(
            this.sunkCost.peakCurrency, 
            this.game.state.currency
        );
        
        this.sunkCost.peakCPS = Math.max(
            this.sunkCost.peakCPS,
            this.game.state.currencyPerSecond
        );
        
        const unlockedAchievements = Object.values(this.game.achievements || {})
            .filter(a => a.unlocked).length;
        
        this.sunkCost.peakAchievements = Math.max(
            this.sunkCost.peakAchievements,
            unlockedAchievements
        );
    }
    
    remindOfInvestment() {
        // Don't remind if actively playing
        if (Date.now() - this.game.state.lastActiveTime < 60000) return;
        
        const investment = {
            time: this.formatTime(this.sunkCost.totalTimeInvested / 1000),
            clicks: this.formatNumber(this.sunkCost.totalClicksInvested),
            achievements: this.sunkCost.peakAchievements,
            progress: `${Math.floor(this.sunkCost.progressToNextMilestone * 100)}%`
        };
        
        this.game.ui.showInvestmentReminder(investment);
    }
    
    checkForAbandonment() {
        const inactiveTime = Date.now() - this.game.state.lastActiveTime;
        
        // Find appropriate intervention
        const intervention = this.abandonmentPrevention.interventions.find(
            i => inactiveTime > i.delay && 
                 this.abandonmentPrevention.interventionStage < 
                 this.abandonmentPrevention.interventions.indexOf(i) + 1
        );
        
        if (intervention) {
            this.executeAbandonmentIntervention(intervention);
            this.abandonmentPrevention.interventionStage++;
        }
    }
    
    executeAbandonmentIntervention(intervention) {
        switch(intervention.type) {
            case 'gentle_reminder':
                this.game.ui.showNotification({
                    title: "Your farms miss you! 🌱",
                    body: `You've earned ${this.formatNumber(
                        this.game.state.currencyPerSecond * 60
                    )} while away!`,
                    icon: '🌱',
                    requireInteraction: false
                });
                break;
                
            case 'progress_at_risk':
                this.game.ui.showNotification({
                    title: "⚠️ Don't lose your progress!",
                    body: "Your competitors are catching up!",
                    icon: '⚠️',
                    requireInteraction: true,
                    actions: [{
                        action: 'play',
                        title: 'Play Now'
                    }]
                });
                break;
                
            case 'special_offer':
                this.offerComebackBonus();
                break;
                
            case 'final_warning':
                this.showFinalWarning();
                break;
        }
    }
    
    offerComebackBonus() {
        const bonus = {
            currency: this.game.state.currencyPerSecond * 3600, // 1 hour worth
            multiplier: 2,
            duration: 300, // 5 minutes
            gems: 5
        };
        
        this.game.ui.showNotification({
            title: "🎁 Special Comeback Bonus!",
            body: "Return now for DOUBLE production and free gems!",
            icon: '🎁',
            requireInteraction: true,
            data: bonus
        });
    }
    
    showFinalWarning() {
        const warning = {
            title: "😢 We'll miss you!",
            body: `You've invested ${this.formatTime(this.sunkCost.totalTimeInvested / 1000)} in your garden...`,
            actions: [
                {
                    title: "I'm coming back!",
                    action: 'return'
                },
                {
                    title: "Pause my progress",
                    action: 'pause'
                }
            ]
        };
        
        this.game.ui.showNotification(warning);
    }
    
    preventAbandonment() {
        console.log('🚨 Abandonment risk detected - intervening');
        
        // Reset intervention stage
        this.abandonmentPrevention.interventionStage = 0;
        
        // Offer something valuable
        const offers = [
            () => this.offerFreeGems(),
            () => this.offerInstantProgress(),
            () => this.offerExclusiveUpgrade()
        ];
        
        const offer = offers[Math.floor(Math.random() * offers.length)];
        offer();
    }
    
    offerFreeGems() {
        this.game.ui.showUrgentOffer({
            title: "Wait! Don't go!",
            reward: "10 FREE GEMS",
            condition: "Just click 50 times!",
            icon: "💎"
        });
        
        // Track clicks for reward
        let clickCount = 0;
        const originalClick = this.game.click.bind(this.game);
        
        this.game.click = () => {
            originalClick();
            clickCount++;
            
            if (clickCount >= 50) {
                this.game.state.premiumCurrency += 10;
                this.game.ui.showSuccess("10 Gems added! Thanks for staying! 💎");
                this.game.click = originalClick;
            }
        };
    }
    
    offerInstantProgress() {
        const hours = 4;
        const value = this.game.state.currencyPerSecond * 3600 * hours;
        
        this.game.ui.showUrgentOffer({
            title: "Instant 4-Hour Progress!",
            reward: this.formatNumber(value),
            condition: "FREE - Just click below!",
            icon: "⏰",
            action: () => {
                this.game.addCurrency(value);
                this.game.ui.showSuccess(`+${this.formatNumber(value)} added!`);
            }
        });
    }
    
    offerExclusiveUpgrade() {
        const exclusive = {
            name: "Abandonment Shield",
            description: "Gain 50% more when returning from breaks",
            icon: "🛡️",
            effect: "offlineBonus",
            multiplier: 1.5
        };
        
        this.game.ui.showUrgentOffer({
            title: "Exclusive Upgrade!",
            reward: exclusive.name,
            condition: "Only available NOW!",
            icon: exclusive.icon,
            action: () => {
                // Add exclusive upgrade
                this.game.ui.showSuccess("Exclusive upgrade unlocked!");
            }
        });
    }
    
    startTimers() {
        // Initialize all countdown timers
        this.createDailyDeadlines();
        this.createEventTimers();
        this.updateDynamicPricing();
    }
    
    createDailyDeadlines() {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        
        // Daily bonus deadline
        this.addUrgencyTimer({
            id: 'daily_bonus',
            endTime: midnight.getTime(),
            onExpire: () => this.resetDailyBonus(),
            recurring: true,
            message: 'Daily bonus resets in'
        });
        
        // Shop refresh
        const shopReset = new Date();
        shopReset.setHours(12, 0, 0, 0);
        if (shopReset < now) shopReset.setDate(shopReset.getDate() + 1);
        
        this.addUrgencyTimer({
            id: 'shop_refresh',
            endTime: shopReset.getTime(),
            onExpire: () => this.refreshShop(),
            recurring: true,
            message: 'Shop refreshes in'
        });
    }
    
    createEventTimers() {
        // Weekend events
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
            this.createWeekendEvent();
        }
    }
    
    createWeekendEvent() {
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + (7 - endTime.getDay())); // Next Sunday
        endTime.setHours(23, 59, 59);
        
        this.addUrgencyTimer({
            id: 'weekend_event',
            endTime: endTime.getTime(),
            onExpire: () => this.endWeekendEvent(),
            message: 'Weekend bonus ends in',
            critical: true
        });
        
        // Apply weekend bonus
        this.game.progression.addTemporaryMultiplier('production', 1.5, 
            (endTime.getTime() - Date.now()) / 1000
        );
    }
    
    addUrgencyTimer(timer) {
        this.urgency.activeTimers.push(timer);
        this.game.ui.addCountdownTimer(timer);
    }
    
    updateAllTimers() {
        const now = Date.now();
        
        this.urgency.activeTimers = this.urgency.activeTimers.filter(timer => {
            if (now >= timer.endTime) {
                timer.onExpire();
                
                if (timer.recurring) {
                    // Reset timer
                    timer.endTime += 86400000; // Add 24 hours
                    return true;
                }
                
                return false;
            }
            
            // Update UI
            this.game.ui.updateTimer(timer.id, timer.endTime - now);
            return true;
        });
    }
    
    updateUrgencyLevels() {
        // Check all active timers and increase urgency as they approach
        this.urgency.activeTimers.forEach(timer => {
            const timeLeft = timer.endTime - Date.now();
            
            if (timeLeft < 300000 && timer.critical) { // 5 minutes
                this.game.ui.increasTimerUrgency(timer.id, 'critical');
            } else if (timeLeft < 1800000) { // 30 minutes
                this.game.ui.increasTimerUrgency(timer.id, 'high');
            } else if (timeLeft < 3600000) { // 1 hour
                this.game.ui.increasTimerUrgency(timer.id, 'medium');
            }
        });
    }
    
    updateDynamicPricing() {
        if (!this.urgency.dynamicPricing.enabled) return;
        
        // Gradually increase prices to create urgency
        const timeSinceUpdate = Date.now() - this.urgency.dynamicPricing.lastUpdateTime;
        const increaseAmount = this.urgency.dynamicPricing.priceIncreaseRate * 
                              (timeSinceUpdate / 60000); // Per minute
        
        // Apply to gem packages
        this.anchoring.premiumAnchors.forEach(package => {
            package.increasedPrice = package.price * (1 + increaseAmount);
        });
        
        this.urgency.dynamicPricing.lastUpdateTime = Date.now();
        
        // Show price increase warning periodically
        if (increaseAmount > 0.05) { // 5% increase
            this.game.ui.showPriceIncreaseWarning(increaseAmount);
        }
    }
    
    offerGemPurchase(reason) {
        const offer = {
            title: reason || "Need more gems?",
            packages: this.anchoring.premiumAnchors,
            urgency: true,
            limitedTime: true
        };
        
        this.game.ui.showIAPOffer(offer);
    }
    
    formatNumber(num) {
        return this.game.progression ? 
            this.game.progression.formatNumber(num) : 
            num.toLocaleString();
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
    
    update(deltaTime) {
        // Update active timers
        this.updateAllTimers();
        
        // Check notification schedule
        this.checkScheduledNotifications();
        
        // Update FOMO event progress
        if (this.fomo.currentEvent) {
            const timeLeft = this.fomo.currentEvent.endTime - Date.now();
            if (timeLeft < 60000 && timeLeft > 59000) { // 1 minute warning
                this.game.ui.showFOMOLastChance(this.fomo.currentEvent);
            }
        }
    }
    
    checkScheduledNotifications() {
        const hour = new Date().getHours();
        
        Object.entries(this.notificationSchedule).forEach(([type, schedule]) => {
            if (schedule.hour === hour && !schedule.sent) {
                this.sendScheduledNotification(type);
                schedule.sent = true;
                
                // Reset next day
                setTimeout(() => {
                    schedule.sent = false;
                }, 3600000); // 1 hour
            }
        });
    }
    
    sendScheduledNotification(type) {
        const notifications = {
            streakReminder: {
                title: "🔥 Don't lose your streak!",
                body: `Day ${this.game.state.streakDays + 1} is waiting!`
            },
            dailyBonus: {
                title: "🎁 Daily bonus available!",
                body: "Claim your free rewards now!"
            },
            eventReminder: {
                title: "⚡ Limited event ending soon!",
                body: "Don't miss out on exclusive rewards!"
            }
        };
        
        if (notifications[type]) {
            this.game.ui.sendPushNotification(notifications[type]);
        }
    }
}

export default LossAversionEngine;