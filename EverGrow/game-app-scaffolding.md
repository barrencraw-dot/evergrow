# EverGrow - Neurologically-Optimized Idle Game Architecture

## 🏗️ Project Structure

```
evergrow/
├── frontend/
│   ├── index.html                 # PWA entry point
│   ├── manifest.json              # PWA manifest
│   ├── service-worker.js          # Offline capability
│   ├── src/
│   │   ├── core/
│   │   │   ├── Game.js           # Main game loop
│   │   │   ├── StateManager.js   # Game state management
│   │   │   ├── EventBus.js       # Event-driven architecture
│   │   │   └── ResourceManager.js # Asset loading
│   │   ├── systems/
│   │   │   ├── ProgressionSystem.js    # Core idle mechanics
│   │   │   ├── PrestigeSystem.js       # Prestige/reset loops
│   │   │   ├── AchievementSystem.js    # Achievement tracking
│   │   │   ├── StreakSystem.js         # Daily engagement
│   │   │   └── EventSystem.js          # Time-limited events
│   │   ├── psychology/
│   │   │   ├── DopamineController.js   # Variable reward scheduling
│   │   │   ├── FlowStateManager.js     # Difficulty adaptation
│   │   │   ├── LossAversionEngine.js   # FOMO mechanics
│   │   │   └── SocialProofSystem.js    # Leaderboards/sharing
│   │   ├── audio/
│   │   │   ├── AdaptiveMusicEngine.js  # Dynamic music system
│   │   │   ├── EmotionMapper.js        # Music-emotion mapping
│   │   │   ├── BrainwaveController.js  # Frequency optimization
│   │   │   └── AudioFeedback.js        # Sound effects
│   │   ├── ui/
│   │   │   ├── UIManager.js            # UI state management
│   │   │   ├── components/
│   │   │   │   ├── ProgressBar.js      # Visual feedback
│   │   │   │   ├── UpgradePanel.js     # Shop interface
│   │   │   │   ├── LeaderboardView.js  # Social features
│   │   │   │   └── NotificationSystem.js # Push notifications
│   │   │   └── animations/
│   │   │       ├── ParticleEffects.js  # Reward animations
│   │   │       └── TransitionEffects.js # Smooth transitions
│   │   ├── monetization/
│   │   │   ├── ShopManager.js          # IAP handling
│   │   │   ├── AdManager.js            # Rewarded video ads
│   │   │   ├── SubscriptionManager.js  # Premium features
│   │   │   └── OfferEngine.js          # Dynamic pricing
│   │   └── utils/
│   │       ├── Analytics.js            # Behavior tracking
│   │       ├── SaveManager.js          # Local/cloud saves
│   │       └── NumberFormatter.js      # Large number display
│   ├── assets/
│   │   ├── images/                     # Sprites and UI
│   │   ├── audio/                      # Music and SFX
│   │   └── fonts/                      # Typography
│   └── styles/
│       ├── main.css                    # Core styles
│       ├── animations.css              # Animation library
│       └── responsive.css              # Mobile optimization
│
├── backend/
│   ├── server.js                       # Express server
│   ├── config/
│   │   ├── database.js                 # MongoDB connection
│   │   ├── redis.js                    # Cache configuration
│   │   └── firebase.js                 # Firebase admin
│   ├── models/
│   │   ├── User.js                     # User schema
│   │   ├── GameState.js                # Save data schema
│   │   ├── Leaderboard.js              # Rankings schema
│   │   └── Event.js                    # Time-limited events
│   ├── controllers/
│   │   ├── AuthController.js           # Authentication
│   │   ├── GameController.js           # Game state sync
│   │   ├── LeaderboardController.js    # Rankings
│   │   ├── EventController.js          # Live events
│   │   └── PurchaseController.js       # IAP validation
│   ├── services/
│   │   ├── AnalyticsService.js         # Player behavior analysis
│   │   ├── NotificationService.js      # Push notifications
│   │   ├── MatchmakingService.js       # Social features
│   │   └── AntiCheatService.js         # Security
│   ├── middleware/
│   │   ├── auth.js                     # JWT validation
│   │   ├── rateLimit.js                # DDoS protection
│   │   └── validation.js               # Input sanitization
│   └── websocket/
│       ├── SocketManager.js            # Real-time updates
│       └── handlers/                   # Event handlers
│
├── shared/
│   ├── constants/
│   │   ├── GameBalance.js              # Progression values
│   │   ├── PsychologyParams.js         # Behavioral constants
│   │   └── MusicParameters.js          # Audio settings
│   └── formulas/
│       ├── ProgressionFormulas.js      # Growth calculations
│       └── RewardFormulas.js           # Reward algorithms
│
├── tests/
│   ├── unit/                           # Unit tests
│   ├── integration/                    # Integration tests
│   └── e2e/                           # End-to-end tests
│
├── deployment/
│   ├── docker-compose.yml              # Container setup
│   ├── nginx.conf                      # Reverse proxy
│   └── firebase.json                   # Firebase config
│
├── package.json                        # Dependencies
├── .env.example                        # Environment variables
└── README.md                          # Documentation
```

## 🧠 Core Psychological Systems

### 1. Dopamine Release Architecture
- **Variable Ratio Reinforcement**: Randomized reward multipliers (1x-10x)
- **Near-Miss Mechanics**: 95% progress bars that slow down
- **Anticipation Building**: Countdown timers with accelerating music
- **Jackpot Moments**: Rare mega-rewards with special animations

### 2. Flow State Optimization
- **Dynamic Difficulty**: Auto-adjust upgrade costs based on player speed
- **Adaptive Music Tempo**: BPM increases with rapid clicking
- **Cognitive Load Balancing**: Gradually introduce new mechanics
- **Biofeedback Integration**: Monitor click patterns for engagement

### 3. Loss Aversion Triggers
- **Streak Protection**: Watch ad to save daily streak
- **Limited-Time Offers**: 24-hour flash sales with countdown
- **Prestige FOMO**: Show potential rewards before reset
- **Resource Decay**: Idle penalties encourage frequent returns

### 4. Social Proof Integration
- **Live Feed**: Real-time achievement notifications
- **Comparative Progress**: "You're ahead of 73% of players"
- **Guild Systems**: Cooperative challenges
- **Viral Mechanics**: Bonus resources for friend invites

## 🎵 Adaptive Music Engine

### Emotion-State Mapping
```javascript
const emotionStates = {
  excitement: {
    tempo: 140,
    key: 'C major',
    intervals: ['perfect fifth', 'major third'],
    brainwave: 'beta (13-32 Hz)'
  },
  anticipation: {
    tempo: 120,
    key: 'G major',
    intervals: ['suspended fourth'],
    brainwave: 'beta-gamma transition'
  },
  satisfaction: {
    tempo: 90,
    key: 'F major',
    intervals: ['perfect octave'],
    brainwave: 'alpha (8-13 Hz)'
  },
  tension: {
    tempo: 100,
    key: 'D minor',
    intervals: ['tritone', 'minor second'],
    brainwave: 'high beta'
  }
};
```

### Dynamic Layering System
- **Base Layer**: Ambient pad (always playing)
- **Rhythm Layer**: Activates on player interaction
- **Melody Layer**: Scales with progression speed
- **Climax Layer**: Triggers on achievements
- **Binaural Beats**: Embedded frequency modulation

## 🎯 Monetization Psychology

### Premium Currency Design
- **Scarcity Principle**: Limited daily free gems
- **Anchoring Bias**: Show $99.99 pack first
- **Decoy Effect**: Make $19.99 pack seem valuable
- **Sunk Cost**: Subscription with accumulating benefits

### Ad Integration Strategy
- **Reward Doubling**: Optional 30s video
- **Energy Refill**: Continue playing immediately
- **Streak Insurance**: Protect progress
- **Exclusive Content**: Ad-locked special events

## 📊 Analytics & Optimization

### Key Metrics to Track
- **Retention**: D1, D7, D30 cohort analysis
- **Engagement**: Session length, click frequency
- **Monetization**: ARPDAU, conversion rates
- **Psychology**: Flow state duration, dopamine peaks

### A/B Testing Framework
- Music tempo variations
- Color psychology experiments
- Reward schedule optimization
- UI layout iterations

## 🔒 Security & Anti-Cheat

### Client-Side Protection
- Obfuscated game logic
- Request signing
- Rate limiting
- Sanity checks

### Server-Side Validation
- State verification
- Progression analysis
- Anomaly detection
- Shadow banning system

## 🚀 Performance Optimization

### Progressive Web App Features
- Service worker caching
- Background sync
- Push notifications
- Add to home screen

### Resource Management
- Lazy loading assets
- Texture atlasing
- Audio sprite sheets
- WebGL rendering

## 📱 Platform Considerations

### Mobile Optimization
- Touch-friendly UI (44px minimum)
- Gesture controls
- Battery efficiency
- Offline progression

### Cross-Platform Sync
- Cloud save system
- Device handoff
- Progress merge logic
- Conflict resolution