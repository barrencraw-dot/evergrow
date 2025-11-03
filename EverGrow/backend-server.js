// server.js
// EverGrow Backend - Neurologically optimized game server
// Handles user data, real-time events, and psychological analytics

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true
    }
});

// MongoDB schemas
const userSchema = new mongoose.Schema({
    // Authentication
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    
    // Game state
    gameState: {
        currency: { type: Number, default: 0 },
        currencyPerSecond: { type: Number, default: 0 },
        totalCurrencyEarned: { type: Number, default: 0 },
        clickPower: { type: Number, default: 1 },
        
        // Prestige
        prestigeLevel: { type: Number, default: 0 },
        prestigePoints: { type: Number, default: 0 },
        soulCurrency: { type: Number, default: 0 },
        totalPrestiges: { type: Number, default: 0 },
        
        // Premium
        premiumCurrency: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        vipLevel: { type: Number, default: 0 },
        
        // Engagement metrics
        totalClicks: { type: Number, default: 0 },
        totalPlayTime: { type: Number, default: 0 },
        lastActiveTime: { type: Date, default: Date.now },
        sessionCount: { type: Number, default: 0 }
    },
    
    // Psychological profile
    psychProfile: {
        playerType: { type: String, enum: ['achiever', 'explorer', 'socializer', 'killer'], default: 'achiever' },
        engagementScore: { type: Number, default: 50 },
        retentionRisk: { type: Number, default: 0 },
        spendingPotential: { type: Number, default: 0 },
        
        // Behavioral metrics
        averageSessionLength: { type: Number, default: 0 },
        clicksPerMinute: { type: Number, default: 0 },
        purchaseFrequency: { type: Number, default: 0 },
        adWatchRate: { type: Number, default: 0 },
        
        // Preferences
        preferredPlayTime: { type: Number, default: 20 }, // Hour of day
        musicEnabled: { type: Boolean, default: true },
        notificationsEnabled: { type: Boolean, default: true }
    },
    
    // Progression
    upgrades: [{
        upgradeId: String,
        owned: { type: Number, default: 0 },
        totalPurchased: { type: Number, default: 0 }
    }],
    
    // Achievements
    achievements: [{
        achievementId: String,
        unlockedAt: Date,
        progress: { type: Number, default: 0 }
    }],
    
    // Streaks and daily
    streaks: {
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastClaimDate: Date,
        streakProtected: { type: Boolean, default: false },
        protectionExpiry: Date
    },
    
    // Social
    social: {
        friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        guildId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
        referralCode: { type: String, unique: true },
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        referralCount: { type: Number, default: 0 }
    },
    
    // Analytics
    analytics: {
        firstPlayDate: { type: Date, default: Date.now },
        lastPlayDate: { type: Date, default: Date.now },
        totalRevenue: { type: Number, default: 0 },
        conversionDate: Date,
        churnPrediction: { type: Number, default: 0 },
        ltv: { type: Number, default: 0 }
    },
    
    // Account status
    status: {
        active: { type: Boolean, default: true },
        banned: { type: Boolean, default: false },
        banReason: String,
        shadowBanned: { type: Boolean, default: false },
        lastLogin: { type: Date, default: Date.now }
    }
}, {
    timestamps: true
});

// Indexes for performance
userSchema.index({ 'gameState.totalCurrencyEarned': -1 }); // Leaderboard
userSchema.index({ 'analytics.lastPlayDate': -1 }); // Retention queries
userSchema.index({ 'social.guildId': 1 }); // Guild queries

// Virtual for leaderboard ranking
userSchema.virtual('rank').get(function() {
    // Would be calculated dynamically
    return 0;
});

// Methods
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { _id: this._id, username: this.username },
        process.env.JWT_SECRET || 'neurologically_optimized_secret',
        { expiresIn: '7d' }
    );
};

userSchema.methods.calculateOfflineProgress = function() {
    const now = Date.now();
    const lastActive = new Date(this.gameState.lastActiveTime).getTime();
    const offlineTime = (now - lastActive) / 1000; // seconds
    
    // Cap at 8 hours, 50% efficiency
    const cappedTime = Math.min(offlineTime, 28800);
    const offlineEarnings = this.gameState.currencyPerSecond * cappedTime * 0.5;
    
    return {
        time: cappedTime,
        earnings: Math.floor(offlineEarnings),
        capped: offlineTime > 28800
    };
};

userSchema.methods.canPrestige = function() {
    // Logarithmic prestige requirement
    const requirement = Math.pow(10, 6 + this.gameState.prestigeLevel * 2);
    return this.gameState.totalCurrencyEarned >= requirement;
};

userSchema.methods.calculatePrestigeReward = function() {
    const base = Math.log10(this.gameState.totalCurrencyEarned / 1000000);
    const points = Math.floor(base * 10 * (1 + this.gameState.prestigeLevel * 0.1));
    const souls = Math.floor(points * 0.1);
    
    return { points, souls, multiplier: 1 + (this.gameState.prestigeLevel + 1) * 0.5 };
};

const User = mongoose.model('User', userSchema);

// Guild schema for social features
const guildSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tag: { type: String, required: true, unique: true },
    description: String,
    icon: String,
    
    // Leadership
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    officers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // Members
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: { type: Date, default: Date.now },
        contribution: { type: Number, default: 0 },
        rank: { type: String, default: 'member' }
    }],
    
    // Guild stats
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    totalProduction: { type: Number, default: 0 },
    
    // Perks
    perks: {
        productionBonus: { type: Number, default: 0 },
        clickBonus: { type: Number, default: 0 },
        offlineBonus: { type: Number, default: 0 }
    },
    
    // Competition
    weeklyRank: { type: Number, default: 0 },
    trophies: { type: Number, default: 0 },
    
    settings: {
        public: { type: Boolean, default: true },
        minLevel: { type: Number, default: 0 },
        autoAccept: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

const Guild = mongoose.model('Guild', guildSchema);

// Leaderboard schema for caching
const leaderboardSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['daily', 'weekly', 'alltime'] },
    category: { type: String, required: true, enum: ['currency', 'prestige', 'clicks'] },
    entries: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        value: Number,
        rank: Number,
        change: Number // Position change since last update
    }],
    lastUpdated: { type: Date, default: Date.now }
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// Event schema for time-limited events
const eventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['competition', 'collection', 'challenge'] },
    
    // Timing
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    active: { type: Boolean, default: true },
    
    // Rewards
    rewards: [{
        tier: Number,
        requirement: Number,
        prizes: {
            currency: Number,
            premiumCurrency: Number,
            multiplier: Number,
            exclusive: String
        }
    }],
    
    // Participation
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number, default: 0 },
        claimedRewards: [Number]
    }],
    
    // Psychology
    urgencyLevel: { type: Number, default: 1 },
    fomoBoosted: { type: Boolean, default: false }
});

const Event = mongoose.model('Event', eventSchema);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Strict limit for sensitive operations
    message: 'Rate limit exceeded'
});

app.use('/api/', limiter);
app.use('/api/auth/', strictLimiter);
app.use('/api/purchase/', strictLimiter);

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error();
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'neurologically_optimized_secret');
        const user = await User.findOne({ _id: decoded._id, 'status.active': true });
        
        if (!user) throw new Error();
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate' });
    }
};

// Routes

// Authentication
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, referralCode } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            'social.referralCode': generateReferralCode()
        });
        
        // Handle referral
        if (referralCode) {
            const referrer = await User.findOne({ 'social.referralCode': referralCode });
            if (referrer) {
                user.social.referredBy = referrer._id;
                referrer.social.referralCount++;
                referrer.gameState.premiumCurrency += 20; // Referral bonus
                await referrer.save();
            }
        }
        
        await user.save();
        
        const token = user.generateAuthToken();
        
        // Welcome bonus
        user.gameState.premiumCurrency = 50;
        await user.save();
        
        res.status(201).json({
            user: {
                id: user._id,
                username: user.username,
                gameState: user.gameState
            },
            token
        });
        
        // Emit new user event for analytics
        io.emit('new_user', { username: user.username });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ 
            $or: [{ username }, { email: username }],
            'status.active': true 
        });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Calculate offline progress
        const offlineProgress = user.calculateOfflineProgress();
        
        // Update last login
        user.status.lastLogin = new Date();
        user.gameState.sessionCount++;
        
        // Check daily streak
        const lastClaim = user.streaks.lastClaimDate;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (!lastClaim || lastClaim.toDateString() === yesterday) {
            user.streaks.currentStreak++;
            user.streaks.lastClaimDate = new Date();
            
            if (user.streaks.currentStreak > user.streaks.longestStreak) {
                user.streaks.longestStreak = user.streaks.currentStreak;
            }
        } else if (lastClaim.toDateString() !== today) {
            // Streak broken
            user.streaks.currentStreak = 1;
            user.streaks.lastClaimDate = new Date();
        }
        
        await user.save();
        
        const token = user.generateAuthToken();
        
        res.json({
            user: {
                id: user._id,
                username: user.username,
                gameState: user.gameState,
                upgrades: user.upgrades,
                achievements: user.achievements,
                streaks: user.streaks
            },
            token,
            offlineProgress
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Game state sync
app.post('/api/game/save', auth, async (req, res) => {
    try {
        const { gameState, upgrades, achievements } = req.body;
        
        // Validate and sanitize input to prevent cheating
        const validatedState = validateGameState(gameState, req.user.gameState);
        
        // Update user
        req.user.gameState = { ...req.user.gameState, ...validatedState };
        req.user.upgrades = upgrades;
        req.user.achievements = achievements;
        req.user.gameState.lastActiveTime = new Date();
        
        // Update psychological profile
        updatePsychProfile(req.user, gameState);
        
        await req.user.save();
        
        res.json({ success: true, timestamp: Date.now() });
        
        // Broadcast updates for leaderboard
        io.emit('leaderboard_update', {
            userId: req.user._id,
            currency: req.user.gameState.totalCurrencyEarned
        });
        
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Save failed' });
    }
});

// Prestige system
app.post('/api/game/prestige', auth, async (req, res) => {
    try {
        if (!req.user.canPrestige()) {
            return res.status(400).json({ error: 'Cannot prestige yet' });
        }
        
        const rewards = req.user.calculatePrestigeReward();
        
        // Reset game state but keep prestige data
        req.user.gameState.currency = 0;
        req.user.gameState.currencyPerSecond = 0;
        req.user.gameState.clickPower = 1;
        req.user.gameState.prestigeLevel++;
        req.user.gameState.prestigePoints += rewards.points;
        req.user.gameState.soulCurrency += rewards.souls;
        req.user.gameState.totalPrestiges++;
        
        // Reset upgrades
        req.user.upgrades = [];
        
        // Keep achievements
        
        await req.user.save();
        
        res.json({
            success: true,
            rewards,
            newPrestigeLevel: req.user.gameState.prestigeLevel
        });
        
        // Analytics event
        trackEvent('prestige', {
            userId: req.user._id,
            level: req.user.gameState.prestigeLevel,
            pointsEarned: rewards.points
        });
        
    } catch (error) {
        console.error('Prestige error:', error);
        res.status(500).json({ error: 'Prestige failed' });
    }
});

// Leaderboards
app.get('/api/leaderboard/:type/:category', async (req, res) => {
    try {
        const { type, category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        
        // Check cache first
        let leaderboard = await Leaderboard.findOne({ type, category });
        
        // Update if stale (older than 5 minutes)
        if (!leaderboard || Date.now() - leaderboard.lastUpdated > 300000) {
            leaderboard = await updateLeaderboard(type, category);
        }
        
        // Paginate
        const start = (page - 1) * limit;
        const entries = leaderboard.entries.slice(start, start + limit);
        
        res.json({
            entries,
            page,
            totalPages: Math.ceil(leaderboard.entries.length / limit),
            lastUpdated: leaderboard.lastUpdated
        });
        
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Events
app.get('/api/events/active', async (req, res) => {
    try {
        const now = new Date();
        const events = await Event.find({
            active: true,
            startTime: { $lte: now },
            endTime: { $gte: now }
        });
        
        res.json(events);
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.post('/api/events/:eventId/participate', auth, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { score } = req.body;
        
        const event = await Event.findOne({ eventId, active: true });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        // Add or update participation
        const participation = event.participants.find(
            p => p.userId.toString() === req.user._id.toString()
        );
        
        if (participation) {
            participation.score += score;
        } else {
            event.participants.push({
                userId: req.user._id,
                score
            });
        }
        
        await event.save();
        
        // Check for rewards
        const eligibleRewards = event.rewards.filter(
            r => score >= r.requirement && 
                !participation?.claimedRewards.includes(r.tier)
        );
        
        res.json({
            success: true,
            newScore: participation ? participation.score : score,
            eligibleRewards
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to participate in event' });
    }
});

// Guild system
app.post('/api/guild/create', auth, async (req, res) => {
    try {
        const { name, tag, description } = req.body;
        
        // Check if user already in guild
        if (req.user.social.guildId) {
            return res.status(400).json({ error: 'Already in a guild' });
        }
        
        // Check if tag exists
        const existing = await Guild.findOne({ tag });
        if (existing) {
            return res.status(400).json({ error: 'Guild tag already taken' });
        }
        
        const guild = new Guild({
            name,
            tag,
            description,
            leader: req.user._id,
            members: [{
                userId: req.user._id,
                rank: 'leader'
            }]
        });
        
        await guild.save();
        
        req.user.social.guildId = guild._id;
        await req.user.save();
        
        res.json({ success: true, guild });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to create guild' });
    }
});

// Real-time features with Socket.io
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'neurologically_optimized_secret');
        const user = await User.findById(decoded._id);
        
        socket.userId = user._id.toString();
        socket.user = user;
        next();
    } catch (err) {
        next(new Error('Authentication failed'));
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    
    // Join user's personal room
    socket.join(socket.userId);
    
    // Join guild room if in guild
    if (socket.user.social.guildId) {
        socket.join(`guild:${socket.user.social.guildId}`);
    }
    
    // Real-time events
    socket.on('achievement_unlocked', async (data) => {
        // Broadcast to friends
        const friends = await User.find({
            _id: { $in: socket.user.social.friends }
        });
        
        friends.forEach(friend => {
            io.to(friend._id.toString()).emit('friend_achievement', {
                username: socket.user.username,
                achievement: data.achievement
            });
        });
        
        // Update global feed
        io.emit('global_achievement', {
            username: socket.user.username,
            achievement: data.achievement,
            rarity: calculateAchievementRarity(data.achievement)
        });
    });
    
    socket.on('big_win', (data) => {
        // Broadcast big wins for social proof
        if (data.multiplier >= 50) {
            io.emit('mega_win', {
                username: socket.user.username,
                amount: data.amount,
                multiplier: data.multiplier
            });
        }
    });
    
    socket.on('guild_contribution', async (data) => {
        // Update guild production
        const guild = await Guild.findById(socket.user.social.guildId);
        if (guild) {
            guild.totalProduction += data.amount;
            
            const member = guild.members.find(
                m => m.userId.toString() === socket.userId
            );
            if (member) {
                member.contribution += data.amount;
            }
            
            await guild.save();
            
            // Notify guild members
            io.to(`guild:${guild._id}`).emit('guild_update', {
                totalProduction: guild.totalProduction,
                contributor: socket.user.username,
                amount: data.amount
            });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.userId);
    });
});

// Helper functions
function validateGameState(clientState, serverState) {
    // Anti-cheat validation
    const maxReasonableGrowth = serverState.currencyPerSecond * 3600 * 24; // 24 hours
    
    const validated = {};
    
    // Currency validation
    if (clientState.currency - serverState.currency > maxReasonableGrowth) {
        console.warn('Suspicious currency growth detected:', clientState.currency);
        validated.currency = serverState.currency + maxReasonableGrowth;
    } else {
        validated.currency = Math.max(0, clientState.currency);
    }
    
    // CPS validation
    const maxCPS = calculateMaxPossibleCPS(serverState);
    validated.currencyPerSecond = Math.min(clientState.currencyPerSecond, maxCPS);
    
    // Other validations
    validated.totalCurrencyEarned = Math.max(
        serverState.totalCurrencyEarned,
        clientState.totalCurrencyEarned
    );
    
    validated.clickPower = Math.max(1, Math.min(clientState.clickPower, 1000));
    
    return validated;
}

function calculateMaxPossibleCPS(gameState) {
    // Calculate theoretical maximum based on prestige and time played
    const baseMax = 1000000; // 1M base
    const prestigeMultiplier = Math.pow(10, gameState.prestigeLevel);
    const timeMultiplier = Math.log10(gameState.totalPlayTime / 3600 + 1) + 1;
    
    return baseMax * prestigeMultiplier * timeMultiplier;
}

function updatePsychProfile(user, gameState) {
    const session = Date.now() - new Date(gameState.sessionStartTime).getTime();
    
    // Update average session length
    user.psychProfile.averageSessionLength = 
        (user.psychProfile.averageSessionLength * 0.9) + (session * 0.1);
    
    // Update engagement score based on activity
    const clicksPerMinute = gameState.sessionClicks / (session / 60000);
    user.psychProfile.clicksPerMinute = 
        (user.psychProfile.clicksPerMinute * 0.9) + (clicksPerMinute * 0.1);
    
    // Determine player type based on behavior
    if (user.achievements.length > user.upgrades.length * 2) {
        user.psychProfile.playerType = 'achiever';
    } else if (user.social.friends.length > 10) {
        user.psychProfile.playerType = 'socializer';
    }
    
    // Calculate retention risk
    const daysSinceLastPlay = (Date.now() - user.analytics.lastPlayDate) / 86400000;
    if (daysSinceLastPlay > 3) {
        user.psychProfile.retentionRisk = Math.min(100, daysSinceLastPlay * 10);
    }
    
    // Estimate spending potential
    if (user.gameState.totalSpent > 0) {
        const avgSpendPerSession = user.gameState.totalSpent / user.gameState.sessionCount;
        user.psychProfile.spendingPotential = Math.min(100, avgSpendPerSession * 10);
    }
}

function generateReferralCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function updateLeaderboard(type, category) {
    let query = {};
    let sortField = '';
    let timeFilter = {};
    
    // Time filters
    const now = new Date();
    switch(type) {
        case 'daily':
            timeFilter = {
                'analytics.lastPlayDate': {
                    $gte: new Date(now.setHours(0, 0, 0, 0))
                }
            };
            break;
        case 'weekly':
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            timeFilter = {
                'analytics.lastPlayDate': {
                    $gte: weekStart
                }
            };
            break;
    }
    
    // Category sorting
    switch(category) {
        case 'currency':
            sortField = 'gameState.totalCurrencyEarned';
            break;
        case 'prestige':
            sortField = 'gameState.prestigeLevel';
            break;
        case 'clicks':
            sortField = 'gameState.totalClicks';
            break;
    }
    
    query = { ...timeFilter, 'status.active': true, 'status.banned': false };
    
    const users = await User.find(query)
        .sort({ [sortField]: -1 })
        .limit(1000)
        .select('username gameState');
    
    const entries = users.map((user, index) => ({
        userId: user._id,
        username: user.username,
        value: user.gameState[sortField.split('.')[1]],
        rank: index + 1,
        change: 0 // Would calculate from previous leaderboard
    }));
    
    const leaderboard = await Leaderboard.findOneAndUpdate(
        { type, category },
        { 
            type, 
            category, 
            entries, 
            lastUpdated: new Date() 
        },
        { upsert: true, new: true }
    );
    
    return leaderboard;
}

function calculateAchievementRarity(achievementId) {
    // Would query database for actual rarity
    const rarities = {
        firstClick: 'common',
        millionaire: 'rare',
        billionaire: 'epic',
        trillionaire: 'legendary'
    };
    
    return rarities[achievementId] || 'common';
}

function trackEvent(eventName, data) {
    // Would send to analytics service
    console.log('Analytics event:', eventName, data);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/evergrow', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`🌱 EverGrow server running on port ${PORT}`);
        console.log('Neurological optimization systems active');
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    
    await mongoose.connection.close();
    
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export default app;