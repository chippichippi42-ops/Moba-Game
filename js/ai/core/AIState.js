/**
 * ========================================
 * AI State Machine
 * ========================================
 * Manages AI state transitions and behavior
 */

class AIState {
    constructor(controller, difficulty) {
        this.controller = controller;
        this.difficulty = difficulty;
        this.currentState = 'laning';
        this.previousState = null;
        this.stateStartTime = 0;
        this.stateHistory = [];

        // State transition rules
        this.transitionRules = this.setupTransitionRules();

        // Hysteresis settings
        this.minStateDuration = 1000; // ms
        this.retreatToLaningCooldown = 2500; // ms
    }
    
    setupTransitionRules() {
        return {
            'laning': {
                canTransitionTo: ['fighting', 'retreating', 'pushing', 'dodging', 'jungling'],
                transitionConditions: {
                    'fighting': (situation) => situation.enemyHeroes.length > 0 && situation.hasAdvantage,
                    'retreating': (situation) => situation.shouldRetreat,
                    'pushing': (situation) => situation.nearbyEnemyTower && situation.myMinions.length >= 4,
                    'dodging': (situation) => situation.incomingProjectiles.length > 0,
                    'jungling': (situation) => situation.nearbyJungleCamps.length > 0 && situation.enemyHeroes.length === 0
                }
            },
            'fighting': {
                canTransitionTo: ['laning', 'retreating', 'dodging'],
                transitionConditions: {
                    'laning': (situation) => situation.enemyHeroes.length === 0,
                    'retreating': (situation) => situation.shouldRetreat,
                    'dodging': (situation) => situation.incomingProjectiles.length > 0
                }
            },
            'retreating': {
                canTransitionTo: ['laning', 'fighting'],
                transitionConditions: {
                    'laning': (situation) => situation.healthPercent > 0.6 && situation.enemyHeroes.length === 0,
                    'fighting': (situation) => situation.canKill && situation.healthPercent > 0.4
                }
            },
            'pushing': {
                canTransitionTo: ['laning', 'fighting', 'retreating'],
                transitionConditions: {
                    'laning': (situation) => situation.myMinions.length < 2,
                    'fighting': (situation) => situation.enemyHeroes.length > 0,
                    'retreating': (situation) => situation.shouldRetreat
                }
            },
            'dodging': {
                canTransitionTo: ['laning', 'fighting', 'retreating'],
                transitionConditions: {
                    'laning': (situation) => situation.incomingProjectiles.length === 0 && situation.enemyHeroes.length === 0,
                    'fighting': (situation) => situation.enemyHeroes.length > 0,
                    'retreating': (situation) => situation.shouldRetreat
                }
            },
            'jungling': {
                canTransitionTo: ['laning', 'fighting', 'retreating'],
                transitionConditions: {
                    'laning': (situation) => situation.nearbyJungleCamps.length === 0 || situation.enemyHeroes.length > 0,
                    'fighting': (situation) => situation.enemyHeroes.length > 0,
                    'retreating': (situation) => situation.shouldRetreat
                }
            }
        };
    }
    
    setState(newState) {
        if (newState === this.currentState) return false;

        // Check hysteresis before transition
        if (!this.canTransitionState(newState, this.currentState)) {
            return false;
        }

        // Check if transition is allowed
        const currentRules = this.transitionRules[this.currentState];
        if (currentRules && currentRules.canTransitionTo.includes(newState)) {
            this.previousState = this.currentState;
            this.currentState = newState;
            this.stateStartTime = Date.now();

            // Add to history
            this.stateHistory.push({
                from: this.previousState,
                to: newState,
                time: this.stateStartTime
            });

            // Limit history size
            if (this.stateHistory.length > 20) {
                this.stateHistory.shift();
            }

            return true;
        }

        return false;
    }

    canTransitionState(newState, currentState) {
        const now = Date.now();
        const stateDuration = now - this.stateStartTime;

        // Don't transition too fast (minimum duration)
        if (stateDuration < this.minStateDuration) {
            return false;
        }

        // Special cooldown: retreating -> laning needs 2.5s
        if (currentState === 'retreating' && newState === 'laning') {
            if (stateDuration < this.retreatToLaningCooldown) {
                return false;
            }
        }

        // Fighting states should be more stable
        if (currentState === 'fighting' && newState !== 'retreating' && newState !== 'dodging') {
            if (stateDuration < 2000) {
                return false;
            }
        }

        return true;
    }
    
    getCurrentState() {
        return this.currentState;
    }
    
    getStateDuration() {
        return Date.now() - this.stateStartTime;
    }
    
    update(deltaTime, entities) {
        const situation = this.controller.decisionMaker.analyzeSituation(entities);
        
        // Check for state transitions
        const currentRules = this.transitionRules[this.currentState];
        if (currentRules) {
            for (const [targetState, condition] of Object.entries(currentRules.transitionConditions)) {
                if (condition(situation)) {
                    this.setState(targetState);
                    break;
                }
            }
        }
    }
    
    getStateHistory() {
        return this.stateHistory;
    }
    
    getPreviousState() {
        return this.previousState;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIState;
}