// FlowStateManager.js
// Monitors player behavior to optimize for flow state - the perfect balance of challenge and skill
// Based on Csikszentmihalyi's flow theory and gaming psychology research

class FlowStateManager {
    constructor(game) {
        this.game = game;
        
        // Flow state parameters
        this.flowState = {
            currentIntensity: 0, // 0-100 scale
            optimalIntensity: 70, // Target flow level
            
            // Flow dimensions
            challengeLevel: 50,
            skillLevel: 50,
            engagementScore: 50,
            
            // Physiological proxies
            clicksPerMinute: 0,
            clickVariance: 0, // Consistency of click timing
            sessionDuration: 0,
            focusScore: 0,
            
            // Flow state indicators
            inFlowState: false,
            flowDuration: 0,
            totalFlowTime: 0,
            flowBreaks: 0
        };
        
        // Behavior tracking
        this.behaviorMetrics = {
            clickTimes: [], // Timestamps of recent clicks
            purchaseTimes: [], // Timestamps of purchases
            idlePeriods: [], // Periods of inactivity
            
            // Interaction patterns
            averageClickInterval: 0,
            clickRhythmScore: 0, // How rhythmic/consistent
            purchaseFrequency: 0,
            upgradePreferences: {},
            
            // Engagement signals
            rapidClickBursts: 0,
            steadyClickPeriods: 0,
            optimalClickRate: 60, // Clicks per minute for flow
            
            // Frustration indicators
            rageclickCount: 0, // Very rapid frustrated clicking
            abandonmentRisk: 0,
            lastInteraction: Date.now()
        };
        
        // Difficulty adjustment system
        this.difficultyAdjustment = {
            currentDifficulty: 1,
            targetDifficulty: 1,
            adjustmentSpeed: 0.01,
            
            // Dynamic pricing multiplier
            costMultiplier: 1,
            productionMultiplier: 1,
            
            // Adaptive challenge
            progressionSpeed: 1,
            unlockPacing: 1
        };
        
        // Flow optimization parameters
        this.optimization = {
            // Ideal metrics for flow state
            idealCPM: 40, // Clicks per minute
            idealVariance: 0.2, // Click timing variance
            idealSessionLength: 900000, // 15 minutes
            
            // Adjustment thresholds
            boredomThreshold: 30,
            anxietyThreshold: 85,
            flowZoneMin: 60,
            flowZoneMax: 80,
            
            // Intervention timings
            lastIntervention: 0,
            interventionCooldown: 30000 // 30 seconds
        };
        
        // Psychological interventions
        this.interventions = {
            boredom: [
                'showRandomBonus',
                'triggerMiniEvent',
                'offerNewUpgrade',
                'createChallenge'
            ],
            anxiety: [
                'reduceDifficulty',
                'providePowerUp',
                'showEncouragement',
                'offerHint'
            ],
            optimal: [
                'maintainFlow',
                'subtlePositiveFeedback',
                'gradualChallengeIncrease'
            ]
        };
        
        // Music adaptation for flow
        this.musicAdaptation = {
            flowTempo: 120, // BPM for optimal flow
            currentTempo: 90,
            tempoAdjustmentRate: 2, // BPM per second
            
            // Binaural frequencies for brain states
            flowFrequency: 10, // Alpha waves (8-13 Hz)
            focusFrequency: 18, // Beta waves (13-30 Hz)
            relaxFrequency: 6 // Theta waves (4-8 Hz)
        };
        
        // Analytics data
        this.analytics = {
            flowSessions: [],
            averageFlowDuration: 0,
            flowAchievementRate: 0,
            optimalTimeOfDay: null
        };
    }
    
    initialize() {
        console.log('🧠 Flow State Manager initialized - Optimizing for peak performance');
        
        // Start monitoring loops
        this.startBehaviorTracking();
        this.startFlowCalculation();
        this.startAdaptiveDifficulty();
    }
    
    startBehaviorTracking() {
        // High-frequency behavior sampling (100ms)
        setInterval(() => {
            this.updateClickMetrics();
            this.detectPatterns();
        }, 100);
        
        // Medium-frequency analysis (1 second)
        setInterval(() => {
            this.analyzeEngagement();
            this.calculateFlowIntensity();
        }, 1000);
        
        // Low-frequency optimization (10 seconds)
        setInterval(() => {
            this.optimizeGameParameters();
            this.checkForInterventions();
        }, 10000);
    }
    
    startFlowCalculation() {
        // Calculate flow state every second
        setInterval(() => {
            const wasInFlow = this.flowState.inFlowState;
            this.calculateFlowState();
            
            // Track flow state changes
            if (this.flowState.inFlowState && !wasInFlow) {
                // Entered flow state
                this.onEnterFlow();
            } else if (!this.flowState.inFlowState && wasInFlow) {
                // Exited flow state
                this.onExitFlow();
            }
            
            // Update flow duration
            if (this.flowState.inFlowState) {
                this.flowState.flowDuration++;
                this.flowState.totalFlowTime++;
            }
        }, 1000);
    }
    
    startAdaptiveDifficulty() {
        // Adjust difficulty every 5 seconds
        setInterval(() => {
            this.adjustDifficulty();
            this.applyDifficultyChanges();
        }, 5000);
    }
    
    registerClick() {
        const now = Date.now();
        this.behaviorMetrics.clickTimes.push(now);
        this.behaviorMetrics.lastInteraction = now;
        
        // Keep only recent clicks (last 60 seconds)
        const cutoff = now - 60000;
        this.behaviorMetrics.clickTimes = this.behaviorMetrics.clickTimes.filter(
            time => time > cutoff
        );
        
        // Detect rage clicking
        if (this.behaviorMetrics.clickTimes.length >= 10) {
            const recentClicks = this.behaviorMetrics.clickTimes.slice(-10);
            const timeSpan = recentClicks[9] - recentClicks[0];
            
            if (timeSpan < 2000) { // 10 clicks in 2 seconds
                this.behaviorMetrics.rageclickCount++;
                this.handleRageClick();
            }
        }
    }
    
    analyzeClickPattern() {
        const clicks = this.behaviorMetrics.clickTimes;
        if (clicks.length < 3) return;
        
        // Calculate intervals between clicks
        const intervals = [];
        for (let i = 1; i < clicks.length; i++) {
            intervals.push(clicks[i] - clicks[i-1]);
        }
        
        // Calculate average and variance
        const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
        const variance = intervals.reduce((sum, interval) => {
            return sum + Math.pow(interval - avgInterval, 2);
        }, 0) / intervals.length;
        
        this.behaviorMetrics.averageClickInterval = avgInterval;
        this.behaviorMetrics.clickVariance = Math.sqrt(variance) / avgInterval;
        
        // Calculate rhythm score (lower variance = more rhythmic)
        this.behaviorMetrics.clickRhythmScore = Math.max(0, 1 - this.behaviorMetrics.clickVariance);
        
        // Detect patterns
        if (this.behaviorMetrics.clickRhythmScore > 0.8) {
            this.behaviorMetrics.steadyClickPeriods++;
        }
        
        // Calculate CPM
        this.flowState.clicksPerMinute = clicks.length;
    }
    
    updateClickMetrics() {
        this.analyzeClickPattern();
        
        // Update session duration
        this.flowState.sessionDuration = Date.now() - this.game.state.sessionStartTime;
    }
    
    detectPatterns() {
        // Detect rapid click bursts
        const recentClicks = this.behaviorMetrics.clickTimes.slice(-5);
        if (recentClicks.length === 5) {
            const burstTime = recentClicks[4] - recentClicks[0];
            if (burstTime < 1000) { // 5 clicks in 1 second
                this.behaviorMetrics.rapidClickBursts++;
            }
        }
        
        // Detect idle periods
        const timeSinceLastClick = Date.now() - this.behaviorMetrics.lastInteraction;
        if (timeSinceLastClick > 30000) { // 30 seconds
            this.behaviorMetrics.idlePeriods.push({
                start: this.behaviorMetrics.lastInteraction,
                duration: timeSinceLastClick
            });
        }
    }
    
    analyzeEngagement() {
        // Multi-factor engagement calculation
        const factors = {
            clickActivity: this.calculateClickActivityScore(),
            purchaseActivity: this.calculatePurchaseActivityScore(),
            consistency: this.behaviorMetrics.clickRhythmScore,
            sessionLength: Math.min(1, this.flowState.sessionDuration / this.optimization.idealSessionLength),
            progression: this.calculateProgressionScore()
        };
        
        // Weighted engagement score
        this.flowState.engagementScore = 
            factors.clickActivity * 0.3 +
            factors.purchaseActivity * 0.2 +
            factors.consistency * 0.2 +
            factors.sessionLength * 0.15 +
            factors.progression * 0.15;
        
        this.flowState.engagementScore = Math.min(100, this.flowState.engagementScore * 100);
    }
    
    calculateClickActivityScore() {
        // Compare current CPM to ideal
        const cpmRatio = this.flowState.clicksPerMinute / this.optimization.idealCPM;
        
        // Bell curve scoring - too few or too many clicks reduce score
        if (cpmRatio < 1) {
            return cpmRatio; // Linear increase up to ideal
        } else if (cpmRatio < 2) {
            return 1 - (cpmRatio - 1) * 0.5; // Gentle decrease after ideal
        } else {
            return Math.max(0, 0.5 - (cpmRatio - 2) * 0.25); // Steep decrease for excessive clicking
        }
    }
    
    calculatePurchaseActivityScore() {
        // Recent purchases indicate engagement
        const recentPurchases = this.behaviorMetrics.purchaseTimes.filter(
            time => Date.now() - time < 300000 // Last 5 minutes
        );
        
        // Ideal is 1 purchase every 30 seconds
        const idealPurchases = 10;
        const purchaseRatio = recentPurchases.length / idealPurchases;
        
        return Math.min(1, purchaseRatio);
    }
    
    calculateProgressionScore() {
        // Rate of currency growth
        const currentCurrency = this.game.state.currency;
        const cps = this.game.state.currencyPerSecond;
        
        if (cps === 0) return 0.1; // Minimal score if no automation
        
        // Time to double currency at current rate
        const doublingTime = currentCurrency / cps;
        const idealDoublingTime = 300; // 5 minutes
        
        const progressionRatio = idealDoublingTime / doublingTime;
        return Math.min(1, Math.max(0, progressionRatio));
    }
    
    calculateFlowState() {
        // Flow = Balance of challenge and skill
        this.flowState.challengeLevel = this.calculateChallengeLevel();
        this.flowState.skillLevel = this.calculateSkillLevel();
        
        // Flow intensity based on challenge-skill balance
        const balance = Math.abs(this.flowState.challengeLevel - this.flowState.skillLevel);
        const flowIntensity = Math.max(0, 100 - balance * 2);
        
        // Consider engagement as modifier
        this.flowState.currentIntensity = (flowIntensity * 0.7 + this.flowState.engagementScore * 0.3);
        
        // Determine if in flow state
        this.flowState.inFlowState = 
            this.flowState.currentIntensity >= this.optimization.flowZoneMin &&
            this.flowState.currentIntensity <= this.optimization.flowZoneMax &&
            this.flowState.engagementScore > 50;
        
        // Calculate focus score
        this.flowState.focusScore = 
            this.behaviorMetrics.clickRhythmScore * 50 +
            Math.min(50, this.flowState.sessionDuration / 1000);
    }
    
    calculateChallengeLevel() {
        // Challenge based on:
        // - Cost of next upgrades vs current resources
        // - Time to afford upgrades
        // - Complexity of decisions
        
        const currency = this.game.state.currency;
        const cps = this.game.state.currencyPerSecond;
        
        // Find cheapest available upgrade
        let cheapestCost = Infinity;
        Object.values(this.game.progression.upgrades).forEach(upgrade => {
            if (upgrade.unlocked && (!upgrade.maxOwned || upgrade.owned < upgrade.maxOwned)) {
                const cost = this.game.progression.calculateUpgradeCost(upgrade.id);
                if (cost < cheapestCost) cheapestCost = cost;
            }
        });
        
        // Time to afford in seconds
        const timeToAfford = cps > 0 ? (cheapestCost - currency) / cps : Infinity;
        
        // Convert to challenge level (0-100)
        if (timeToAfford < 10) return 20; // Too easy
        if (timeToAfford < 60) return 50; // Good challenge
        if (timeToAfford < 300) return 70; // Challenging
        if (timeToAfford < 600) return 85; // Very challenging
        return 95; // Extremely challenging
    }
    
    calculateSkillLevel() {
        // Skill based on:
        // - Click accuracy/rhythm
        // - Strategic purchasing
        // - Game knowledge (unlocks, achievements)
        
        const factors = {
            clickSkill: this.behaviorMetrics.clickRhythmScore * 30,
            purchaseSkill: this.calculatePurchaseEfficiency() * 30,
            gameKnowledge: this.calculateGameKnowledge() * 40
        };
        
        return factors.clickSkill + factors.purchaseSkill + factors.gameKnowledge;
    }
    
    calculatePurchaseEfficiency() {
        // How well player times their purchases
        // Good players buy upgrades as soon as affordable
        
        // Track purchase delays (would need more sophisticated tracking)
        return 0.7; // Placeholder
    }
    
    calculateGameKnowledge() {
        // Based on unlocks and achievements
        const totalAchievements = Object.keys(this.game.achievements).length;
        const unlockedAchievements = Object.values(this.game.achievements)
            .filter(a => a.unlocked).length;
        
        const achievementRatio = unlockedAchievements / totalAchievements;
        const prestigeBonus = Math.min(0.3, this.game.state.prestigeLevel * 0.1);
        
        return achievementRatio * 0.7 + prestigeBonus;
    }
    
    onEnterFlow() {
        console.log('🌊 Player entered flow state!');
        
        // Reset flow duration
        this.flowState.flowDuration = 0;
        
        // Analytics
        this.analytics.flowSessions.push({
            startTime: Date.now(),
            startIntensity: this.flowState.currentIntensity
        });
        
        // Enhance experience
        this.game.eventBus.emit('flow_state_entered');
        
        // Musical enhancement
        this.game.music.setEmotionState('excitement');
        this.updateMusicForFlow();
        
        // Visual feedback
        this.game.ui.showFlowStateIndicator(true);
        
        // Slight production bonus during flow
        this.game.progression.addTemporaryMultiplier('production', 1.2, 60);
    }
    
    onExitFlow() {
        console.log('📉 Player exited flow state');
        
        // Record session
        if (this.analytics.flowSessions.length > 0) {
            const session = this.analytics.flowSessions[this.analytics.flowSessions.length - 1];
            session.endTime = Date.now();
            session.duration = this.flowState.flowDuration;
            session.endReason = this.determineFlowExitReason();
        }
        
        this.flowState.flowBreaks++;
        
        // Update UI
        this.game.ui.showFlowStateIndicator(false);
        
        // Analyze why flow was broken
        this.analyzeFlowBreak();
    }
    
    determineFlowExitReason() {
        if (this.flowState.challengeLevel > 80) return 'too_challenging';
        if (this.flowState.challengeLevel < 30) return 'too_easy';
        if (this.flowState.engagementScore < 40) return 'low_engagement';
        if (this.behaviorMetrics.rageclickCount > 0) return 'frustration';
        return 'unknown';
    }
    
    analyzeFlowBreak() {
        const reason = this.determineFlowExitReason();
        
        // Adjust game based on exit reason
        switch(reason) {
            case 'too_challenging':
                this.difficultyAdjustment.targetDifficulty *= 0.9;
                break;
            case 'too_easy':
                this.difficultyAdjustment.targetDifficulty *= 1.1;
                break;
            case 'frustration':
                this.handleFrustration();
                break;
        }
        
        // Reset rage click counter
        this.behaviorMetrics.rageclickCount = 0;
    }
    
    adjustDifficulty() {
        // Gradually adjust to target difficulty
        const diff = this.difficultyAdjustment.targetDifficulty - 
                    this.difficultyAdjustment.currentDifficulty;
        
        this.difficultyAdjustment.currentDifficulty += 
            diff * this.difficultyAdjustment.adjustmentSpeed;
        
        // Calculate multipliers based on difficulty
        this.difficultyAdjustment.costMultiplier = 
            Math.pow(this.difficultyAdjustment.currentDifficulty, 0.5);
        
        this.difficultyAdjustment.productionMultiplier = 
            Math.pow(this.difficultyAdjustment.currentDifficulty, 0.3);
    }
    
    applyDifficultyChanges() {
        // Would apply to actual game mechanics
        // For now, just track for analytics
        this.game.analytics.track('difficulty_adjusted', {
            current: this.difficultyAdjustment.currentDifficulty,
            costMult: this.difficultyAdjustment.costMultiplier,
            prodMult: this.difficultyAdjustment.productionMultiplier
        });
    }
    
    checkForInterventions() {
        const now = Date.now();
        
        // Respect cooldown
        if (now - this.optimization.lastIntervention < this.optimization.interventionCooldown) {
            return;
        }
        
        // Determine needed intervention
        if (this.flowState.currentIntensity < this.optimization.boredomThreshold) {
            this.interveneForBoredom();
        } else if (this.flowState.currentIntensity > this.optimization.anxietyThreshold) {
            this.interveneForAnxiety();
        } else if (this.flowState.inFlowState) {
            this.maintainFlow();
        }
    }
    
    interveneForBoredom() {
        console.log('😴 Boredom detected - intervening');
        
        // Random intervention from boredom set
        const intervention = this.interventions.boredom[
            Math.floor(Math.random() * this.interventions.boredom.length)
        ];
        
        switch(intervention) {
            case 'showRandomBonus':
                const bonus = this.game.state.currencyPerSecond * 60 * (1 + Math.random() * 4);
                this.game.addCurrency(bonus);
                this.game.ui.showRandomBonus(bonus);
                break;
                
            case 'triggerMiniEvent':
                this.game.events.triggerMiniEvent();
                break;
                
            case 'offerNewUpgrade':
                // Unlock a random locked upgrade early
                this.unlockRandomUpgrade();
                break;
                
            case 'createChallenge':
                this.createTimedChallenge();
                break;
        }
        
        this.optimization.lastIntervention = Date.now();
    }
    
    interveneForAnxiety() {
        console.log('😰 Anxiety detected - reducing difficulty');
        
        const intervention = this.interventions.anxiety[
            Math.floor(Math.random() * this.interventions.anxiety.length)
        ];
        
        switch(intervention) {
            case 'reduceDifficulty':
                this.difficultyAdjustment.targetDifficulty *= 0.8;
                break;
                
            case 'providePowerUp':
                this.game.progression.addTemporaryMultiplier('production', 2, 30);
                this.game.ui.showPowerUp('2x Production for 30s!');
                break;
                
            case 'showEncouragement':
                this.game.ui.showEncouragement();
                break;
                
            case 'offerHint':
                this.showStrategicHint();
                break;
        }
        
        this.optimization.lastIntervention = Date.now();
    }
    
    maintainFlow() {
        // Subtle adjustments to maintain flow state
        
        // Gradually increase challenge
        if (this.flowState.flowDuration > 30) {
            this.difficultyAdjustment.targetDifficulty *= 1.02;
        }
        
        // Provide subtle positive feedback
        if (Math.random() < 0.1) {
            this.game.ui.showSubtlePositiveFeedback();
        }
    }
    
    handleRageClick() {
        console.log('😤 Rage clicking detected');
        
        // Immediate intervention
        this.interveneForAnxiety();
        
        // Track frustration
        this.behaviorMetrics.abandonmentRisk += 10;
        
        // Calm the player
        this.game.music.setEmotionState('calm');
    }
    
    handleFrustration() {
        // Reduce all costs temporarily
        this.game.progression.multipliers.cost *= 0.8;
        
        // Give a small bonus
        const bonus = this.game.state.currencyPerSecond * 120;
        this.game.addCurrency(bonus);
        
        this.game.ui.showMessage("Here's a boost to help you progress! 💪");
    }
    
    unlockRandomUpgrade() {
        const locked = Object.values(this.game.progression.upgrades)
            .filter(u => !u.unlocked);
        
        if (locked.length > 0) {
            const random = locked[Math.floor(Math.random() * locked.length)];
            random.unlocked = true;
            this.game.progression.unlockQueue.push({
                upgrade: random,
                timestamp: Date.now()
            });
        }
    }
    
    createTimedChallenge() {
        // Create a timed challenge for engagement
        const challenge = {
            type: 'click_challenge',
            target: 50,
            current: 0,
            timeLimit: 30000,
            reward: this.game.state.currencyPerSecond * 600,
            startTime: Date.now()
        };
        
        this.game.ui.showChallenge(challenge);
        
        // Track challenge clicks
        const originalClick = this.game.click.bind(this.game);
        this.game.click = () => {
            originalClick();
            challenge.current++;
            
            if (challenge.current >= challenge.target) {
                // Challenge completed!
                this.game.addCurrency(challenge.reward);
                this.game.ui.showChallengeComplete(challenge);
                this.game.dopamine.triggerAchievementRush();
                
                // Restore original click
                this.game.click = originalClick;
            }
        };
        
        // Timeout
        setTimeout(() => {
            if (challenge.current < challenge.target) {
                this.game.ui.showChallengeFailed(challenge);
                this.game.click = originalClick;
            }
        }, challenge.timeLimit);
    }
    
    showStrategicHint() {
        const hints = [
            "Focus on upgrading your highest producer!",
            "Save up for the next tier of upgrades",
            "Click rhythm matters more than speed",
            "Achievements give permanent bonuses",
            "Prestige when progress slows down"
        ];
        
        const hint = hints[Math.floor(Math.random() * hints.length)];
        this.game.ui.showHint(hint);
    }
    
    updateMusicForFlow() {
        // Adapt music to flow state
        const targetTempo = this.flowState.inFlowState ? 
            this.musicAdaptation.flowTempo : 90;
        
        const targetFrequency = this.flowState.inFlowState ?
            this.musicAdaptation.flowFrequency :
            this.musicAdaptation.relaxFrequency;
        
        // Inform music engine
        this.game.music.adaptToFlowState({
            tempo: targetTempo,
            binauralFrequency: targetFrequency,
            intensity: this.flowState.currentIntensity / 100
        });
    }
    
    optimizeGameParameters() {
        // Long-term optimization based on player behavior
        
        // Find optimal time of day
        const hour = new Date().getHours();
        if (this.flowState.inFlowState) {
            if (!this.analytics.optimalTimeOfDay) {
                this.analytics.optimalTimeOfDay = {};
            }
            this.analytics.optimalTimeOfDay[hour] = 
                (this.analytics.optimalTimeOfDay[hour] || 0) + 1;
        }
        
        // Calculate average flow duration
        if (this.analytics.flowSessions.length > 0) {
            const totalDuration = this.analytics.flowSessions
                .filter(s => s.duration)
                .reduce((sum, s) => sum + s.duration, 0);
            
            this.analytics.averageFlowDuration = 
                totalDuration / this.analytics.flowSessions.length;
        }
    }
    
    update(deltaTime) {
        // Update focus-based bonuses
        if (this.flowState.inFlowState) {
            // Small production bonus during flow
            const flowBonus = 1 + (this.flowState.currentIntensity / 1000);
            this.game.state.currencyPerSecond *= flowBonus;
        }
        
        // Update abandonment risk
        const idleTime = Date.now() - this.behaviorMetrics.lastInteraction;
        if (idleTime > 60000) { // 1 minute idle
            this.behaviorMetrics.abandonmentRisk += deltaTime;
        } else {
            this.behaviorMetrics.abandonmentRisk = Math.max(0, 
                this.behaviorMetrics.abandonmentRisk - deltaTime * 2
            );
        }
        
        // Check for abandonment intervention
        if (this.behaviorMetrics.abandonmentRisk > 50) {
            this.game.lossAversion.preventAbandonment();
            this.behaviorMetrics.abandonmentRisk = 0;
        }
    }
    
    updateEngagement(type, magnitude) {
        // Quick engagement updates from other systems
        switch(type) {
            case 'positive':
                this.flowState.engagementScore = Math.min(100, 
                    this.flowState.engagementScore + magnitude * 0.1
                );
                break;
            case 'negative':
                this.flowState.engagementScore = Math.max(0, 
                    this.flowState.engagementScore - magnitude * 0.1
                );
                break;
        }
    }
    
    beginMonitoring() {
        console.log('👁️ Flow state monitoring active');
        // Main monitoring handled by interval timers initialized earlier
    }
    
    getState() {
        return {
            flowIntensity: this.flowState.currentIntensity,
            inFlow: this.flowState.inFlowState,
            engagement: this.flowState.engagementScore,
            challenge: this.flowState.challengeLevel,
            skill: this.flowState.skillLevel,
            cpm: this.flowState.clicksPerMinute,
            abandonmentRisk: this.behaviorMetrics.abandonmentRisk
        };
    }
}

export default FlowStateManager;