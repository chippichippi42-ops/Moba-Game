/**
 * ========================================
 * AI Controller - Core Orchestrator
 * ========================================
 * Manages all AI behaviors and systems
 */

class AIController {
    constructor(hero, difficulty, systems) {
        this.hero = hero;
        this.difficulty = difficulty;
        this.difficultySettings = CONFIG.aiDifficulty[difficulty];
        this.systems = systems;
        
        // State management
        this.stateMachine = new AIState(this, difficulty);
        this.decisionMaker = new DecisionMaker(this, difficulty);
        
        // Advanced AI Systems
        this.advancedEvaluator = systems.advancedEvaluator;
        this.ollamaIntegrator = systems.ollamaIntegrator;
        this.smartDecisionCache = systems.smartDecisionCache;
        this.promptBuilder = systems.promptBuilder;
        this.responseFusion = systems.responseFusion;
        
        // Behavior systems
        this.laneBehavior = new LaneBehavior(this);
        this.combatBehavior = new CombatBehavior(this);
        this.retreatBehavior = new RetreatBehavior(this);
        this.pushBehavior = new PushBehavior(this);
        this.dodgeBehavior = new DodgeBehavior(this);
        this.jungleBehavior = new JungleBehavior(this);
        
        // Intelligence systems
        this.strategicAnalyzer = new StrategicAnalyzer(this);
        this.combatAnalyzer = new CombatAnalyzer(this);
        this.movementOptimizer = new MovementOptimizer(this);
        this.llmDecisionEngine = new LLMDecisionEngine(this);
        
        // Initialize
        this.initialize();
    }
    
    initialize() {
        // Set initial state
        this.stateMachine.setState('laning');
        
        // Initialize behaviors
        this.laneBehavior.initialize();
        this.combatBehavior.initialize();
        this.retreatBehavior.initialize();
        this.pushBehavior.initialize();
        this.dodgeBehavior.initialize();
        this.jungleBehavior.initialize();
        
        // Initialize intelligence systems
        this.strategicAnalyzer.initialize();
        this.combatAnalyzer.initialize();
        this.movementOptimizer.initialize();
        this.llmDecisionEngine.initialize();
    }
    
    update(deltaTime, entities) {
        if (!this.hero) return;
        if (!this.hero.isAlive || this.hero.isDead) return;

        // Update state machine
        this.stateMachine?.update?.(deltaTime, entities);

        // Update intelligence systems
        this.strategicAnalyzer?.update?.(deltaTime, entities);
        this.combatAnalyzer?.update?.(deltaTime, entities);
        this.movementOptimizer?.update?.(deltaTime);
        this.llmDecisionEngine?.update?.(deltaTime, entities);

        // Advanced 10-Layer Smart Evaluation
        const heroState = this.hero.getState?.() || this.createDefaultHeroState();
        const gameState = this.getGameState();
        const teamState = this.getTeamState();

        const evaluation = this.advancedEvaluator?.analyze?.(
            heroState,
            gameState,
            teamState
        ) || { mode: 'LOCAL', score: 50 };

        let decision;
        switch (evaluation.mode) {
            case 'EXTREME_URGENT':
                // Local decision only
                decision = this.decisionMaker.makeDecision(deltaTime, entities, 'aggressive');
                break;

            case 'URGENT':
                // Try cache, else fallback + async
                const cached = this.smartDecisionCache?.getCached?.(this.hero.id);
                if (cached && this.smartDecisionCache?.canUseCached?.(evaluation, cached)) {
                    decision = cached.decision;
                } else {
                    // Queue async + fallback
                    this.ollamaIntegrator?.queryOllama?.(
                        this.promptBuilder?.buildDecisionPrompt?.(heroState, gameState, teamState, evaluation)
                    ).then(response => {
                        const localDec = this.decisionMaker.makeDecision(deltaTime, entities, 'balanced');
                        const fused = this.responseFusion?.merge?.(
                            response,
                            localDec,
                            evaluation
                        );
                        this.smartDecisionCache?.updateCache?.(this.hero.id, fused, evaluation);
                    });
                    decision = this.decisionMaker.makeDecision(deltaTime, entities, 'balanced');
                }
                break;

            case 'PLANNING':
                // Queue async, use local
                this.ollamaIntegrator?.queryOllama?.(
                    this.promptBuilder?.buildStrategyPrompt?.(heroState, gameState, evaluation)
                ).then(response => {
                    // Cache for next time (simple integration)
                    const localDec = this.decisionMaker.makeDecision(deltaTime, entities, 'balanced');
                    const fused = this.responseFusion?.merge?.(response, localDec, evaluation);
                    this.smartDecisionCache?.updateCache?.(this.hero.id, fused, evaluation);
                });
                decision = this.decisionMaker.makeDecision(deltaTime, entities, 'balanced');
                break;

            case 'LOCAL':
            default:
                // Local only
                decision = this.decisionMaker.makeDecision(deltaTime, entities, 'passive');
        }

        this.executeDecision(decision);

        // Execute current behavior based on state
        this.executeCurrentBehavior(deltaTime, entities);

        // Update movement
        this.updateMovement(deltaTime);
    }

    /**
     * Create a default hero state as fallback
     */
    createDefaultHeroState() {
        return {
            id: this.hero?.id || 'unknown',
            name: this.hero?.name || 'Unknown',
            team: this.hero?.team || 0,
            isAlive: this.hero?.isAlive || true,
            isDead: this.hero?.isDead || false,
            health: this.hero?.health || 100,
            maxHealth: 100,
            healthPercent: 1.0,
            mana: this.hero?.mana || 100,
            maxMana: 100,
            manaPercent: 1.0,
            level: this.hero?.level || 1,
            x: this.hero?.x || 0,
            y: this.hero?.y || 0,
            stats: this.hero?.stats || {},
            abilities: {},
            abilityLevels: { q: 0, e: 0, r: 0, t: 0 },
            abilityCooldowns: { q: 0, e: 0, r: 0, t: 0 },
            hasEscapeRoute: true,
            isCCVulnerable: false,
            importantItemsOnCooldown: false,
            inCombat: false,
            hasBuff: false,
            hasManaForCombo: true,
            skillsReadySoon: false,
            timeSinceBase: 0,
            killStreak: 0,
            deathStreak: 0,
            deathProbability: 0,
        };
    }
    
    executeCurrentBehavior(deltaTime, entities) {
        const currentState = this.stateMachine.getCurrentState();
        
        switch (currentState) {
            case 'laning':
                this.laneBehavior.execute(deltaTime, entities);
                break;
            case 'fighting':
                this.combatBehavior.execute(deltaTime, entities);
                break;
            case 'retreating':
                this.retreatBehavior.execute(deltaTime, entities);
                break;
            case 'pushing':
                this.pushBehavior.execute(deltaTime, entities);
                break;
            case 'dodging':
                this.dodgeBehavior.execute(deltaTime, entities);
                break;
            case 'jungling':
                this.jungleBehavior.execute(deltaTime, entities);
                break;
            default:
                this.laneBehavior.execute(deltaTime, entities);
                break;
        }
    }

    executeDecision(decision) {
        if (!decision) return;

        // Map decision actions to states
        switch (decision.action) {
            case 'ALL_IN':
            case 'ATTACK':
            case 'HARASS':
                this.stateMachine.setState('fighting');
                break;
            case 'RETREAT':
            case 'BACK':
                this.stateMachine.setState('retreating');
                break;
            case 'PUSH_OBJECTIVE':
            case 'FARM':
                this.stateMachine.setState('pushing');
                break;
            case 'DODGE':
                this.stateMachine.setState('dodging');
                break;
            default:
                // Keep current state or default to laning
                break;
        }
    }
    
    updateMovement(deltaTime) {
        this.movementOptimizer.updateMovement(deltaTime);
    }

    getGameState() {
        const hero = this.hero;
        if (!hero) {
            return this.createDefaultGameState();
        }

        const nearbyEnemies = Combat?.getEnemiesInRange?.(hero, 1000) || [];
        const nearbyAllies = Combat?.getAlliesInRange?.(hero, 1000) || [];

        return {
            nearbyEnemies: nearbyEnemies.map(e => ({
                id: e.id,
                distance: Utils.distance(hero.x, hero.y, e.x, e.y),
                attackDamage: e.stats ? e.stats.attackDamage : 50,
                hasCC: true, // Simplified
                onHighGround: false // Simplified
            })),
            nearbyAllies: nearbyAllies.map(a => ({
                id: a.id,
                healthPercent: a.stats?.maxHealth > 0
                    ? (a.health / a.stats.maxHealth) * 100
                    : 100
            })),
            blueScore: typeof GameManager !== 'undefined' ? GameManager.blueScore : 0,
            redScore: typeof GameManager !== 'undefined' ? GameManager.redScore : 0,
            towerUnderAttackNearby: false, // Simplified
            objectiveThreat: false, // Simplified
            minionWavePushedIn: false, // Simplified
            waveFrozen: false, // Simplified
            inUnvardedArea: false, // Simplified
            teamFightActive: nearbyEnemies.length >= 3 && nearbyAllies.length >= 2,
            teammateCritical: nearbyAllies.some(a => a.stats?.maxHealth > 0 && a.health / a.stats.maxHealth < 0.25),
            enemyMissingDuration: 0, // Simplified
            goodRotationWindow: true, // Simplified
            wavePushing: false, // Simplified
            teamMomentum: 0, // Simplified
            goldDifferential: 0, // Simplified
            incomingCCChain: false, // Simplified
            predictedEnemyGank: false, // Simplified
            objectiveContestedSoon: false, // Simplified
            deathProbability: 0, // Simplified
            killOpportunity: false, // Simplified
            nearObjective: false // Simplified
        };
    }

    /**
     * Create a default game state as fallback
     */
    createDefaultGameState() {
        return {
            nearbyEnemies: [],
            nearbyAllies: [],
            blueScore: 0,
            redScore: 0,
            towerUnderAttackNearby: false,
            objectiveThreat: false,
            minionWavePushedIn: false,
            waveFrozen: false,
            inUnvardedArea: false,
            teamFightActive: false,
            teammateCritical: false,
            enemyMissingDuration: 0,
            goodRotationWindow: true,
            wavePushing: false,
            teamMomentum: 0,
            goldDifferential: 0,
            incomingCCChain: false,
            predictedEnemyGank: false,
            objectiveContestedSoon: false,
            deathProbability: 0,
            killOpportunity: false,
            nearObjective: false,
        };
    }

    getTeamState() {
        if (!this.hero) {
            return { averageHP: 0 };
        }

        const team = this.hero.team;
        let totalHP = 0;
        let count = 0;

        if (typeof HeroManager !== 'undefined' && HeroManager.heroes) {
            for (const h of HeroManager.heroes) {
                if (h.team === team && h.isAlive && h.stats?.maxHealth > 0) {
                    totalHP += (h.health / h.stats.maxHealth) * 100;
                    count++;
                }
            }
        }

        return {
            averageHP: count > 0 ? totalHP / count : 0
        };
    }
    
    // Get current difficulty settings
    getDifficultySetting(key) {
        return this.difficultySettings[key];
    }
    
    // Get AI parameter
    getAIParameter(key) {
        return CONFIG.aiParameters[key][this.difficulty] || CONFIG.aiParameters[key].normal;
    }
    
    // Get movement settings
    getMovementSetting(key) {
        return CONFIG.aiMovement[key];
    }
    
    // Get dodge settings
    getDodgeSetting(key) {
        return CONFIG.aiDodge[key];
    }
    
    // Get combo settings
    getComboSetting(key) {
        return CONFIG.aiCombo[key];
    }
    
    // Get targeting settings
    getTargetingSetting(key) {
        return CONFIG.aiTargeting[key];
    }
    
    // Get vision settings
    getVisionSetting(key) {
        return CONFIG.aiVision[key];
    }
    
    // Get farming settings
    getFarmingSetting(key) {
        return CONFIG.aiFarming[key];
    }
    
    // Get roaming settings
    getRoamingSetting(key) {
        return CONFIG.aiRoaming[key];
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIController;
}