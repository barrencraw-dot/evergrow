// StreakSystem.js
// Implements daily streak mechanics for habit formation and retention
// Based on psychological principles of commitment, consistency, and loss aversion

class StreakSystem {
    constructor(game) {
        this.game = game;
        
        // Streak configuration
        this.config = {
            // Reset time (midnight local time)
            resetHour: 0,
            resetMinute: 0,
            
            // Grace period for missed days
            gracePeriodHours: 4,
            
            // Protection mechanics
            protectionCost: {
                gems: 10,
                adWatch: true,
                increasesWithStreak: true
            },
            
            // Bonus scaling
            bonusMultiplier: 1.1, // 10% per day
            maxBonusMultiplier: 10, // Cap at 10x
            
            // Milestone bonuses
            milestones: [3, 7, 14, 30, 50, 100, 365],
            
            // Notification timings
            reminderHours: [20, 22, 23] // 8 PM, 10 PM, 11 PM
        };
        
        // Current streak state
        this.streakState = {
            currentStreak: 0,
            longestStreak: 0,
            lastClaimDate: null,
            lastClaimTime: null,
            
            // Protection
            protectionActive: false,
            protectionExpiry: null,
            protectionsUsed: 0,
            
            // Today's status
            claimedToday: false,
            bonusClaimed: false,
            
            // Streak calendar
            calendar: {}, // Date string -> claimed status
            
            // Statistics
            totalDaysPlayed: 0,
            totalStreakBonuses: 0,
            missedDays: 0
        };
        
        // Streak rewards with exponential scaling
        this.rewards = {
            daily: {
                currency: () => this.game.state.currencyPerSecond * 300, // 5 minutes worth
                premiumCurrency: (streak) => Math.floor(Math.log10(streak + 1) * 5),
                multiplier: (streak) => 1 + (streak * 0.01), // 1% per day
                clickPower: (streak) => streak >= 7 ? 1.5 : 1
            },
            
            milestones: {
                3: {
                    name: 'Getting Started',
                    icon: '🌱',
                    rewards: {
                        premiumCurrency: 25,
                        multiplier: 1.5,
                        achievement: 'streak_starter'
                    },
                    message: '3 days in a row! Keep it up!'
                },
                7: {
                    name: 'Week Warrior',
                    icon: '🔥',
                    rewards: {
                        premiumCurrency: 50,
                        multiplier: 2,
                        exclusive: 'flame_cursor',
                        achievement: 'week_warrior'
                    },
                    message: 'A full week! You\'re on fire!'
                },
                14: {
                    name: 'Fortnight Fighter',
                    icon: '💪',
                    rewards: {
                        premiumCurrency: 100,
                        multiplier: 2.5,
                        autoClicker: 5,
                        achievement: 'fortnight_fighter'
                    },
                    message: 'Two weeks of dedication!'
                },
                30: {
                    name: 'Monthly Master',
                    icon: '👑',
                    rewards: {
                        premiumCurrency: 250,
                        multiplier: 5,
                        prestigePoints: 10,
                        exclusive: 'golden_background',
                        achievement: 'monthly_master'
                    },
                    message: 'A full month! Incredible dedication!'
                },
                100: {
                    name: 'Century Champion',
                    icon: '💯',
                    rewards: {
                        premiumCurrency: 1000,
                        multiplier: 10,
                        prestigePoints: 100,
                        exclusive: 'rainbow_effects',
                        title: 'The Dedicated',
                        achievement: 'century_champion'
                    },
                    message: '100 DAYS! You are a legend!'
                },
                365: {
                    name: 'Eternal One',
                    icon: '🌟',
                    rewards: {
                        premiumCurrency: 10000,
                        multiplier: 100,
                        prestigePoints: 1000,
                        exclusive: 'godmode_skin',
                        title: 'The Eternal',
                        achievement: 'year_dedication'
                    },
                    message: 'ONE FULL YEAR! Beyond legendary!'
                }
            }
        };
        
        // Visual feedback configuration
        this.visualEffects = {
            claim: {
                particles: 50,
                colors: ['#FFD700', '#FF6347', '#FF4500'],
                duration: 3000,
                sound: 'streak_claim'
            },
            milestone: {
                particles: 200,
                colors: ['#FFD700', '#FF69B4', '#00CED1', '#9370DB'],
                duration: 5000,
                sound: 'streak_milestone',
                screenShake: true
            },
            protection: {
                shield: true,
                glowColor: '#4169E1',
                sound: 'streak_protected'
            }
        };
        
        // Notification settings
        this.notifications = {
            enabled: true,
            remindersSent: {},
            lastReminderDate: null
        };
        
        // Psychological elements
        this.psychology = {
            // Loss aversion messaging
            lossFraming: [
                'Don\'t lose your {streak} day streak!',
                'Your {bonus}x bonus is at risk!',
                'You\'ll lose {gems} gems worth of bonuses!',
                '{friends} of your friends kept their streak today!'
            ],
            
            // Positive reinforcement
            encouragement: [
                'One more day to beat your record!',
                'You\'re {days} days away from the next milestone!',
                'Keep going for the {milestone} reward!',
                'Your dedication is inspiring!'
            ],
            
            // Social proof
            socialProof: {
                averageStreak: 7,
                topStreaks: [365, 243, 189, 156, 134],
                friendStreaks: []
            }
        };
        
        // Calendar visualization
        this.calendarData = {
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear(),
            history: {} // YYYY-MM-DD -> status
        };
        
        this.lastResetCheck = null;
        this.resetCheckInterval = 60000; // Check every minute
    }
    
    initialize() {
        console.log('🔥 Streak System initialized - Daily habit formation active');
        
        // Load streak calendar
        this.loadCalendarHistory();
        
        // Check current streak status
        this.checkStreakStatus();
        
        // Set up daily reset monitoring
        this.startResetMonitoring();
        
        // Set up reminder system
        this.setupReminders();
        
        // Initialize UI
        this.updateStreakDisplay();
    }
    
    startResetMonitoring() {
        // Check for daily reset every minute
        setInterval(() => {
            this.checkForDailyReset();
        }, this.resetCheckInterval);
        
        // Also check immediately
        this.checkForDailyReset();
    }
    
    checkForDailyReset() {
        const now = new Date();
        const today = this.getDateString(now);
        
        // Check if we've crossed midnight
        if (this.lastResetCheck) {
            const lastCheck = new Date(this.lastResetCheck);
            
            if (lastCheck.getDate() !== now.getDate()) {
                // Day changed!
                this.handleDayChange();
            }
        }
        
        this.lastResetCheck = now;
        
        // Update claimed today status
        this.streakState.claimedToday = this.streakState.lastClaimDate === today;
    }
    
    handleDayChange() {
        console.log('📅 New day detected - checking streak');
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = this.getDateString(yesterday);
        
        // Check if streak continues
        if (this.streakState.lastClaimDate === yesterdayString) {
            // Streak continues if claimed yesterday
            this.updateStreakDisplay();
            
            // Send morning reminder
            if (this.notifications.enabled) {
                this.sendMorningReminder();
            }
        } else if (!this.streakState.protectionActive) {
            // Streak broken
            this.handleStreakBreak();
        }
        
        // Reset daily status
        this.streakState.claimedToday = false;
        this.streakState.bonusClaimed = false;
        
        // Clear reminder flags
        this.notifications.remindersSent = {};
    }
    
    claimDailyBonus() {
        const today = this.getDateString(new Date());
        
        // Check if already claimed
        if (this.streakState.claimedToday) {
            this.game.ui.showMessage('Already claimed today\'s bonus!');
            return false;
        }
        
        // Update claim date
        const wasYesterday = this.checkConsecutive();
        this.streakState.lastClaimDate = today;
        this.streakState.lastClaimTime = Date.now();
        this.streakState.claimedToday = true;
        
        // Update streak
        if (wasYesterday || this.streakState.currentStreak === 0) {
            this.streakState.currentStreak++;
        } else if (!this.streakState.protectionActive) {
            // Streak broken, restart at 1
            this.streakState.currentStreak = 1;
        }
        
        // Update longest streak
        if (this.streakState.currentStreak > this.streakState.longestStreak) {
            this.streakState.longestStreak = this.streakState.currentStreak;
            
            // Achievement for beating personal best
            if (this.streakState.longestStreak > 1) {
                this.game.achievements.unlock('personal_best_streak');
            }
        }
        
        // Calculate and apply rewards
        const rewards = this.calculateDailyRewards();
        this.applyDailyRewards(rewards);
        
        // Update calendar
        this.updateCalendar(today, true);
        
        // Check for milestones
        this.checkMilestones();
        
        // Visual feedback
        this.showClaimEffects(rewards);
        
        // Update statistics
        this.streakState.totalDaysPlayed++;
        this.streakState.totalStreakBonuses += rewards.totalValue;
        
        // Save state
        this.saveStreakData();
        
        // Social notification
        if (this.streakState.currentStreak >= 7) {
            this.game.socialProof.broadcastStreak(this.streakState.currentStreak);
        }
        
        return true;
    }
    
    checkConsecutive() {
        if (!this.streakState.lastClaimDate) return false;
        
        const lastClaim = new Date(this.streakState.lastClaimDate);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if last claim was yesterday
        return this.getDateString(yesterday) === this.streakState.lastClaimDate;
    }
    
    calculateDailyRewards() {
        const streak = this.streakState.currentStreak;
        const rewards = {
            currency: this.rewards.daily.currency(),
            premiumCurrency: this.rewards.daily.premiumCurrency(streak),
            multiplier: this.rewards.daily.multiplier(streak),
            clickPower: this.rewards.daily.clickPower(streak),
            totalValue: 0
        };
        
        // Apply streak multiplier
        const streakMultiplier = Math.min(
            this.config.maxBonusMultiplier,
            Math.pow(this.config.bonusMultiplier, streak - 1)
        );
        
        rewards.currency *= streakMultiplier;
        rewards.totalValue = rewards.currency + (rewards.premiumCurrency * 1000);
        
        // Special bonuses at intervals
        if (streak % 7 === 0) {
            rewards.premiumCurrency += 10;
            rewards.weeklyBonus = true;
        }
        
        return rewards;
    }
    
    applyDailyRewards(rewards) {
        // Apply currency
        this.game.addCurrency(rewards.currency);
        
        // Apply premium currency
        this.game.state.premiumCurrency += rewards.premiumCurrency;
        
        // Apply multipliers
        if (rewards.multiplier > 1) {
            this.game.progression.addTemporaryMultiplier(
                'production',
                rewards.multiplier,
                86400 // 24 hours
            );
        }
        
        // Apply click power
        if (rewards.clickPower > 1) {
            this.game.progression.addTemporaryMultiplier(
                'click',
                rewards.clickPower,
                86400
            );
        }
        
        this.streakState.bonusClaimed = true;
    }
    
    checkMilestones() {
        const streak = this.streakState.currentStreak;
        const milestone = this.rewards.milestones[streak];
        
        if (milestone) {
            this.unlockMilestone(streak, milestone);
        }
        
        // Check next milestone for UI
        const nextMilestone = this.config.milestones.find(m => m > streak);
        if (nextMilestone) {
            const daysToNext = nextMilestone - streak;
            this.game.ui.updateStreakProgress(streak, nextMilestone, daysToNext);
        }
    }
    
    unlockMilestone(days, milestone) {
        console.log(`🎉 Streak milestone reached: ${days} days!`);
        
        // Show epic notification
        this.game.ui.showStreakMilestone({
            days,
            milestone,
            effects: this.visualEffects.milestone
        });
        
        // Apply rewards
        const rewards = milestone.rewards;
        
        if (rewards.premiumCurrency) {
            this.game.state.premiumCurrency += rewards.premiumCurrency;
        }
        
        if (rewards.multiplier) {
            this.game.progression.multipliers.streak = 
                (this.game.progression.multipliers.streak || 1) * rewards.multiplier;
        }
        
        if (rewards.prestigePoints) {
            this.game.state.prestigePoints += rewards.prestigePoints;
        }
        
        if (rewards.autoClicker) {
            this.game.progression.upgrades.autoClicker.owned += rewards.autoClicker;
            this.game.progression.updateProduction();
        }
        
        if (rewards.exclusive) {
            this.unlockExclusive(rewards.exclusive);
        }
        
        if (rewards.title) {
            this.game.ui.unlockTitle(rewards.title);
        }
        
        if (rewards.achievement) {
            this.game.achievements.unlock(rewards.achievement);
        }
        
        // Massive dopamine hit
        this.game.dopamine.triggerAchievementRush();
        
        // Social broadcast for major milestones
        if (days >= 30) {
            this.game.socialProof.broadcastMilestone('streak', days);
        }
    }
    
    unlockExclusive(exclusiveId) {
        switch(exclusiveId) {
            case 'flame_cursor':
                this.game.ui.enableFlameCursor();
                break;
                
            case 'golden_background':
                this.game.ui.enableGoldenBackground();
                break;
                
            case 'rainbow_effects':
                this.game.ui.enableRainbowEffects();
                break;
                
            case 'godmode_skin':
                this.game.ui.enableGodModeSkin();
                break;
        }
    }
    
    showClaimEffects(rewards) {
        const effects = this.visualEffects.claim;
        
        // Show reward summary
        this.game.ui.showStreakClaim({
            day: this.streakState.currentStreak,
            rewards,
            effects
        });
        
        // Play sound
        this.game.music.playSound(effects.sound);
        
        // Create particle effect
        this.createStreakParticles(effects);
        
        // Update streak flame animation
        this.game.ui.updateStreakFlame(this.streakState.currentStreak);
    }
    
    createStreakParticles(effects) {
        const particles = [];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        for (let i = 0; i < effects.particles; i++) {
            const angle = (Math.PI * 2 * i) / effects.particles;
            const speed = 3 + Math.random() * 3;
            
            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: effects.colors[Math.floor(Math.random() * effects.colors.length)],
                size: 5 + Math.random() * 10,
                lifetime: effects.duration,
                type: 'flame'
            });
        }
        
        this.game.ui.createParticleSystem(particles);
    }
    
    protectStreak() {
        if (this.streakState.protectionActive) {
            this.game.ui.showMessage('Streak protection already active!');
            return false;
        }
        
        // Set protection
        this.streakState.protectionActive = true;
        this.streakState.protectionExpiry = Date.now() + 86400000; // 24 hours
        this.streakState.protectionsUsed++;
        
        // Visual feedback
        this.showProtectionEffect();
        
        // Save state
        this.saveStreakData();
        
        return true;
    }
    
    showProtectionEffect() {
        const effects = this.visualEffects.protection;
        
        // Show shield effect
        this.game.ui.showStreakProtection({
            duration: 86400000,
            effects
        });
        
        // Play sound
        this.game.music.playSound(effects.sound);
        
        // Update UI
        this.updateStreakDisplay();
    }
    
    checkStreakStatus() {
        const now = Date.now();
        
        // Check if protection expired
        if (this.streakState.protectionActive && 
            this.streakState.protectionExpiry < now) {
            this.streakState.protectionActive = false;
        }
        
        // Check if streak is at risk
        if (!this.streakState.claimedToday && this.streakState.currentStreak > 0) {
            const hoursLeft = this.getHoursUntilReset();
            
            if (hoursLeft < this.config.gracePeriodHours) {
                // Streak at risk!
                this.game.eventBus.emit('streak_at_risk', {
                    streak: this.streakState.currentStreak,
                    hoursLeft
                });
            }
        }
    }
    
    getHoursUntilReset() {
        const now = new Date();
        const reset = new Date(now);
        reset.setHours(24, 0, 0, 0); // Midnight tonight
        
        return (reset - now) / 3600000; // Convert to hours
    }
    
    handleStreakBreak() {
        const lostStreak = this.streakState.currentStreak;
        
        if (lostStreak > 0) {
            // Show dramatic loss animation
            this.game.ui.showStreakLoss({
                daysLost: lostStreak,
                rewards: this.calculateLostRewards(lostStreak)
            });
            
            // Reset streak
            this.streakState.currentStreak = 0;
            this.streakState.missedDays++;
            
            // Clear multipliers
            this.game.progression.multipliers.streak = 1;
            
            // Analytics
            this.game.analytics.track('streak_broken', {
                daysLost: lostStreak,
                protectionsUsed: this.streakState.protectionsUsed
            });
        }
    }
    
    calculateLostRewards(streak) {
        // Calculate what was lost for loss aversion
        const dailyRewards = this.calculateDailyRewards();
        const totalLost = dailyRewards.totalValue * streak;
        
        return {
            currency: totalLost,
            premiumCurrency: streak * 5,
            multiplier: this.rewards.daily.multiplier(streak)
        };
    }
    
    setupReminders() {
        // Set up reminder checking
        setInterval(() => {
            this.checkReminderTime();
        }, 300000); // Check every 5 minutes
    }
    
    checkReminderTime() {
        if (!this.notifications.enabled) return;
        if (this.streakState.claimedToday) return;
        
        const now = new Date();
        const hour = now.getHours();
        const today = this.getDateString(now);
        
        // Check if we should send a reminder
        if (this.config.reminderHours.includes(hour) && 
            !this.notifications.remindersSent[hour] &&
            this.notifications.lastReminderDate !== today) {
            
            this.sendStreakReminder(hour);
            this.notifications.remindersSent[hour] = true;
            this.notifications.lastReminderDate = today;
        }
    }
    
    sendStreakReminder(hour) {
        const hoursLeft = 24 - hour;
        const streak = this.streakState.currentStreak;
        
        // Use loss framing for psychological impact
        const message = this.psychology.lossFraming[
            Math.floor(Math.random() * this.psychology.lossFraming.length)
        ]
        .replace('{streak}', streak)
        .replace('{bonus}', this.rewards.daily.multiplier(streak).toFixed(1))
        .replace('{gems}', this.rewards.daily.premiumCurrency(streak))
        .replace('{friends}', Math.floor(Math.random() * 10) + 5);
        
        this.game.ui.sendPushNotification({
            title: `🔥 ${hoursLeft} hours left!`,
            body: message,
            icon: '🔥',
            tag: 'streak-reminder',
            requireInteraction: true,
            actions: [
                { action: 'claim', title: 'Claim Now' },
                { action: 'snooze', title: 'Remind Later' }
            ]
        });
    }
    
    sendMorningReminder() {
        const encouragement = this.psychology.encouragement[
            Math.floor(Math.random() * this.psychology.encouragement.length)
        ];
        
        const nextMilestone = this.config.milestones.find(
            m => m > this.streakState.currentStreak
        );
        
        const message = encouragement
            .replace('{days}', nextMilestone - this.streakState.currentStreak)
            .replace('{milestone}', this.rewards.milestones[nextMilestone]?.name || 'next');
        
        this.game.ui.sendPushNotification({
            title: '🌅 Good morning! Ready to grow?',
            body: message,
            icon: '🌱',
            tag: 'morning-reminder'
        });
    }
    
    updateCalendar(date, claimed) {
        this.calendarData.history[date] = claimed;
        
        // Update UI calendar
        this.game.ui.updateStreakCalendar(this.calendarData);
    }
    
    loadCalendarHistory() {
        // Load last 365 days of history
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = this.getDateString(date);
            
            // Check if this date was claimed (would load from save)
            this.calendarData.history[dateString] = 
                this.calendarData.history[dateString] || false;
        }
    }
    
    updateStreakDisplay() {
        this.game.ui.updateStreakDisplay({
            current: this.streakState.currentStreak,
            longest: this.streakState.longestStreak,
            protected: this.streakState.protectionActive,
            claimedToday: this.streakState.claimedToday,
            nextMilestone: this.getNextMilestone()
        });
    }
    
    getNextMilestone() {
        return this.config.milestones.find(
            m => m > this.streakState.currentStreak
        ) || null;
    }
    
    getDateString(date) {
        return date.toISOString().split('T')[0];
    }
    
    saveStreakData() {
        this.game.saveGameState();
    }
    
    getSaveData() {
        return {
            state: this.streakState,
            calendar: this.calendarData,
            notifications: {
                enabled: this.notifications.enabled,
                lastReminderDate: this.notifications.lastReminderDate
            }
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        
        if (data.state) {
            Object.assign(this.streakState, data.state);
        }
        
        if (data.calendar) {
            Object.assign(this.calendarData, data.calendar);
        }
        
        if (data.notifications) {
            this.notifications.enabled = data.notifications.enabled;
            this.notifications.lastReminderDate = data.notifications.lastReminderDate;
        }
        
        // Check current status after loading
        this.checkStreakStatus();
        this.updateStreakDisplay();
    }
    
    update(deltaTime) {
        // Check protection expiry
        if (this.streakState.protectionActive && 
            Date.now() > this.streakState.protectionExpiry) {
            this.streakState.protectionActive = false;
            this.updateStreakDisplay();
        }
        
        // Periodic status check
        if (Math.random() < 0.01) { // 1% chance per update
            this.checkStreakStatus();
        }
    }
}

export default StreakSystem;