// EventSystem.js
// Implements time-limited events for FOMO generation and engagement spikes
// Based on scarcity psychology, social competition, and urgency creation

class EventSystem {
    constructor(game) {
        this.game = game;
        
        // Event configuration
        this.config = {
            // Event frequency
            minTimeBetweenEvents: 7200000, // 2 hours
            maxTimeBetweenEvents: 21600000, // 6 hours
            
            // Event duration ranges
            shortEventDuration: 300000, // 5 minutes
            mediumEventDuration: 1800000, // 30 minutes
            longEventDuration: 3600000, // 1 hour
            weekendEventDuration: 172800000, // 48 hours
            
            // Participation thresholds
            minParticipation: 0.3, // 30% of active players
            optimalParticipation: 0.7, // 70% target
            
            // Reward scaling
            baseRewardMultiplier: 2,
            participationBonus: 1.5,
            speedBonus: 2,
            
            // Event probability weights
            eventTypeWeights: {
                clickRush: 20,
                goldenHour: 15,
                communityGoal: 25,
                competition: 20,
                flashSale: 10,
                mystery: 10
            }
        };
        
        // Active events
        this.activeEvents = [];
        this.eventHistory = [];
        this.nextEventTime = 0;
        
        // Event templates with psychological hooks
        this.eventTemplates = {
            clickRush: {
                name: 'Click Frenzy',
                icon: '⚡',
                type: 'individual',
                duration: 'short',
                description: 'Every click counts double!',
                mechanics: {
                    clickMultiplier: 2,
                    bonusPerClick: true,
                    requiredClicks: 1000
                },
                rewards: {
                    completion: {
                        currency: 'cps_based',
                        multiplier: 3600, // 1 hour of production
                        premiumCurrency: 10
                    },
                    participation: {
                        currency: 'cps_based',
                        multiplier: 600 // 10 minutes
                    }
                },
                urgency: 'high',
                socialProof: 'live_counter'
            },
            
            goldenHour: {
                name: 'Golden Hour',
                icon: '🌟',
                type: 'passive',
                duration: 'medium',
                description: 'All production TRIPLED!',
                mechanics: {
                    globalMultiplier: 3,
                    visualEffect: 'golden_glow'
                },
                rewards: {
                    automatic: true,
                    bonusOnLogin: {
                        currency: 'cps_based',
                        multiplier: 1800
                    }
                },
                urgency: 'medium',
                announcement: 'global'
            },
            
            communityGoal: {
                name: 'Community Challenge',
                icon: '🤝',
                type: 'cooperative',
                duration: 'long',
                description: 'Work together for massive rewards!',
                mechanics: {
                    globalGoal: 1000000000, // 1 billion
                    individualContribution: true,
                    progressBar: 'global',
                    milestones: [0.25, 0.5, 0.75, 1.0]
                },
                rewards: {
                    milestones: {
                        0.25: { premiumCurrency: 5 },
                        0.5: { multiplier: 1.5, duration: 3600 },
                        0.75: { premiumCurrency: 10 },
                        1.0: { 
                            multiplier: 2, 
                            duration: 86400,
                            exclusive: 'community_badge' 
                        }
                    },
                    topContributors: {
                        top10: { premiumCurrency: 100 },
                        top100: { premiumCurrency: 50 },
                        top1000: { premiumCurrency: 20 }
                    }
                },
                urgency: 'medium',
                socialProof: 'contributor_feed'
            },
            
            competition: {
                name: 'Growth Tournament',
                icon: '🏆',
                type: 'competitive',
                duration: 'medium',
                description: 'Compete for the top spot!',
                mechanics: {
                    leaderboard: 'event_specific',
                    scoring: 'currency_gained',
                    brackets: ['bronze', 'silver', 'gold', 'platinum'],
                    realTimeUpdates: true
                },
                rewards: {
                    placement: {
                        1: { 
                            premiumCurrency: 500,
                            title: 'Champion',
                            exclusive: 'champion_crown'
                        },
                        2: { premiumCurrency: 300 },
                        3: { premiumCurrency: 200 },
                        'top10': { premiumCurrency: 100 },
                        'top100': { premiumCurrency: 50 }
                    },
                    participation: {
                        premiumCurrency: 10
                    }
                },
                urgency: 'high',
                socialProof: 'live_rankings'
            },
            
            flashSale: {
                name: 'Flash Sale',
                icon: '💸',
                type: 'monetization',
                duration: 'short',
                description: 'INSANE discounts for a LIMITED TIME!',
                mechanics: {
                    discounts: {
                        premiumCurrency: 0.7, // 70% off
                        specialPackage: 0.8
                    },
                    stockLimited: true,
                    purchaseLimit: 1
                },
                visuals: {
                    countdown: 'aggressive',
                    priceSlash: true,
                    urgencyPulse: true
                },
                psychology: {
                    anchoringPrice: true,
                    scarcityCounter: true,
                    socialProof: 'purchases_feed'
                }
            },
            
            mystery: {
                name: '???',
                icon: '❓',
                type: 'discovery',
                duration: 'variable',
                description: 'Something special is happening...',
                mechanics: {
                    hiddenObjective: true,
                    clues: ['gradual', 'cryptic'],
                    communityTheories: true
                },
                rewards: {
                    discovery: {
                        premiumCurrency: 50,
                        achievement: 'mystery_solver',
                        exclusive: 'secret_unlock'
                    },
                    participation: {
                        clueBonus: true
                    }
                },
                urgency: 'variable',
                reveal: 'dramatic'
            }
        };
        
        // Special event calendar
        this.specialEvents = {
            weekend: {
                name: 'Weekend Bonanza',
                schedule: 'friday_evening',
                duration: 'weekend',
                multiplier: 2,
                autoActivate: true
            },
            holiday: {
                christmas: {
                    name: 'Winter Festival',
                    dates: ['12-20', '12-26'],
                    rewards: 'themed',
                    exclusive: 'snow_effects'
                },
                halloween: {
                    name: 'Spooky Season',
                    dates: ['10-25', '10-31'],
                    theme: 'dark',
                    exclusive: 'ghost_particles'
                }
            }
        };
        
        // Event state tracking
        this.eventState = {
            totalEventsRun: 0,
            totalParticipation: 0,
            averageCompletion: 0,
            popularEvents: {},
            lastEventType: null,
            
            // Player-specific
            eventsParticipated: 0,
            eventsCompleted: 0,
            totalEventRewards: 0,
            favoriteEventType: null
        };
        
        // Visual effects
        this.eventEffects = {
            announcement: {
                dramatic: true,
                screenTakeover: true,
                countdown: true,
                particles: 100,
                sound: 'event_horn'
            },
            active: {
                borderGlow: true,
                timerPulse: true,
                progressAnimation: true
            },
            completion: {
                celebration: true,
                rewardShower: true,
                sound: 'event_complete'
            }
        };
        
        // Social proof generation
        this.socialProofData = {
            participation: 0,
            recentWinners: [],
            topContributors: [],
            liveUpdates: []
        };
    }
    
    initialize() {
        console.log('🎉 Event System initialized - FOMO generation active');
        
        // Schedule first event
        this.scheduleNextEvent();
        
        // Start event monitoring
        this.startEventMonitoring();
        
        // Check for special calendar events
        this.checkSpecialEvents();
        
        // Initialize social proof
        this.initializeSocialProof();
    }
    
    startEventMonitoring() {
        // Check for event starts/ends
        setInterval(() => {
            this.updateActiveEvents();
            this.checkEventSchedule();
        }, 1000);
        
        // Update social proof
        setInterval(() => {
            this.updateSocialProof();
        }, 5000);
    }
    
    scheduleNextEvent() {
        const delay = this.config.minTimeBetweenEvents + 
            Math.random() * (this.config.maxTimeBetweenEvents - this.config.minTimeBetweenEvents);
        
        this.nextEventTime = Date.now() + delay;
        
        console.log(`Next event scheduled in ${Math.round(delay / 60000)} minutes`);
    }
    
    checkEventSchedule() {
        if (Date.now() >= this.nextEventTime && this.activeEvents.length === 0) {
            this.triggerRandomEvent();
        }
    }
    
    triggerRandomEvent() {
        // Select event type based on weights
        const eventType = this.selectWeightedEventType();
        
        // Don't repeat same event type
        if (eventType === this.eventState.lastEventType) {
            return this.triggerRandomEvent();
        }
        
        this.startEvent(eventType);
        this.eventState.lastEventType = eventType;
        
        // Schedule next event
        this.scheduleNextEvent();
    }
    
    selectWeightedEventType() {
        const weights = this.config.eventTypeWeights;
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        
        let random = Math.random() * totalWeight;
        
        for (const [type, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) return type;
        }
        
        return 'clickRush'; // Fallback
    }
    
    startEvent(eventType, customConfig = {}) {
        const template = this.eventTemplates[eventType];
        if (!template) return;
        
        // Create event instance
        const event = {
            id: `${eventType}_${Date.now()}`,
            type: eventType,
            name: template.name,
            icon: template.icon,
            description: template.description,
            startTime: Date.now(),
            duration: this.getEventDuration(template.duration),
            endTime: Date.now() + this.getEventDuration(template.duration),
            
            // Merge template with custom config
            ...template,
            ...customConfig,
            
            // State tracking
            state: {
                active: true,
                progress: 0,
                participants: 0,
                contributions: {},
                completed: false
            }
        };
        
        // Add to active events
        this.activeEvents.push(event);
        
        // Announce event
        this.announceEvent(event);
        
        // Apply event effects
        this.applyEventEffects(event);
        
        // Track statistics
        this.eventState.totalEventsRun++;
        
        // Analytics
        this.game.analytics.track('event_started', {
            type: eventType,
            duration: event.duration,
            rewards: event.rewards
        });
        
        return event;
    }
    
    getEventDuration(durationType) {
        switch(durationType) {
            case 'short': return this.config.shortEventDuration;
            case 'medium': return this.config.mediumEventDuration;
            case 'long': return this.config.longEventDuration;
            case 'weekend': return this.config.weekendEventDuration;
            case 'variable': 
                return this.config.shortEventDuration + 
                    Math.random() * (this.config.longEventDuration - this.config.shortEventDuration);
            default: return this.config.mediumEventDuration;
        }
    }
    
    announceEvent(event) {
        // Dramatic announcement
        const announcement = {
            title: `🎉 ${event.name} has begun!`,
            subtitle: event.description,
            icon: event.icon,
            duration: event.duration,
            effects: this.eventEffects.announcement,
            
            // Call to action
            cta: this.getEventCTA(event.type),
            
            // Social proof
            socialProof: this.generateInitialSocialProof()
        };
        
        // Show announcement
        this.game.ui.showEventAnnouncement(announcement);
        
        // Play fanfare
        this.game.music.playSound(this.eventEffects.announcement.sound);
        
        // Global notification for major events
        if (event.type === 'communityGoal' || event.type === 'competition') {
            this.game.socialProof.broadcastEventStart(event);
        }
    }
    
    getEventCTA(eventType) {
        const ctas = {
            clickRush: 'Click now for DOUBLE rewards!',
            goldenHour: 'Your production is TRIPLED!',
            communityGoal: 'Join the community effort!',
            competition: 'Compete for amazing prizes!',
            flashSale: 'LIMITED TIME ONLY!',
            mystery: 'Discover the secret...'
        };
        
        return ctas[eventType] || 'Join now!';
    }
    
    generateInitialSocialProof() {
        // Simulate initial participation
        const fakeParticipants = Math.floor(100 + Math.random() * 400);
        
        return {
            message: `${fakeParticipants} players already participating!`,
            growing: true
        };
    }
    
    applyEventEffects(event) {
        switch(event.type) {
            case 'clickRush':
                this.applyClickRushEffects(event);
                break;
                
            case 'goldenHour':
                this.applyGoldenHourEffects(event);
                break;
                
            case 'communityGoal':
                this.setupCommunityGoal(event);
                break;
                
            case 'competition':
                this.setupCompetition(event);
                break;
                
            case 'flashSale':
                this.setupFlashSale(event);
                break;
                
            case 'mystery':
                this.setupMysteryEvent(event);
                break;
        }
        
        // Visual effects for all events
        this.game.ui.showEventActiveEffects(event);
    }
    
    applyClickRushEffects(event) {
        // Override click handler
        const originalClick = this.game.click.bind(this.game);
        
        this.game.click = () => {
            originalClick();
            
            // Double click value during event
            const bonus = this.game.state.clickPower;
            this.game.addCurrency(bonus);
            
            // Update event progress
            event.state.progress++;
            this.updateEventProgress(event);
            
            // Visual feedback
            this.game.ui.showEventClickFeedback(event.mechanics.clickMultiplier);
            
            // Check completion
            if (event.state.progress >= event.mechanics.requiredClicks) {
                this.completeEvent(event);
            }
        };
        
        // Store original for cleanup
        event.cleanup = () => {
            this.game.click = originalClick;
        };
    }
    
    applyGoldenHourEffects(event) {
        // Apply global multiplier
        this.game.progression.addTemporaryMultiplier(
            'production',
            event.mechanics.globalMultiplier,
            event.duration / 1000
        );
        
        // Visual effect
        this.game.ui.enableGoldenGlow(event.duration);
        
        // Auto-reward for participation
        event.state.participants++;
        this.trackParticipation(event);
    }
    
    setupCommunityGoal(event) {
        // Initialize community tracking
        event.state.communityProgress = 0;
        event.state.contributors = {};
        
        // Hook into currency gains
        this.game.eventBus.on('currency_gained', (amount) => {
            if (!event.state.active) return;
            
            // Add to community progress
            event.state.communityProgress += amount;
            
            // Track individual contribution
            const userId = this.game.user?.id || 'player';
            event.state.contributors[userId] = 
                (event.state.contributors[userId] || 0) + amount;
            
            // Update progress
            event.state.progress = event.state.communityProgress / event.mechanics.globalGoal;
            this.updateEventProgress(event);
            
            // Check milestones
            this.checkCommunityMilestones(event);
        });
        
        // Show progress bar
        this.game.ui.showCommunityProgress(event);
    }
    
    checkCommunityMilestones(event) {
        const progress = event.state.progress;
        
        event.mechanics.milestones.forEach(milestone => {
            const key = `milestone_${milestone}`;
            
            if (progress >= milestone && !event.state[key]) {
                event.state[key] = true;
                
                // Award milestone rewards
                const rewards = event.rewards.milestones[milestone];
                this.awardEventRewards(rewards, `Community Milestone ${milestone * 100}%`);
                
                // Celebration
                this.game.ui.showCommunityMilestone(milestone);
            }
        });
        
        // Check completion
        if (progress >= 1 && !event.state.completed) {
            this.completeEvent(event);
        }
    }
    
    setupCompetition(event) {
        // Initialize leaderboard
        event.state.leaderboard = [];
        event.state.playerScore = 0;
        event.state.startCurrency = this.game.state.totalCurrencyEarned;
        
        // Track progress
        const updateScore = () => {
            if (!event.state.active) return;
            
            const gained = this.game.state.totalCurrencyEarned - event.state.startCurrency;
            event.state.playerScore = gained;
            
            // Update leaderboard
            this.updateCompetitionLeaderboard(event);
        };
        
        // Update frequently
        event.scoreInterval = setInterval(updateScore, 1000);
        
        // Show leaderboard UI
        this.game.ui.showCompetitionLeaderboard(event);
    }
    
    updateCompetitionLeaderboard(event) {
        // Simulate other players
        if (event.state.leaderboard.length < 100) {
            for (let i = 0; i < 100; i++) {
                event.state.leaderboard.push({
                    name: `Player${Math.floor(Math.random() * 9999)}`,
                    score: Math.floor(Math.random() * event.state.playerScore * 2),
                    rank: 0
                });
            }
        }
        
        // Update simulated scores
        event.state.leaderboard.forEach(entry => {
            if (Math.random() < 0.3) {
                entry.score += Math.floor(Math.random() * 1000);
            }
        });
        
        // Add player
        event.state.leaderboard.push({
            name: 'You',
            score: event.state.playerScore,
            rank: 0,
            isPlayer: true
        });
        
        // Sort and rank
        event.state.leaderboard.sort((a, b) => b.score - a.score);
        event.state.leaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });
        
        // Get player rank
        const playerEntry = event.state.leaderboard.find(e => e.isPlayer);
        event.state.playerRank = playerEntry?.rank || 999;
        
        // Update UI
        this.game.ui.updateCompetitionLeaderboard(event.state.leaderboard.slice(0, 10));
        
        // Show rank changes
        if (event.state.lastRank && event.state.playerRank < event.state.lastRank) {
            this.game.ui.showRankImprovement(event.state.lastRank, event.state.playerRank);
        }
        
        event.state.lastRank = event.state.playerRank;
    }
    
    setupFlashSale(event) {
        // Modify shop prices
        Object.values(this.game.shop?.packages || {}).forEach(package => {
            package.originalPrice = package.price;
            package.salePrice = package.price * (1 - event.mechanics.discounts.premiumCurrency);
            package.onSale = true;
        });
        
        // Show sale UI with aggressive urgency
        this.game.ui.showFlashSaleOverlay(event);
        
        // Track purchases
        event.state.purchases = 0;
        event.state.revenue = 0;
        
        // Limited stock counter
        event.state.stockRemaining = Math.floor(50 + Math.random() * 50);
        
        // Cleanup function
        event.cleanup = () => {
            // Restore original prices
            Object.values(this.game.shop?.packages || {}).forEach(package => {
                package.price = package.originalPrice;
                package.onSale = false;
                delete package.originalPrice;
                delete package.salePrice;
            });
        };
    }
    
    setupMysteryEvent(event) {
        // Hidden objective
        const objectives = [
            { type: 'clicks', target: 777, hint: 'Lucky numbers...' },
            { type: 'pattern', sequence: [1, 1, 2, 3, 5, 8], hint: 'Nature\'s sequence' },
            { type: 'timing', intervals: [1000, 2000, 3000], hint: 'Rhythm is key' },
            { type: 'production', target: 123456, hint: 'Count carefully' }
        ];
        
        event.hiddenObjective = objectives[Math.floor(Math.random() * objectives.length)];
        event.state.cluesRevealed = 0;
        event.state.attempts = [];
        
        // Gradual clue reveal
        event.clueInterval = setInterval(() => {
            if (event.state.cluesRevealed < 3) {
                this.revealMysteryClue(event);
            }
        }, event.duration / 4);
        
        // Show mystery UI
        this.game.ui.showMysteryEvent(event);
        
        // Track attempts
        this.trackMysteryAttempts(event);
    }
    
    revealMysteryClue(event) {
        event.state.cluesRevealed++;
        
        const clues = [
            event.hiddenObjective.hint,
            `Type: ${event.hiddenObjective.type}`,
            `Target involves: ${event.hiddenObjective.target || 'sequence'}`
        ];
        
        const clue = clues[event.state.cluesRevealed - 1];
        
        this.game.ui.revealMysteryClue(clue, event.state.cluesRevealed);
        
        // Community speculation
        this.generateCommunityTheories(event);
    }
    
    generateCommunityTheories(event) {
        const theories = [
            'I think it has to do with clicking!',
            'Try the Fibonacci sequence!',
            'Anyone else notice the timing?',
            'It\'s definitely about production levels'
        ];
        
        const fakeTheories = [];
        for (let i = 0; i < 3; i++) {
            fakeTheories.push({
                user: `Player${Math.floor(Math.random() * 9999)}`,
                theory: theories[Math.floor(Math.random() * theories.length)],
                likes: Math.floor(Math.random() * 50)
            });
        }
        
        this.game.ui.showCommunityTheories(fakeTheories);
    }
    
    trackMysteryAttempts(event) {
        // Would implement specific tracking based on objective type
        // For now, random completion
        setTimeout(() => {
            if (Math.random() < 0.3 && event.state.active) {
                this.solveMystery(event);
            }
        }, event.duration * 0.7);
    }
    
    solveMystery(event) {
        event.state.solved = true;
        event.state.solver = 'You';
        
        // Dramatic reveal
        this.game.ui.showMysteryReveal(event);
        
        // Complete event
        this.completeEvent(event);
    }
    
    trackParticipation(event) {
        if (!event.state.participated) {
            event.state.participated = true;
            event.state.participants++;
            
            this.eventState.eventsParticipated++;
            
            // Social proof update
            this.socialProofData.participation++;
        }
    }
    
    updateEventProgress(event) {
        // Update UI progress
        this.game.ui.updateEventProgress(event);
        
        // Check for near completion
        if (event.state.progress > 0.9 && !event.state.nearComplete) {
            event.state.nearComplete = true;
            this.game.ui.showEventNearCompletion(event);
        }
    }
    
    completeEvent(event) {
        if (event.state.completed) return;
        
        event.state.completed = true;
        event.state.completedAt = Date.now();
        
        // Calculate completion time
        const completionTime = event.state.completedAt - event.startTime;
        const speedBonus = completionTime < (event.duration * 0.5);
        
        // Award rewards
        this.awardEventRewards(event.rewards.completion, event.name, speedBonus);
        
        // Show completion effects
        this.showEventCompletion(event);
        
        // Update statistics
        this.eventState.eventsCompleted++;
        
        // End event early
        this.endEvent(event, true);
    }
    
    awardEventRewards(rewards, eventName, speedBonus = false) {
        if (!rewards) return;
        
        let totalRewards = {
            currency: 0,
            premiumCurrency: 0,
            multiplier: 1
        };
        
        // Currency rewards
        if (rewards.currency === 'cps_based') {
            totalRewards.currency = this.game.state.currencyPerSecond * rewards.multiplier;
        } else if (rewards.currency) {
            totalRewards.currency = rewards.currency;
        }
        
        // Apply speed bonus
        if (speedBonus) {
            totalRewards.currency *= this.config.speedBonus;
            rewards.premiumCurrency = (rewards.premiumCurrency || 0) * 1.5;
        }
        
        // Premium currency
        if (rewards.premiumCurrency) {
            totalRewards.premiumCurrency = rewards.premiumCurrency;
            this.game.state.premiumCurrency += rewards.premiumCurrency;
        }
        
        // Multipliers
        if (rewards.multiplier && rewards.duration) {
            this.game.progression.addTemporaryMultiplier(
                'production',
                rewards.multiplier,
                rewards.duration
            );
            totalRewards.multiplier = rewards.multiplier;
        }
        
        // Exclusive rewards
        if (rewards.exclusive) {
            this.unlockExclusiveReward(rewards.exclusive);
        }
        
        // Add currency
        if (totalRewards.currency > 0) {
            this.game.addCurrency(totalRewards.currency);
        }
        
        // Show reward summary
        this.game.ui.showEventRewards({
            eventName,
            rewards: totalRewards,
            speedBonus
        });
        
        // Track total rewards
        this.eventState.totalEventRewards += totalRewards.currency + 
            (totalRewards.premiumCurrency * 1000);
    }
    
    unlockExclusiveReward(rewardId) {
        const exclusives = {
            community_badge: () => this.game.ui.unlockBadge('community_hero'),
            champion_crown: () => this.game.ui.equipCrown(),
            secret_unlock: () => this.game.ui.unlockSecretFeature(),
            snow_effects: () => this.game.ui.enableSnowEffects(),
            ghost_particles: () => this.game.ui.enableGhostParticles()
        };
        
        if (exclusives[rewardId]) {
            exclusives[rewardId]();
            this.game.ui.showExclusiveUnlock(rewardId);
        }
    }
    
    showEventCompletion(event) {
        // Celebration effects
        this.game.ui.showEventCompletion({
            event,
            effects: this.eventEffects.completion
        });
        
        // Play sound
        this.game.music.playSound(this.eventEffects.completion.sound);
        
        // Social broadcast for major completions
        if (event.type === 'communityGoal' || event.type === 'competition') {
            this.game.socialProof.broadcastEventCompletion(event);
        }
    }
    
    updateActiveEvents() {
        const now = Date.now();
        
        this.activeEvents = this.activeEvents.filter(event => {
            if (now >= event.endTime || event.state.completed) {
                this.endEvent(event);
                return false;
            }
            
            // Update time remaining
            event.timeRemaining = event.endTime - now;
            
            // Update urgency
            if (event.timeRemaining < 60000 && !event.state.urgentWarning) {
                event.state.urgentWarning = true;
                this.game.ui.showEventUrgentWarning(event);
            }
            
            return true;
        });
    }
    
    endEvent(event, completed = false) {
        console.log(`Event ended: ${event.name} (${completed ? 'completed' : 'expired'})`);
        
        event.state.active = false;
        
        // Cleanup
        if (event.cleanup) {
            event.cleanup();
        }
        
        if (event.scoreInterval) {
            clearInterval(event.scoreInterval);
        }
        
        if (event.clueInterval) {
            clearInterval(event.clueInterval);
        }
        
        // Show summary
        this.showEventSummary(event, completed);
        
        // Add to history
        this.eventHistory.push({
            ...event,
            endedAt: Date.now(),
            wasCompleted: completed
        });
        
        // Update favorite event type
        this.updateFavoriteEventType();
        
        // Remove UI
        this.game.ui.removeEventUI(event);
    }
    
    showEventSummary(event, completed) {
        const summary = {
            event,
            completed,
            participation: event.state.participants,
            rewards: completed ? event.rewards.completion : event.rewards.participation,
            rank: event.state.playerRank,
            contribution: event.state.contributors?.[this.game.user?.id || 'player']
        };
        
        this.game.ui.showEventSummary(summary);
    }
    
    updateSocialProof() {
        // Generate fake social proof data
        this.socialProofData.participation = Math.floor(
            this.socialProofData.participation * 1.1 + Math.random() * 10
        );
        
        // Recent winners
        if (Math.random() < 0.2) {
            this.socialProofData.recentWinners.push({
                name: `Player${Math.floor(Math.random() * 9999)}`,
                event: this.activeEvents[0]?.name || 'Event',
                reward: Math.floor(Math.random() * 100) + ' gems',
                timestamp: Date.now()
            });
            
            // Keep last 5
            if (this.socialProofData.recentWinners.length > 5) {
                this.socialProofData.recentWinners.shift();
            }
        }
        
        // Update UI
        this.game.ui.updateEventSocialProof(this.socialProofData);
    }
    
    checkSpecialEvents() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        
        // Weekend event
        if ((dayOfWeek === 5 && hour >= 17) || dayOfWeek === 6 || dayOfWeek === 0) {
            if (!this.activeEvents.find(e => e.type === 'weekend')) {
                this.startWeekendEvent();
            }
        }
        
        // Holiday events
        const monthDay = `${now.getMonth() + 1}-${now.getDate()}`;
        
        Object.entries(this.specialEvents.holiday).forEach(([holiday, config]) => {
            if (config.dates.includes(monthDay)) {
                if (!this.activeEvents.find(e => e.type === holiday)) {
                    this.startHolidayEvent(holiday, config);
                }
            }
        });
    }
    
    startWeekendEvent() {
        const weekend = this.specialEvents.weekend;
        
        const event = this.startEvent('goldenHour', {
            name: weekend.name,
            duration: this.config.weekendEventDuration,
            mechanics: {
                globalMultiplier: weekend.multiplier
            }
        });
        
        event.type = 'weekend';
    }
    
    startHolidayEvent(holiday, config) {
        const event = this.startEvent('communityGoal', {
            name: config.name,
            theme: config.theme,
            exclusive: config.exclusive,
            duration: 86400000 * 7 // 1 week
        });
        
        event.type = holiday;
    }
    
    triggerMiniEvent() {
        // Quick 1-minute events for engagement
        const miniEvents = [
            {
                name: 'Lightning Round',
                type: 'clickRush',
                duration: 60000,
                mechanics: { clickMultiplier: 5, requiredClicks: 100 }
            },
            {
                name: 'Power Surge',
                type: 'goldenHour',
                duration: 120000,
                mechanics: { globalMultiplier: 10 }
            }
        ];
        
        const mini = miniEvents[Math.floor(Math.random() * miniEvents.length)];
        this.startEvent(mini.type, mini);
    }
    
    updateFavoriteEventType() {
        // Track which events player completes most
        const completionCounts = {};
        
        this.eventHistory.forEach(event => {
            if (event.wasCompleted) {
                completionCounts[event.type] = (completionCounts[event.type] || 0) + 1;
            }
        });
        
        // Find favorite
        let maxCount = 0;
        let favorite = null;
        
        Object.entries(completionCounts).forEach(([type, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favorite = type;
            }
        });
        
        this.eventState.favoriteEventType = favorite;
    }
    
    initializeSocialProof() {
        // Start with some fake data
        this.socialProofData = {
            participation: Math.floor(100 + Math.random() * 500),
            recentWinners: [],
            topContributors: [],
            liveUpdates: []
        };
        
        // Generate initial winners
        for (let i = 0; i < 3; i++) {
            this.socialProofData.recentWinners.push({
                name: `Player${Math.floor(Math.random() * 9999)}`,
                event: 'Previous Event',
                reward: Math.floor(Math.random() * 50 + 10) + ' gems',
                timestamp: Date.now() - Math.random() * 3600000
            });
        }
    }
    
    getSaveData() {
        return {
            eventState: this.eventState,
            eventHistory: this.eventHistory.slice(-50), // Last 50 events
            activeEvents: this.activeEvents.map(e => ({
                type: e.type,
                startTime: e.startTime,
                endTime: e.endTime,
                state: e.state
            }))
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        
        if (data.eventState) {
            Object.assign(this.eventState, data.eventState);
        }
        
        if (data.eventHistory) {
            this.eventHistory = data.eventHistory;
        }
        
        // Don't restore active events - start fresh
    }
    
    update(deltaTime) {
        // Update any event-specific mechanics
        this.activeEvents.forEach(event => {
            if (event.type === 'mystery' && !event.state.solved) {
                // Mystery event progress
                event.state.progress = Math.min(1, event.state.progress + deltaTime / event.duration);
            }
        });
    }
}

export default EventSystem;