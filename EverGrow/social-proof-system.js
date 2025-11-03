// SocialProofSystem.js
// Implements social proof mechanics for viral growth and FOMO generation
// Based on social psychology principles of conformity, competition, and validation

class SocialProofSystem {
    constructor(game) {
        this.game = game;
        
        // Social proof configuration
        this.config = {
            // Notification frequencies
            globalBroadcastChance: 0.1, // 10% chance for global visibility
            friendNotificationChance: 0.8, // 80% chance to notify friends
            
            // Social comparison thresholds
            impressiveMultiplier: 10, // 10x or higher
            impressiveCurrency: 1000000, // 1 million
            impressiveStreak: 7, // 7 days
            
            // Fake player generation
            activePlayers: {
                min: 5000,
                max: 15000,
                variance: 0.2
            },
            
            // Social feed settings
            feedUpdateInterval: 5000, // 5 seconds
            maxFeedItems: 20,
            
            // Viral mechanics
            referralBonus: {
                referrer: 50, // Gems for referrer
                referred: 25, // Gems for new player
                milestone: 100 // Bonus at milestones
            }
        };
        
        // Active player simulation
        this.simulatedPlayers = {
            count: 10000,
            active: [],
            names: this.generatePlayerNames(1000),
            activities: [
                'just started playing',
                'achieved {achievement}',
                'reached {number} growth',
                'prestiged for the {ordinal} time',
                'won {reward} in {event}',
                'maintained a {number} day streak',
                'unlocked {unlock}',
                'joined {guild}',
                'completed {event}',
                'earned {number} gems'
            ]
        };
        
        // Social feed
        this.socialFeed = {
            global: [],
            friends: [],
            guild: [],
            lastUpdate: Date.now()
        };
        
        // Leaderboard data
        this.leaderboards = {
            global: {
                allTime: [],
                daily: [],
                weekly: [],
                lastUpdate: 0
            },
            friends: {
                board: [],
                lastUpdate: 0
            },
            guild: {
                board: [],
                lastUpdate: 0
            }
        };
        
        // Social achievements and milestones
        this.socialMilestones = {
            friendsAdded: [1, 5, 10, 25, 50, 100],
            referrals: [1, 3, 5, 10, 25],
            guildContribution: [1000, 10000, 100000, 1000000],
            leaderboardRank: [100, 50, 10, 3, 1]
        };
        
        // Player's social stats
        this.playerSocial = {
            friends: [],
            referrals: [],
            guildId: null,
            guildRank: null,
            
            // Rankings
            globalRank: 9999,
            friendRank: 1,
            guildRank: 50,
            
            // Social score (influence)
            influence: 0,
            reputation: 100,
            
            // Sharing stats
            sharesTotal: 0,
            sharesSuccess: 0,
            lastShareTime: 0
        };
        
        // Broadcast templates with psychological triggers
        this.broadcastTemplates = {
            achievement: {
                icon: '🏆',
                messages: [
                    '{player} just unlocked {achievement}! 🎉',
                    'Incredible! {player} earned the {achievement} achievement!',
                    '{achievement} unlocked by {player}! Who\'s next?'
                ],
                rarity: {
                    common: { color: '#90EE90', excitement: 1 },
                    rare: { color: '#4169E1', excitement: 2 },
                    epic: { color: '#9370DB', excitement: 3 },
                    legendary: { color: '#FFD700', excitement: 5 }
                }
            },
            
            bigWin: {
                icon: '💰',
                messages: [
                    'MEGA WIN! {player} just earned {amount} with a {multiplier}x multiplier! 🎰',
                    '🤯 {player} hit the JACKPOT! {multiplier}x multiplier!',
                    'INSANE! {player} just got {amount} in one click!'
                ],
                threshold: 50 // 50x or higher
            },
            
            prestige: {
                icon: '✨',
                messages: [
                    '{player} has transcended! Prestige level {level} achieved! 🌟',
                    'Witness greatness! {player} just prestiged for the {ordinal} time!',
                    '{player} has been reborn! Starting fresh at prestige {level}!'
                ],
                effects: 'cosmic'
            },
            
            streak: {
                icon: '🔥',
                messages: [
                    '{player} is ON FIRE! {days} day streak! 🔥',
                    'Dedication! {player} hasn\'t missed a day in {days} days!',
                    '{days} days strong! {player} is unstoppable!'
                ],
                milestones: [7, 30, 100, 365]
            },
            
            event: {
                icon: '🎉',
                messages: {
                    start: 'The {event} event has begun! {participants} players already joining!',
                    milestone: 'Community milestone reached! {progress}% complete!',
                    winner: '{player} won {reward} in the {event} event! 🏆',
                    complete: 'Event complete! {participants} players participated!'
                }
            }
        };
        
        // Comparison psychology
        this.comparisons = {
            ahead: [
                'You\'re ahead of {percent}% of players!',
                'Only {count} players have more than you!',
                'You\'re in the top {percent}%!'
            ],
            behind: [
                '{count} players are just ahead of you',
                'You\'re catching up to the top {percent}%',
                'Just {amount} more to beat {player}!'
            ],
            motivational: [
                'The average player has {amount} - you can beat that!',
                'Top players earn {cps} per second',
                'Players with your playtime usually have {amount}'
            ]
        };
        
        // Guild system
        this.guildFeatures = {
            perks: {
                production: 0.1, // 10% per guild level
                clickPower: 0.05, // 5% per guild level
                offlineBonus: 0.2 // 20% per guild level
            },
            
            competitions: {
                weekly: {
                    name: 'Guild Wars',
                    rewards: { gems: 1000, multiplier: 2 }
                },
                daily: {
                    name: 'Guild Challenge',
                    rewards: { gems: 100 }
                }
            }
        };
    }
    
    initialize() {
        console.log('👥 Social Proof System initialized - Viral mechanics active');
        
        // Generate initial social activity
        this.generateInitialActivity();
        
        // Start social feed updates
        this.startSocialFeedUpdates();
        
        // Initialize leaderboards
        this.generateLeaderboards();
        
        // Set up broadcast listeners
        this.setupBroadcastListeners();
    }
    
    generatePlayerNames(count) {
        const names = [];
        const prefixes = ['Pro', 'Epic', 'Mega', 'Ultra', 'Super', 'Turbo', 'Master', 'Legend'];
        const middles = ['Gamer', 'Player', 'Grower', 'Clicker', 'Farmer', 'Builder'];
        const suffixes = ['2000', '3000', 'X', 'Z', '99', '420', '69', '777'];
        
        for (let i = 0; i < count; i++) {
            const prefix = Math.random() < 0.3 ? prefixes[Math.floor(Math.random() * prefixes.length)] : '';
            const middle = middles[Math.floor(Math.random() * middles.length)];
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            const number = Math.floor(Math.random() * 9999);
            
            names.push(`${prefix}${middle}${suffix}${number}`);
        }
        
        return names;
    }
    
    generateInitialActivity() {
        // Create initial feed items
        for (let i = 0; i < 10; i++) {
            this.generateFakeActivity();
        }
        
        // Sort by timestamp
        this.socialFeed.global.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    generateFakeActivity() {
        const player = this.getRandomPlayer();
        const activity = this.simulatedPlayers.activities[
            Math.floor(Math.random() * this.simulatedPlayers.activities.length)
        ];
        
        const variables = {
            achievement: 'Millionaire',
            number: Math.floor(Math.random() * 1000000),
            ordinal: this.getOrdinal(Math.floor(Math.random() * 10) + 1),
            reward: Math.floor(Math.random() * 100) + ' gems',
            event: 'Click Frenzy',
            unlock: 'Golden Automation',
            guild: 'Elite Growers'
        };
        
        let message = activity;
        Object.entries(variables).forEach(([key, value]) => {
            message = message.replace(`{${key}}`, value);
        });
        
        const feedItem = {
            id: Date.now() + Math.random(),
            player: player,
            message: message,
            timestamp: Date.now() - Math.random() * 300000, // Last 5 minutes
            type: this.getActivityType(activity),
            reactions: Math.floor(Math.random() * 50)
        };
        
        this.socialFeed.global.push(feedItem);
        
        // Keep feed size limited
        if (this.socialFeed.global.length > this.config.maxFeedItems) {
            this.socialFeed.global.shift();
        }
        
        return feedItem;
    }
    
    getRandomPlayer() {
        return {
            name: this.simulatedPlayers.names[
                Math.floor(Math.random() * this.simulatedPlayers.names.length)
            ],
            level: Math.floor(Math.random() * 100) + 1,
            avatar: Math.floor(Math.random() * 10)
        };
    }
    
    getOrdinal(number) {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const v = number % 100;
        return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    }
    
    getActivityType(activity) {
        if (activity.includes('achieved') || activity.includes('unlocked')) return 'achievement';
        if (activity.includes('prestiged')) return 'prestige';
        if (activity.includes('streak')) return 'streak';
        if (activity.includes('won') || activity.includes('completed')) return 'event';
        return 'progress';
    }
    
    startSocialFeedUpdates() {
        setInterval(() => {
            // Add new fake activities
            if (Math.random() < 0.7) {
                this.generateFakeActivity();
                this.updateSocialFeedUI();
            }
            
            // Update active player count
            this.updateActivePlayerCount();
            
        }, this.config.feedUpdateInterval);
    }
    
    updateActivePlayerCount() {
        // Simulate realistic player count fluctuations
        const baseCount = this.config.activePlayers.min + 
            Math.random() * (this.config.activePlayers.max - this.config.activePlayers.min);
        
        const variance = 1 + (Math.random() - 0.5) * this.config.activePlayers.variance;
        this.simulatedPlayers.count = Math.floor(baseCount * variance);
        
        // Update UI
        this.game.ui.updateActivePlayerCount(this.simulatedPlayers.count);
    }
    
    updateSocialFeedUI() {
        // Get latest feed items
        const latestItems = this.socialFeed.global.slice(0, 5);
        
        // Update UI feed
        this.game.ui.updateSocialFeed(latestItems);
    }
    
    setupBroadcastListeners() {
        // Listen for broadcast-worthy events
        this.game.eventBus.on('achievement_unlocked', (achievement) => {
            if (this.shouldBroadcast(achievement.rarity)) {
                this.broadcastAchievement(achievement);
            }
        });
        
        this.game.eventBus.on('big_multiplier', (data) => {
            if (data.multiplier >= this.broadcastTemplates.bigWin.threshold) {
                this.broadcastBigWin(data);
            }
        });
        
        this.game.eventBus.on('prestige_completed', (data) => {
            this.broadcastPrestige(data);
        });
    }
    
    shouldBroadcast(rarity = 'common') {
        // Higher rarity = higher broadcast chance
        const chances = {
            common: 0.05,
            rare: 0.2,
            epic: 0.5,
            legendary: 1.0
        };
        
        return Math.random() < (chances[rarity] || this.config.globalBroadcastChance);
    }
    
    broadcastAchievement(achievement) {
        const template = this.broadcastTemplates.achievement;
        const message = template.messages[Math.floor(Math.random() * template.messages.length)]
            .replace('{player}', this.game.user?.username || 'A player')
            .replace('{achievement}', achievement.name);
        
        const broadcast = {
            type: 'achievement',
            icon: template.icon,
            message: message,
            rarity: achievement.rarity || 'common',
            player: {
                name: this.game.user?.username || 'Player',
                id: this.game.user?.id
            },
            timestamp: Date.now(),
            effects: template.rarity[achievement.rarity || 'common']
        };
        
        // Local notification
        this.showLocalBroadcast(broadcast);
        
        // Global feed
        this.addToGlobalFeed(broadcast);
        
        // Notify friends
        this.notifyFriends(broadcast);
        
        // Socket broadcast if connected
        if (this.game.socket) {
            this.game.socket.emit('achievement_unlocked', {
                achievement: achievement.name,
                rarity: achievement.rarity
            });
        }
    }
    
    broadcastBigWin(data) {
        const template = this.broadcastTemplates.bigWin;
        const message = template.messages[Math.floor(Math.random() * template.messages.length)]
            .replace('{player}', this.game.user?.username || 'A player')
            .replace('{amount}', this.formatNumber(data.amount))
            .replace('{multiplier}', data.multiplier);
        
        const broadcast = {
            type: 'bigWin',
            icon: template.icon,
            message: message,
            multiplier: data.multiplier,
            amount: data.amount,
            timestamp: Date.now(),
            effects: {
                screenShake: true,
                particles: 100,
                color: '#FFD700'
            }
        };
        
        // Always show big wins globally
        this.showGlobalBroadcast(broadcast);
        this.addToGlobalFeed(broadcast);
        
        // Socket broadcast
        if (this.game.socket) {
            this.game.socket.emit('big_win', data);
        }
    }
    
    broadcastPrestige(data) {
        const template = this.broadcastTemplates.prestige;
        const message = template.messages[Math.floor(Math.random() * template.messages.length)]
            .replace('{player}', this.game.user?.username || 'A player')
            .replace('{level}', data.level)
            .replace('{ordinal}', this.getOrdinal(data.level));
        
        const broadcast = {
            type: 'prestige',
            icon: template.icon,
            message: message,
            level: data.level,
            timestamp: Date.now(),
            effects: {
                cosmic: true,
                duration: 5000
            }
        };
        
        // Prestige always broadcasts
        this.showGlobalBroadcast(broadcast);
        this.addToGlobalFeed(broadcast);
        
        // Update leaderboards
        this.updateLeaderboards();
    }
    
    broadcastStreak(days) {
        if (!this.broadcastTemplates.streak.milestones.includes(days)) {
            return;
        }
        
        const template = this.broadcastTemplates.streak;
        const message = template.messages[Math.floor(Math.random() * template.messages.length)]
            .replace('{player}', this.game.user?.username || 'A player')
            .replace('{days}', days);
        
        const broadcast = {
            type: 'streak',
            icon: template.icon,
            message: message,
            days: days,
            timestamp: Date.now(),
            effects: {
                fire: true,
                intensity: Math.min(days / 100, 1)
            }
        };
        
        this.showLocalBroadcast(broadcast);
        this.addToGlobalFeed(broadcast);
    }
    
    broadcastEventStart(event) {
        const template = this.broadcastTemplates.event;
        const message = template.messages.start
            .replace('{event}', event.name)
            .replace('{participants}', Math.floor(Math.random() * 500) + 100);
        
        const broadcast = {
            type: 'event',
            subtype: 'start',
            icon: event.icon,
            message: message,
            event: event.name,
            timestamp: Date.now(),
            priority: 'high',
            sticky: true
        };
        
        this.showGlobalBroadcast(broadcast);
    }
    
    broadcastEventCompletion(event) {
        const template = this.broadcastTemplates.event;
        const message = template.messages.complete
            .replace('{event}', event.name)
            .replace('{participants}', event.state.participants);
        
        const broadcast = {
            type: 'event',
            subtype: 'complete',
            icon: '🎉',
            message: message,
            event: event.name,
            timestamp: Date.now()
        };
        
        this.showGlobalBroadcast(broadcast);
    }
    
    broadcastMilestone(type, value) {
        const milestoneMessages = {
            currency: '{player} reached {value} total growth! 💰',
            streak: '{player} achieved a {value} day streak! 🔥',
            prestige: '{player} prestiged for the {value}th time! ✨',
            clicks: '{player} clicked {value} times! 👆'
        };
        
        const message = (milestoneMessages[type] || '{player} reached a milestone!')
            .replace('{player}', this.game.user?.username || 'A player')
            .replace('{value}', this.formatNumber(value));
        
        const broadcast = {
            type: 'milestone',
            subtype: type,
            icon: '🏆',
            message: message,
            value: value,
            timestamp: Date.now()
        };
        
        this.showLocalBroadcast(broadcast);
        this.addToGlobalFeed(broadcast);
    }
    
    showLocalBroadcast(broadcast) {
        // Show to player with celebration
        this.game.ui.showBroadcastNotification(broadcast, 'local');
    }
    
    showGlobalBroadcast(broadcast) {
        // Show as global announcement
        this.game.ui.showBroadcastNotification(broadcast, 'global');
    }
    
    addToGlobalFeed(broadcast) {
        // Add to feed
        this.socialFeed.global.unshift({
            ...broadcast,
            id: Date.now() + Math.random(),
            reactions: 0
        });
        
        // Maintain feed size
        if (this.socialFeed.global.length > this.config.maxFeedItems) {
            this.socialFeed.global.pop();
        }
        
        // Update UI
        this.updateSocialFeedUI();
    }
    
    notifyFriends(broadcast) {
        if (Math.random() < this.config.friendNotificationChance) {
            // Simulate friend notifications
            const friendCount = this.playerSocial.friends.length || 
                Math.floor(Math.random() * 10) + 1;
            
            this.game.ui.showFriendNotification({
                message: `Your achievement was shared with ${friendCount} friends!`,
                icon: '👥'
            });
        }
    }
    
    generateLeaderboards() {
        // Generate fake leaderboard data
        this.generateGlobalLeaderboard();
        this.generateFriendsLeaderboard();
        this.generateGuildLeaderboard();
    }
    
    generateGlobalLeaderboard() {
        const players = [];
        
        // Generate top players
        for (let i = 0; i < 1000; i++) {
            const isTopPlayer = i < 10;
            const baseValue = isTopPlayer ? 
                1000000000000 * (10 - i) : // Trillion+ for top 10
                1000000000 * Math.random() * (1000 - i); // Billions for others
            
            players.push({
                rank: i + 1,
                name: this.getRandomPlayer().name,
                value: Math.floor(baseValue * (1 + Math.random() * 0.2)),
                level: Math.floor(100 - i/10 + Math.random() * 20),
                prestige: Math.floor(Math.max(0, 20 - i/50)),
                change: Math.floor(Math.random() * 10) - 5 // Rank change
            });
        }
        
        // Insert player at appropriate rank
        const playerData = {
            rank: this.playerSocial.globalRank,
            name: 'You',
            value: this.game.state.totalCurrencyEarned || 0,
            level: this.game.state.level || 1,
            prestige: this.game.state.prestigeLevel || 0,
            change: 0,
            isPlayer: true
        };
        
        // Find player's actual rank
        const playerIndex = players.findIndex(p => p.value < playerData.value);
        if (playerIndex !== -1) {
            playerData.rank = playerIndex + 1;
            players.splice(playerIndex, 0, playerData);
            
            // Update ranks
            players.forEach((p, i) => p.rank = i + 1);
        } else {
            players.push(playerData);
        }
        
        this.leaderboards.global.allTime = players;
        this.playerSocial.globalRank = playerData.rank;
        
        // Show comparison message
        this.showRankComparison();
    }
    
    generateFriendsLeaderboard() {
        const friends = [];
        const friendCount = Math.min(50, Math.max(5, this.playerSocial.friends.length));
        
        // Generate friend scores
        for (let i = 0; i < friendCount; i++) {
            const playerValue = this.game.state.totalCurrencyEarned || 1000;
            const variance = 0.5 + Math.random(); // 50% to 150% of player
            
            friends.push({
                rank: 0,
                name: `Friend${i + 1}`,
                value: Math.floor(playerValue * variance),
                level: Math.floor(Math.random() * 50) + 1,
                online: Math.random() < 0.3,
                lastSeen: Date.now() - Math.random() * 86400000
            });
        }
        
        // Add player
        friends.push({
            rank: 0,
            name: 'You',
            value: this.game.state.totalCurrencyEarned || 0,
            level: this.game.state.level || 1,
            online: true,
            isPlayer: true
        });
        
        // Sort and rank
        friends.sort((a, b) => b.value - a.value);
        friends.forEach((f, i) => f.rank = i + 1);
        
        this.leaderboards.friends.board = friends;
        
        const playerFriend = friends.find(f => f.isPlayer);
        this.playerSocial.friendRank = playerFriend?.rank || 1;
    }
    
    generateGuildLeaderboard() {
        if (!this.playerSocial.guildId) return;
        
        const members = [];
        const memberCount = 50;
        
        // Generate guild members
        for (let i = 0; i < memberCount; i++) {
            members.push({
                rank: 0,
                name: this.getRandomPlayer().name,
                contribution: Math.floor(Math.random() * 10000000),
                role: i < 5 ? 'officer' : 'member',
                joinDate: Date.now() - Math.random() * 30 * 86400000
            });
        }
        
        // Add player
        const playerContribution = Math.floor(Math.random() * 5000000);
        members.push({
            rank: 0,
            name: 'You',
            contribution: playerContribution,
            role: 'member',
            joinDate: Date.now() - 7 * 86400000,
            isPlayer: true
        });
        
        // Sort by contribution
        members.sort((a, b) => b.contribution - a.contribution);
        members.forEach((m, i) => m.rank = i + 1);
        
        this.leaderboards.guild.board = members;
        
        const playerMember = members.find(m => m.isPlayer);
        this.playerSocial.guildRank = playerMember?.rank || 50;
    }
    
    showRankComparison() {
        const rank = this.playerSocial.globalRank;
        const totalPlayers = this.simulatedPlayers.count;
        const percentile = Math.floor((1 - rank / totalPlayers) * 100);
        
        let message;
        
        if (percentile > 50) {
            // Player is doing well
            message = this.comparisons.ahead[Math.floor(Math.random() * this.comparisons.ahead.length)]
                .replace('{percent}', percentile)
                .replace('{count}', rank - 1);
        } else {
            // Motivate player
            const nextMilestone = this.leaderboards.global.allTime[Math.max(0, rank - 100)];
            message = this.comparisons.behind[Math.floor(Math.random() * this.comparisons.behind.length)]
                .replace('{count}', Math.min(100, rank))
                .replace('{percent}', Math.floor((rank / totalPlayers) * 100))
                .replace('{player}', nextMilestone?.name || 'the next player')
                .replace('{amount}', this.formatNumber(
                    (nextMilestone?.value || 0) - this.game.state.totalCurrencyEarned
                ));
        }
        
        this.game.ui.showComparisonMessage(message, percentile > 50 ? 'positive' : 'motivational');
    }
    
    updateLeaderboards() {
        const now = Date.now();
        
        // Update every 5 minutes
        if (now - this.leaderboards.global.lastUpdate > 300000) {
            this.generateGlobalLeaderboard();
            this.leaderboards.global.lastUpdate = now;
        }
        
        if (now - this.leaderboards.friends.lastUpdate > 300000) {
            this.generateFriendsLeaderboard();
            this.leaderboards.friends.lastUpdate = now;
        }
    }
    
    sendInvite(method) {
        const referralCode = this.generateReferralCode();
        const inviteLink = `https://evergrow.game/ref/${referralCode}`;
        
        const messages = {
            sms: `I'm playing EverGrow and it's addictive! Join me: ${inviteLink}`,
            email: `Check out this amazing idle game I'm playing! Use my link for bonus gems: ${inviteLink}`,
            social: `🌱 Growing my empire in #EverGrow! Who can beat my ${this.formatNumber(this.game.state.totalCurrencyEarned)} score? Join: ${inviteLink}`,
            copy: inviteLink
        };
        
        // Simulate share
        this.playerSocial.sharesTotal++;
        this.playerSocial.lastShareTime = Date.now();
        
        // Show share UI
        this.game.ui.showShareDialog({
            method,
            message: messages[method],
            link: inviteLink,
            reward: this.config.referralBonus.referrer
        });
        
        // Track analytics
        this.game.analytics.track('invite_sent', {
            method,
            totalShares: this.playerSocial.sharesTotal
        });
        
        // Simulate success chance
        if (Math.random() < 0.3) {
            setTimeout(() => {
                this.simulateReferralSuccess();
            }, 30000 + Math.random() * 300000); // 30s to 5m
        }
    }
    
    generateReferralCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    simulateReferralSuccess() {
        this.playerSocial.sharesSuccess++;
        this.playerSocial.referrals.push({
            id: Date.now(),
            joinDate: Date.now(),
            level: 1,
            active: true
        });
        
        // Award referral bonus
        this.game.state.premiumCurrency += this.config.referralBonus.referrer;
        
        // Show success notification
        this.game.ui.showNotification({
            title: '🎉 Referral Success!',
            message: `Someone used your invite link! +${this.config.referralBonus.referrer} gems!`,
            type: 'success',
            duration: 5000
        });
        
        // Check referral milestones
        this.checkReferralMilestones();
    }
    
    checkReferralMilestones() {
        const referralCount = this.playerSocial.referrals.length;
        
        this.socialMilestones.referrals.forEach(milestone => {
            if (referralCount === milestone) {
                // Milestone bonus
                const bonus = milestone * this.config.referralBonus.milestone;
                this.game.state.premiumCurrency += bonus;
                
                // Achievement
                this.game.achievements.unlock(`referrer_${milestone}`);
                
                // Notification
                this.game.ui.showMilestoneReward({
                    title: 'Referral Milestone!',
                    subtitle: `${milestone} friends joined!`,
                    reward: `+${bonus} gems`,
                    icon: '👥'
                });
            }
        });
    }
    
    formatNumber(num) {
        return this.game.ui?.formatNumber(num) || num.toLocaleString();
    }
    
    getSaveData() {
        return {
            playerSocial: this.playerSocial,
            socialFeed: {
                global: this.socialFeed.global.slice(0, 10) // Last 10 items
            }
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        
        if (data.playerSocial) {
            Object.assign(this.playerSocial, data.playerSocial);
        }
        
        if (data.socialFeed) {
            this.socialFeed.global = data.socialFeed.global || [];
        }
        
        // Regenerate leaderboards with loaded data
        this.generateLeaderboards();
    }
    
    update(deltaTime) {
        // Periodic leaderboard updates
        if (Math.random() < 0.001) { // 0.1% chance per frame
            this.updateLeaderboards();
        }
        
        // Update social influence
        this.updateInfluence();
    }
    
    updateInfluence() {
        // Calculate player's social influence
        const factors = {
            friends: this.playerSocial.friends.length * 10,
            referrals: this.playerSocial.referrals.length * 50,
            shares: this.playerSocial.sharesSuccess * 20,
            rank: Math.max(0, 1000 - this.playerSocial.globalRank),
            guild: this.playerSocial.guildRank ? (51 - this.playerSocial.guildRank) * 5 : 0
        };
        
        this.playerSocial.influence = Object.values(factors).reduce((a, b) => a + b, 0);
        
        // Influence provides small bonuses
        const influenceBonus = 1 + (this.playerSocial.influence / 10000);
        this.game.progression.multipliers.social = influenceBonus;
    }
}

export default SocialProofSystem;