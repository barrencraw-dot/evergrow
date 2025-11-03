// UIManager.js
// Implements psychologically optimized UI/UX with dopamine-driven feedback
// Based on F-pattern scanning, color psychology, and instant gratification

class UIManager {
    constructor(game) {
        this.game = game;
        
        // UI Configuration based on psychological principles
        this.config = {
            // Animation durations for dopamine timing
            animations: {
                quick: 200,      // Instant feedback
                normal: 500,     // Standard transitions
                dramatic: 1000,  // Big wins
                epic: 3000      // Milestone moments
            },
            
            // Color psychology mapping
            colors: {
                positive: '#2E8B57',      // Forest green - growth
                negative: '#FF6B6B',      // Soft red - loss
                premium: '#FFD700',       // Gold - value
                energy: '#FF8844',        // Orange - excitement
                calm: '#4169E1',          // Blue - trust
                mystery: '#9370DB',       // Purple - intrigue
                
                // Emotional gradients
                success: 'linear-gradient(135deg, #2E8B57 0%, #90EE90 100%)',
                danger: 'linear-gradient(135deg, #FF6B6B 0%, #FF4444 100%)',
                premium: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                cosmic: 'linear-gradient(135deg, #000428 0%, #004e92 100%)'
            },
            
            // Haptic feedback patterns
            haptics: {
                light: 10,
                medium: 25,
                heavy: 50,
                success: [10, 50, 10],
                error: [100, 50, 100]
            },
            
            // Z-index hierarchy
            layers: {
                background: 0,
                game: 10,
                ui: 100,
                popups: 1000,
                notifications: 2000,
                critical: 9999
            }
        };
        
        // UI Elements cache
        this.elements = {
            // Core displays
            currencyDisplay: null,
            cpsDisplay: null,
            streakDisplay: null,
            
            // Panels
            upgradePanel: null,
            achievementPanel: null,
            socialFeed: null,
            
            // Overlays
            modalOverlay: null,
            notificationQueue: [],
            
            // Effects
            particleContainer: null,
            screenEffects: null
        };
        
        // Notification queue for dopamine drip
        this.notificationQueue = [];
        this.activeNotifications = new Set();
        this.processingNotification = false;
        
        // Visual effects state
        this.effects = {
            particles: [],
            screenShake: {
                active: false,
                intensity: 0,
                duration: 0
            },
            glowEffects: new Map(),
            activeThemes: new Set()
        };
        
        // Psychological UI patterns
        this.patterns = {
            // Near-miss visualization
            nearMiss: {
                progressBar: {
                    slowdownAt: 0.9,
                    finalSpeed: 0.1,
                    shakeOnFail: true
                }
            },
            
            // Loss aversion framing
            lossFraming: {
                emphasizeRed: true,
                largerFont: 1.2,
                pulseAnimation: true,
                darkBackground: true
            },
            
            // Reward celebration scaling
            celebrationIntensity: {
                small: 1,
                medium: 2,
                large: 5,
                mega: 10
            }
        };
        
        // F-pattern layout optimization
        this.layout = {
            hotZones: {
                topLeft: { importance: 1, usage: 'branding' },
                topRight: { importance: 0.8, usage: 'premium' },
                leftSide: { importance: 0.7, usage: 'navigation' },
                center: { importance: 1, usage: 'action' },
                bottomRight: { importance: 0.6, usage: 'shop' }
            }
        };
        
        // Cached number formatters for performance
        this.formatters = {
            compact: new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }),
            full: new Intl.NumberFormat('en', { maximumFractionDigits: 0 }),
            currency: new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' })
        };
    }
    
    initialize() {
        console.log('🎨 UI Manager initialized - Psychological optimization active');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Set up psychological color schemes
        this.applyColorPsychology();
        
        // Initialize particle system
        this.initializeParticleSystem();
        
        // Set up notification processor
        this.startNotificationProcessor();
        
        // Apply F-pattern layout
        this.optimizeLayout();
        
        // Initialize touch/click feedback
        this.setupInteractionFeedback();
    }
    
    cacheElements() {
        // Cache frequently accessed elements
        this.elements.currencyDisplay = document.getElementById('currencyDisplay');
        this.elements.cpsDisplay = document.getElementById('cpsDisplay');
        this.elements.streakDisplay = document.getElementById('streakCount');
        this.elements.upgradePanel = document.getElementById('upgradesPanel');
        
        // Create overlay containers
        this.createOverlayContainers();
    }
    
    createOverlayContainers() {
        // Modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'modalOverlay';
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            z-index: ${this.config.layers.popups};
            backdrop-filter: blur(5px);
        `;
        document.body.appendChild(modalOverlay);
        this.elements.modalOverlay = modalOverlay;
        
        // Particle container
        const particleContainer = document.createElement('div');
        particleContainer.id = 'particleContainer';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: ${this.config.layers.notifications};
        `;
        document.body.appendChild(particleContainer);
        this.elements.particleContainer = particleContainer;
        
        // Notification container
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: ${this.config.layers.notifications};
            pointer-events: none;
        `;
        document.body.appendChild(notificationContainer);
        this.elements.notificationContainer = notificationContainer;
    }
    
    applyColorPsychology() {
        // Set CSS variables for psychological color usage
        const root = document.documentElement;
        
        Object.entries(this.config.colors).forEach(([name, color]) => {
            root.style.setProperty(`--color-${name}`, color);
        });
        
        // Apply emotional gradients
        root.style.setProperty('--gradient-success', this.config.colors.success);
        root.style.setProperty('--gradient-danger', this.config.colors.danger);
        root.style.setProperty('--gradient-premium', this.config.colors.premium);
    }
    
    optimizeLayout() {
        // Apply F-pattern optimization
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;
        
        // Ensure critical elements are in hot zones
        const currencyDisplay = document.querySelector('.currency-display');
        if (currencyDisplay) {
            currencyDisplay.style.order = '-1'; // Move to top
        }
        
        // Premium elements in top-right hot zone
        const premiumDisplay = document.querySelector('.premium-currency');
        if (premiumDisplay) {
            premiumDisplay.style.position = 'absolute';
            premiumDisplay.style.top = '20px';
            premiumDisplay.style.right = '20px';
        }
    }
    
    setupInteractionFeedback() {
        // Touch/click feedback for dopamine micro-hits
        document.addEventListener('click', (e) => {
            // Skip if clicking UI elements
            if (e.target.closest('button, a, input')) return;
            
            // Create ripple effect at click position
            this.createRippleEffect(e.clientX, e.clientY);
        });
        
        // Button hover effects
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.addGlowEffect(button, 'hover');
            });
            
            button.addEventListener('mouseleave', () => {
                this.removeGlowEffect(button, 'hover');
            });
        });
    }
    
    // Core display updates
    updateDisplay() {
        // Update currency with animation
        if (this.elements.currencyDisplay) {
            const formatted = this.formatNumber(Math.floor(this.game.state.currency));
            
            if (this.elements.currencyDisplay.textContent !== formatted) {
                this.elements.currencyDisplay.textContent = formatted;
                this.pulseElement(this.elements.currencyDisplay);
            }
        }
        
        // Update CPS
        if (this.elements.cpsDisplay) {
            this.elements.cpsDisplay.textContent = this.formatNumber(this.game.state.currencyPerSecond);
        }
    }
    
    render(state) {
        // Main render call
        this.updateDisplay();
        
        // Update other UI elements
        this.updateProgressBars();
        this.updateMultiplierDisplay();
    }
    
    // Number formatting with psychological thresholds
    formatNumber(num) {
        if (num < 1000) return Math.floor(num).toString();
        if (num < 1000000) return this.formatters.compact.format(num);
        
        // Large numbers create excitement
        const formatted = this.formatters.compact.format(num);
        
        // Add visual emphasis for milestones
        if (num >= 1000000000000) { // Trillion
            return `<span class="number-epic">${formatted}</span>`;
        } else if (num >= 1000000000) { // Billion
            return `<span class="number-large">${formatted}</span>`;
        }
        
        return formatted;
    }
    
    // Click feedback system
    showClickFeedback(amount, isMultiplier) {
        const feedback = document.createElement('div');
        feedback.className = 'click-feedback';
        feedback.textContent = `+${this.formatNumber(amount)}`;
        
        // Style based on value
        if (isMultiplier) {
            feedback.style.color = this.config.colors.premium;
            feedback.style.fontSize = '28px';
            feedback.style.fontWeight = 'bold';
        } else {
            feedback.style.color = this.config.colors.positive;
            feedback.style.fontSize = '20px';
        }
        
        // Random position around click
        const x = this.game.lastClickX || window.innerWidth / 2;
        const y = this.game.lastClickY || window.innerHeight / 2;
        
        feedback.style.cssText += `
            position: fixed;
            left: ${x + (Math.random() - 0.5) * 50}px;
            top: ${y - 20}px;
            pointer-events: none;
            z-index: ${this.config.layers.notifications};
            animation: floatUp 1s ease-out forwards;
        `;
        
        document.body.appendChild(feedback);
        
        // Remove after animation
        setTimeout(() => feedback.remove(), 1000);
        
        // Haptic feedback
        this.triggerHaptic(isMultiplier ? 'medium' : 'light');
    }
    
    // Particle system for dopamine rewards
    initializeParticleSystem() {
        // Create CSS for particle animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFly {
                0% {
                    opacity: 1;
                    transform: translate(0, 0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(var(--dx), var(--dy)) scale(0.3);
                }
            }
            
            @keyframes floatUp {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-100px) scale(1.5);
                }
            }
            
            @keyframes screenShake {
                0%, 100% { transform: translate(0, 0); }
                10%, 30%, 50%, 70%, 90% { transform: translate(-2px, 2px); }
                20%, 40%, 60%, 80% { transform: translate(2px, -2px); }
            }
            
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 5px var(--glow-color); }
                50% { box-shadow: 0 0 20px var(--glow-color), 0 0 40px var(--glow-color); }
            }
            
            .particle {
                position: fixed;
                pointer-events: none;
                animation: particleFly var(--lifetime) ease-out forwards;
            }
            
            .number-large {
                color: ${this.config.colors.energy};
                text-shadow: 0 0 10px rgba(255, 136, 68, 0.5);
            }
            
            .number-epic {
                color: ${this.config.colors.premium};
                text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
                animation: glow 1s ease-in-out infinite;
                --glow-color: ${this.config.colors.premium};
            }
        `;
        document.head.appendChild(style);
    }
    
    createParticleSystem(particles) {
        particles.forEach(config => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = config.emoji || '✨';
            
            particle.style.cssText = `
                left: ${config.x}px;
                top: ${config.y}px;
                font-size: ${config.size}px;
                color: ${config.color};
                --dx: ${config.vx || config.velocity?.x || 0}px;
                --dy: ${config.vy || config.velocity?.y || 0}px;
                --lifetime: ${config.lifetime || 1000}ms;
            `;
            
            this.elements.particleContainer.appendChild(particle);
            
            // Remove after animation
            setTimeout(() => particle.remove(), config.lifetime || 1000);
        });
    }
    
    particleExplosion(emoji = '💰', count = 30) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 5 + Math.random() * 10;
            
            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                emoji: emoji,
                size: 20 + Math.random() * 20,
                color: this.config.colors.premium,
                lifetime: 1000 + Math.random() * 1000
            });
        }
        
        this.createParticleSystem(particles);
    }
    
    // Screen shake for big impacts
    screenShake(duration = 500, intensity = 1) {
        const container = document.querySelector('.game-container');
        if (!container) return;
        
        container.style.animation = `screenShake ${duration}ms ease-out`;
        
        // Haptic feedback
        this.triggerHaptic('heavy');
        
        setTimeout(() => {
            container.style.animation = '';
        }, duration);
    }
    
    // Achievement notification with dopamine optimization
    showAchievement(notification) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        
        // Style based on rarity
        const rarityColors = {
            common: this.config.colors.positive,
            rare: this.config.colors.calm,
            epic: this.config.colors.mystery,
            legendary: this.config.colors.premium
        };
        
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: ${rarityColors[notification.rarity] || this.config.colors.positive};
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            text-align: center;
            z-index: ${this.config.layers.critical};
            animation: achievementPop 0.5s ease forwards;
            max-width: 400px;
        `;
        
        popup.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 10px;">${notification.icon}</div>
            <h2 style="color: white; margin: 10px 0; font-size: 28px;">${notification.title}</h2>
            <h3 style="color: white; margin: 10px 0; font-size: 24px; font-weight: bold;">
                ${notification.name}
            </h3>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0; font-size: 16px;">
                ${notification.description}
            </p>
            <div style="margin-top: 20px; font-size: 20px; color: rgba(255,255,255,0.8);">
                +${notification.points} points
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Create particle effect
        if (notification.effects) {
            setTimeout(() => {
                this.createAchievementParticles(notification.effects);
            }, 300);
        }
        
        // Auto-remove with fade
        setTimeout(() => {
            popup.style.animation = 'achievementPop 0.5s ease reverse';
            setTimeout(() => popup.remove(), 500);
        }, notification.effects?.duration || 3000);
    }
    
    createAchievementParticles(effects) {
        const particles = [];
        const colors = effects.colors || [this.config.colors.premium];
        
        for (let i = 0; i < effects.particles; i++) {
            particles.push({
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                y: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
                vx: (Math.random() - 0.5) * 10,
                vy: -Math.random() * 15 - 5,
                emoji: ['⭐', '✨', '🌟'][Math.floor(Math.random() * 3)],
                size: 20 + Math.random() * 20,
                color: colors[Math.floor(Math.random() * colors.length)],
                lifetime: effects.duration || 3000
            });
        }
        
        this.createParticleSystem(particles);
    }
    
    // Notification queue processor for dopamine drip
    startNotificationProcessor() {
        setInterval(() => {
            if (this.notificationQueue.length > 0 && !this.processingNotification) {
                this.processNextNotification();
            }
        }, 100);
    }
    
    showNotification(config) {
        this.notificationQueue.push(config);
    }
    
    processNextNotification() {
        if (this.notificationQueue.length === 0) return;
        
        this.processingNotification = true;
        const config = this.notificationQueue.shift();
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const typeColors = {
            success: this.config.colors.positive,
            error: this.config.colors.negative,
            warning: this.config.colors.energy,
            info: this.config.colors.calm
        };
        
        notification.style.cssText = `
            background: ${typeColors[config.type] || this.config.colors.calm};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            pointer-events: auto;
            cursor: pointer;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">
                ${config.icon || ''} ${config.title}
            </div>
            ${config.body ? `<div style="opacity: 0.9;">${config.body}</div>` : ''}
        `;
        
        this.elements.notificationContainer.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            this.dismissNotification(notification);
        });
        
        // Auto-dismiss
        setTimeout(() => {
            this.dismissNotification(notification);
        }, config.duration || 5000);
        
        // Allow next notification
        setTimeout(() => {
            this.processingNotification = false;
        }, 300);
    }
    
    dismissNotification(notification) {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }
    
    // Modal dialogs with psychological framing
    async showPrestigeConfirmation(config) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'prestige-modal';
            
            // Dark, serious styling for loss aversion
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border: 2px solid ${this.config.colors.negative};
                border-radius: 20px;
                padding: 40px;
                max-width: 500px;
                z-index: ${this.config.layers.critical};
                box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            `;
            
            // Losses section with red emphasis
            const lossesHTML = config.losses.map(loss => `
                <div style="margin: 15px 0; padding: 15px; background: rgba(255,0,0,0.1); 
                           border-left: 4px solid ${this.config.colors.negative};">
                    <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        <span style="font-size: 24px; margin-right: 10px;">${loss.icon}</span>
                        <span style="font-size: 18px; color: ${this.config.colors.negative};">
                            ${loss.label}: ${loss.value}
                        </span>
                    </div>
                    <div style="color: #ff9999; font-size: 14px; font-style: italic;">
                        ${loss.emphasis}
                    </div>
                </div>
            `).join('');
            
            // Gains section (smaller, less emphasized)
            const gainsHTML = config.gains.map(gain => `
                <div style="margin: 10px 0; padding: 10px; background: rgba(0,255,0,0.05);
                           border-left: 2px solid ${this.config.colors.positive};">
                    <span style="font-size: 16px; margin-right: 5px;">${gain.icon}</span>
                    <span style="color: ${this.config.colors.positive};">
                        ${gain.label}: ${gain.value}
                    </span>
                    <span style="color: #90EE90; font-size: 12px; margin-left: 10px;">
                        ${gain.emphasis}
                    </span>
                </div>
            `).join('');
            
            modal.innerHTML = `
                <h2 style="color: ${this.config.colors.negative}; text-align: center; 
                          margin-bottom: 30px; font-size: 32px;">
                    ${config.title}
                </h2>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: ${this.config.colors.negative}; margin-bottom: 15px; font-size: 24px;">
                        You Will LOSE:
                    </h3>
                    ${lossesHTML}
                </div>
                
                <div style="margin-bottom: 30px; opacity: 0.7;">
                    <h4 style="color: ${this.config.colors.positive}; margin-bottom: 10px; font-size: 18px;">
                        You will gain:
                    </h4>
                    ${gainsHTML}
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center;">
                    <button id="keepPlaying" style="
                        padding: 15px 30px;
                        font-size: 20px;
                        background: ${this.config.colors.positive};
                        color: white;
                        border: none;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: bold;
                        transform: scale(1.1);
                    ">Keep Playing</button>
                    
                    <button id="confirmPrestige" style="
                        padding: 10px 20px;
                        font-size: 16px;
                        background: rgba(255,255,255,0.1);
                        color: rgba(255,255,255,0.5);
                        border: 1px solid rgba(255,255,255,0.2);
                        border-radius: 10px;
                        cursor: pointer;
                    ">Yes, Reset Everything</button>
                </div>
            `;
            
            // Show modal with overlay
            this.elements.modalOverlay.style.display = 'block';
            document.body.appendChild(modal);
            
            // Button handlers
            modal.querySelector('#keepPlaying').addEventListener('click', () => {
                this.closeModal(modal);
                resolve(false);
            });
            
            modal.querySelector('#confirmPrestige').addEventListener('click', () => {
                // Make it harder to accidentally prestige
                const btn = modal.querySelector('#confirmPrestige');
                if (!btn.dataset.confirmed) {
                    btn.dataset.confirmed = 'true';
                    btn.textContent = 'Are you REALLY sure?';
                    btn.style.background = this.config.colors.negative;
                    btn.style.color = 'white';
                    btn.style.transform = 'scale(1.05)';
                } else {
                    this.closeModal(modal);
                    resolve(true);
                }
            });
        });
    }
    
    closeModal(modal) {
        modal.remove();
        this.elements.modalOverlay.style.display = 'none';
    }
    
    // Upgrade display with psychological pricing
    showPurchase(upgrade) {
        // Create purchase feedback
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            left: 50%;
            bottom: 100px;
            transform: translateX(-50%) translateY(100px);
            background: ${this.config.colors.success};
            color: white;
            padding: 20px 40px;
            border-radius: 50px;
            font-size: 20px;
            font-weight: bold;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: transform 0.5s ease;
            z-index: ${this.config.layers.notifications};
        `;
        
        feedback.innerHTML = `
            <span style="font-size: 24px; margin-right: 10px;">${upgrade.icon}</span>
            ${upgrade.name} Purchased!
        `;
        
        document.body.appendChild(feedback);
        
        // Slide up
        setTimeout(() => {
            feedback.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        // Fade out
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => feedback.remove(), 500);
        }, 2000);
        
        // Haptic success
        this.triggerHaptic('success');
    }
    
    // Streak display with fire effects
    updateStreakDisplay(data) {
        const display = document.getElementById('streakCount');
        if (!display) return;
        
        display.textContent = data.current;
        
        // Add fire intensity based on streak length
        const intensity = Math.min(data.current / 100, 1);
        display.style.textShadow = `0 0 ${10 + intensity * 20}px rgba(255, 100, 0, ${0.5 + intensity * 0.5})`;
        
        // Milestone effects
        if (data.current % 7 === 0 && data.current > 0) {
            this.createStreakMilestoneEffect(data.current);
        }
    }
    
    createStreakMilestoneEffect(days) {
        // Fire particle burst
        const particles = [];
        const count = 20 + days;
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: window.innerWidth / 2,
                y: 100,
                vx: (Math.random() - 0.5) * 10,
                vy: Math.random() * -10 - 5,
                emoji: '🔥',
                size: 20 + Math.random() * 20,
                color: 'orange',
                lifetime: 1000 + Math.random() * 1000
            });
        }
        
        this.createParticleSystem(particles);
    }
    
    // Helper methods
    pulseElement(element, scale = 1.1) {
        element.style.transition = 'transform 0.1s ease';
        element.style.transform = `scale(${scale})`;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 100);
    }
    
    addGlowEffect(element, type = 'default') {
        const glowColors = {
            default: this.config.colors.positive,
            hover: this.config.colors.energy,
            premium: this.config.colors.premium,
            danger: this.config.colors.negative
        };
        
        element.style.setProperty('--glow-color', glowColors[type]);
        element.style.animation = 'glow 1s ease-in-out infinite';
    }
    
    removeGlowEffect(element) {
        element.style.animation = '';
    }
    
    createRippleEffect(x, y) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: ${this.config.layers.notifications};
        `;
        
        document.body.appendChild(ripple);
        
        // Animate ripple
        ripple.animate([
            { width: '0px', height: '0px', opacity: 1 },
            { width: '100px', height: '100px', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        });
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    triggerHaptic(pattern) {
        if (!window.navigator.vibrate) return;
        
        const patterns = {
            light: this.config.haptics.light,
            medium: this.config.haptics.medium,
            heavy: this.config.haptics.heavy,
            success: this.config.haptics.success,
            error: this.config.haptics.error
        };
        
        window.navigator.vibrate(patterns[pattern] || pattern);
    }
    
    // Progress bars with near-miss mechanics
    updateProgressBars() {
        // Would update all progress bars with psychological tricks
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach(bar => {
            const progress = parseFloat(bar.dataset.progress) || 0;
            const fill = bar.querySelector('.progress-fill');
            
            if (fill) {
                // Near-miss slowdown
                if (progress > 0.9 && progress < 1) {
                    fill.style.transition = 'width 2s cubic-bezier(0.7, 0, 1, 0.5)';
                } else {
                    fill.style.transition = 'width 0.5s ease';
                }
                
                fill.style.width = `${progress * 100}%`;
                
                // Color based on progress
                if (progress > 0.9) {
                    fill.style.background = this.config.colors.energy;
                } else if (progress > 0.7) {
                    fill.style.background = this.config.colors.positive;
                } else {
                    fill.style.background = this.config.colors.calm;
                }
            }
        });
    }
    
    updateMultiplierDisplay() {
        // Would show active multipliers with visual emphasis
        const multipliers = this.game.progression?.multipliers || {};
        let totalMultiplier = 1;
        
        Object.values(multipliers).forEach(mult => {
            if (typeof mult === 'number') {
                totalMultiplier *= mult;
            }
        });
        
        if (totalMultiplier > 1) {
            // Show multiplier indicator
            this.showMultiplierIndicator(totalMultiplier);
        }
    }
    
    showMultiplierIndicator(multiplier) {
        let indicator = document.getElementById('multiplierIndicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'multiplierIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 100px;
                left: 20px;
                background: ${this.config.colors.premium};
                color: black;
                padding: 10px 20px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 18px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: ${this.config.layers.ui};
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = `${multiplier.toFixed(1)}x Multiplier!`;
        
        // Pulse on change
        this.pulseElement(indicator, 1.2);
    }
    
    // Event-specific UI
    showEventAnnouncement(announcement) {
        const modal = document.createElement('div');
        modal.className = 'event-announcement';
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: ${this.config.layers.critical};
            animation: fadeIn 0.5s ease;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 3px solid ${this.config.colors.premium};
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 600px;
            animation: eventBounce 0.5s ease;
        `;
        
        content.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">${announcement.icon}</div>
            <h1 style="color: ${this.config.colors.premium}; font-size: 36px; margin-bottom: 10px;">
                ${announcement.title}
            </h1>
            <p style="color: white; font-size: 20px; margin-bottom: 20px;">
                ${announcement.subtitle}
            </p>
            <div style="color: ${this.config.colors.energy}; font-size: 24px; margin-bottom: 30px;">
                ${announcement.cta}
            </div>
            ${announcement.socialProof ? `
                <div style="color: rgba(255,255,255,0.7); font-size: 16px; margin-bottom: 20px;">
                    ${announcement.socialProof.message}
                </div>
            ` : ''}
            <button id="joinEvent" style="
                background: ${this.config.colors.premium};
                color: black;
                border: none;
                padding: 15px 40px;
                font-size: 24px;
                font-weight: bold;
                border-radius: 10px;
                cursor: pointer;
                animation: pulse 1s ease-in-out infinite;
            ">JOIN NOW!</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Particles
        this.createEventParticles();
        
        // Auto-close after delay or click
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => modal.remove(), 500);
        };
        
        content.querySelector('#joinEvent').addEventListener('click', closeModal);
        setTimeout(closeModal, 5000);
        
        // Add CSS animations
        this.addEventAnimations();
    }
    
    createEventParticles() {
        const particles = [];
        const emojis = ['🎉', '🎊', '✨', '⭐'];
        
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 5 - 2,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                size: 20 + Math.random() * 30,
                lifetime: 5000 + Math.random() * 5000
            });
        }
        
        this.createParticleSystem(particles);
    }
    
    addEventAnimations() {
        if (document.getElementById('eventAnimations')) return;
        
        const style = document.createElement('style');
        style.id = 'eventAnimations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes eventBounce {
                0% { transform: scale(0.8) translateY(50px); opacity: 0; }
                50% { transform: scale(1.1) translateY(-20px); }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255,215,0,0.5); }
                50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(255,215,0,0.8); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Social proof displays
    updateSocialFeed(items) {
        let feed = document.getElementById('socialFeed');
        
        if (!feed) {
            feed = document.createElement('div');
            feed.id = 'socialFeed';
            feed.style.cssText = `
                position: fixed;
                left: 20px;
                bottom: 100px;
                width: 300px;
                max-height: 200px;
                overflow-y: auto;
                background: rgba(0,0,0,0.8);
                border-radius: 10px;
                padding: 10px;
                z-index: ${this.config.layers.ui};
            `;
            document.body.appendChild(feed);
        }
        
        // Update feed content
        feed.innerHTML = items.map(item => `
            <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.05); 
                       border-radius: 5px; font-size: 12px; color: rgba(255,255,255,0.8);">
                <strong style="color: ${this.config.colors.energy};">${item.player.name}</strong>
                ${item.message}
                <span style="color: rgba(255,255,255,0.5); font-size: 10px; float: right;">
                    ${this.getTimeAgo(item.timestamp)}
                </span>
            </div>
        `).join('');
    }
    
    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }
    
    updateActivePlayerCount(count) {
        let counter = document.getElementById('activePlayersCounter');
        
        if (!counter) {
            counter = document.createElement('div');
            counter.id = 'activePlayersCounter';
            counter.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: ${this.config.colors.positive};
                padding: 5px 20px;
                border-radius: 20px;
                font-size: 14px;
                z-index: ${this.config.layers.ui};
            `;
            document.body.appendChild(counter);
        }
        
        counter.innerHTML = `
            <span style="color: ${this.config.colors.energy};">●</span> 
            ${this.formatNumber(count)} players online
        `;
    }
    
    // Premium/IAP UI
    showIAPOffer(offer) {
        const modal = document.createElement('div');
        modal.className = 'iap-offer';
        
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${this.config.colors.premium};
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            z-index: ${this.config.layers.critical};
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        `;
        
        // Create package displays with anchoring
        const packagesHTML = offer.packages.map((pkg, index) => {
            const isPopular = index === 1; // Second package is "most popular"
            
            return `
                <div style="
                    margin: 10px 0;
                    padding: 15px;
                    background: ${isPopular ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
                    border: 2px solid ${isPopular ? 'white' : 'transparent'};
                    border-radius: 10px;
                    cursor: pointer;
                    position: relative;
                    ${isPopular ? 'transform: scale(1.05);' : ''}
                " class="package-option" data-id="${pkg.id}">
                    ${isPopular ? `
                        <div style="
                            position: absolute;
                            top: -10px;
                            right: 10px;
                            background: white;
                            color: ${this.config.colors.premium};
                            padding: 5px 10px;
                            border-radius: 10px;
                            font-size: 12px;
                            font-weight: bold;
                        ">BEST VALUE!</div>
                    ` : ''}
                    ${pkg.originalPrice ? `
                        <div style="
                            position: absolute;
                            top: 10px;
                            left: 10px;
                            background: ${this.config.colors.negative};
                            color: white;
                            padding: 5px 10px;
                            border-radius: 5px;
                            font-size: 12px;
                            font-weight: bold;
                        ">${Math.round((1 - pkg.salePrice / pkg.originalPrice) * 100)}% OFF!</div>
                    ` : ''}
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: ${pkg.originalPrice ? '30px' : '0'};
                    ">
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: black;">
                                ${this.formatNumber(pkg.value)} 💎
                            </div>
                            ${pkg.bonus ? `
                                <div style="color: rgba(0,0,0,0.7); font-size: 14px;">
                                    +${pkg.bonus}% bonus!
                                </div>
                            ` : ''}
                        </div>
                        <div style="text-align: right;">
                            ${pkg.originalPrice ? `
                                <div style="
                                    text-decoration: line-through;
                                    color: rgba(0,0,0,0.5);
                                    font-size: 14px;
                                ">$${pkg.originalPrice}</div>
                            ` : ''}
                            <div style="
                                font-size: 28px;
                                font-weight: bold;
                                color: ${pkg.originalPrice ? this.config.colors.negative : 'black'};
                            ">$${pkg.salePrice || pkg.price}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        modal.innerHTML = `
            <button style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                color: black;
                font-size: 24px;
                cursor: pointer;
                opacity: 0.5;
            " id="closeOffer">×</button>
            
            <h2 style="text-align: center; color: black; margin-bottom: 20px;">
                ${offer.title}
            </h2>
            
            ${offer.urgency ? `
                <div style="
                    background: ${this.config.colors.negative};
                    color: white;
                    padding: 10px;
                    border-radius: 10px;
                    text-align: center;
                    margin-bottom: 20px;
                    font-weight: bold;
                ">⏰ LIMITED TIME OFFER!</div>
            ` : ''}
            
            ${packagesHTML}
        `;
        
        // Show with overlay
        this.elements.modalOverlay.style.display = 'block';
        document.body.appendChild(modal);
        
        // Package selection
        modal.querySelectorAll('.package-option').forEach(option => {
            option.addEventListener('click', () => {
                const packageId = option.dataset.id;
                // Would trigger actual purchase flow
                this.closeModal(modal);
                this.game.shop.processPurchase(packageId);
            });
        });
        
        // Close button
        modal.querySelector('#closeOffer').addEventListener('click', () => {
            this.closeModal(modal);
        });
    }
    
    // Error and feedback displays
    showError(message) {
        this.showNotification({
            title: 'Error',
            body: message,
            type: 'error',
            icon: '❌',
            duration: 3000
        });
        
        this.triggerHaptic('error');
    }
    
    showSuccess(message) {
        this.showNotification({
            title: 'Success!',
            body: message,
            type: 'success',
            icon: '✅',
            duration: 3000
        });
        
        this.triggerHaptic('success');
    }
    
    showMessage(message, type = 'info') {
        this.showNotification({
            body: message,
            type: type,
            duration: 3000
        });
    }
    
    // Special effects and themes
    enableGoldenGlow(duration) {
        document.body.style.filter = 'sepia(0.3) brightness(1.2)';
        
        setTimeout(() => {
            document.body.style.filter = '';
        }, duration);
    }
    
    setCosmicBackground(enabled) {
        if (enabled) {
            document.body.style.background = this.config.colors.cosmic;
            this.effects.activeThemes.add('cosmic');
        } else {
            document.body.style.background = '';
            this.effects.activeThemes.delete('cosmic');
        }
    }
    
    enableRainbowMode() {
        const style = document.createElement('style');
        style.id = 'rainbowMode';
        style.textContent = `
            * {
                animation: rainbow 5s linear infinite !important;
            }
            
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        this.effects.activeThemes.add('rainbow');
    }
}

export default UIManager;