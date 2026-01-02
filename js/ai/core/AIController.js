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
        
        // Tactical Systems
        this.visionSystem = systems.visionSystem;
        this.pathFinding = systems.pathFinding;
        this.dodgeSystem = systems.dodgeSystem;
        this.comboExecutor = systems.comboExecutor;
        this.targetSelector = systems.targetSelector;

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

        // Initialize tactical systems
        if (this.visionSystem) this.visionSystem.initialize();
        if (this.pathFinding) this.pathFinding.initialize();
        if (this.dodgeSystem) this.dodgeSystem.initialize();
        if (this.comboExecutor) this.comboExecutor.initialize();
        if (this.targetSelector) this.targetSelector.initialize();

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
        if (!this.hero.isAlive || this.hero.isDead) return;

        // Update state machine
        this.stateMachine.update(deltaTime, entities);

        // Update tactical systems
        if (this.visionSystem) this.visionSystem.update(deltaTime, entities);
        if (this.pathFinding) this.pathFinding.update(deltaTime);
        if (this.dodgeSystem) this.dodgeSystem.update(deltaTime);
        if (this.comboExecutor) this.comboExecutor.update(deltaTime);

        // Update intelligence systems
        this.strategicAnalyzer.update(deltaTime, entities);
        this.combatAnalyzer.update(deltaTime, entities);
        this.movementOptimizer.update(deltaTime);
        this.llmDecisionEngine.update(deltaTime, entities);

        // Advanced 10-Layer Smart Evaluation
        const heroState = this.hero.getState();
        const gameState = this.getGameState();
        const teamState = this.getTeamState();

        const evaluation = this.advancedEvaluator.analyze(
            heroState,
            gameState,
            teamState
        );

        let decision;
        switch (evaluation.mode) {
            case 'EXTREME_URGENT':
                // Local decision only
                decision = this.decisionMaker.makeDecision(deltaTime, entities, 'aggressive');
                break;
            
            case 'URGENT':
                // Try cache, else fallback + async
                const cached = this.smartDecisionCache.getCached(this.hero.id);
                if (cached && this.smartDecisionCache.canUseCached(evaluation, cached)) {
                    decision = cached.decision;
                } else {
                    // Only queue async if Ollama is available
                    if (this.ollamaIntegrator.isAvailable) {
                        this.ollamaIntegrator.queryOllama(
                            this.promptBuilder.buildDecisionPrompt(heroState, gameState, teamState, evaluation)
                        ).then(response => {
                            const localDec = this.decisionMaker.makeDecision(deltaTime, entities, 'balanced');
                            const fused = this.responseFusion.merge(
                                response,
                                localDec,
                                evaluation
                            );
                            this.smartDecisionCache.updateCache(this.hero.id, fused, evaluation);
                        });
                    }
                    decision = this.decisionMaker.makeDecision(deltaTime, entities, 'balanced');
                }
                break;
            
            case 'PLANNING':
                // Queue async if Ollama is available, use local
                if (this.ollamaIntegrator.isAvailable) {
                    this.ollamaIntegrator.queryOllama(
                        this.promptBuilder.buildStrategyPrompt(heroState, gameState, evaluation)
                    ).then(response => {
                        // Cache for next time (simple integration)
                        const localDec = this.decisionMaker.makeDecision(deltaTime, entities, 'balanced');
                        const fused = this.responseFusion.merge(response, localDec, evaluation);
                        this.smartDecisionCache.updateCache(this.hero.id, fused, evaluation);
                    });
                }
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

        if (typeof Combat === 'undefined') {
            return {
                nearbyEnemies: [],
                nearbyAllies: [],
                blueScore: 0,
                redScore: 0,
                towerUnderAttackNearby: false,
                objectiveThreat: false,
                minionWavePushedIn: false,
                waveFrozen: false,
                wavePushing: false,
                inUnvardedArea: false,
                teamFightActive: false,
                teammateCritical: false,
                enemyMissingDuration: 0,
                goodRotationWindow: true,
                teamMomentum: 0,
                goldDifferential: 0,
                incomingCCChain: false,
                predictedEnemyGank: false,
                objectiveContestedSoon: false,
                deathProbability: 0,
                killOpportunity: false,
                nearObjective: false,
                hasEscapeRoute: true
            };
        }

        const nearbyEnemies = Combat.getEnemiesInRange(hero, 1000) || [];
        const nearbyAllies = Combat.getAlliesInRange(hero, 1000) || [];
        
        // Helper to safely get max health
        const getMaxHealth = (entity) => {
            return entity.stats?.maxHealth || entity.health || 100;
        };
        
        // Calculate tower under attack
        const towerUnderAttack = this.checkTowerUnderAttack();
        
        // Calculate objective threat
        const objectiveThreat = this.checkObjectiveThreat();
        
        // Calculate minion wave states
        const minionWaveState = this.analyzeMinionWaves();
        
        // Calculate vision state
        const inUnvarded = this.checkVisionState();
        
        // Calculate enemy missing duration
        const enemyMissingDuration = this.calculateEnemyMissingDuration();
        
        // Calculate team momentum
        const teamMomentum = this.calculateTeamMomentum();
        
        // Calculate gold differential
        const goldDiff = this.calculateGoldDifferential();
        
        // Predict enemy CC chain
        const ccChain = this.predictCCChain(nearbyEnemies);
        
        // Predict enemy gank
        const gankPrediction = this.predictEnemyGank();
        
        // Calculate death probability
        const deathProb = this.calculateDeathProbability(nearbyEnemies);
        
        // Check kill opportunity
        const killOpp = this.checkKillOpportunity(nearbyEnemies);
        
        // Check near objective
        const nearObj = this.checkNearObjective();
        
        // Calculate escape route availability
        const hasEscape = this.calculateEscapeRoute(nearbyEnemies, nearbyAllies);
        
        return {
            nearbyEnemies: nearbyEnemies.map(e => ({
                id: e.id,
                distance: Utils.distance(hero.x, hero.y, e.x, e.y),
                attackDamage: e.stats?.attackDamage || 50,
                hasCC: this.checkHasCC(e),
                onHighGround: this.checkHighGround(e)
            })),
            nearbyAllies: nearbyAllies.map(a => {
                const maxHealth = getMaxHealth(a);
                return {
                    id: a.id,
                    healthPercent: ((a.health || 0) / maxHealth) * 100
                };
            }),
            blueScore: typeof Game !== 'undefined' && Game.blueScore ? Game.blueScore : 0,
            redScore: typeof Game !== 'undefined' && Game.redScore ? Game.redScore : 0,
            towerUnderAttackNearby: towerUnderAttack,
            objectiveThreat: objectiveThreat,
            minionWavePushedIn: minionWaveState.pushed,
            waveFrozen: minionWaveState.frozen,
            wavePushing: minionWaveState.pushing,
            inUnvardedArea: inUnvarded,
            teamFightActive: nearbyEnemies.length >= 3 && nearbyAllies.length >= 2,
            teammateCritical: nearbyAllies.some(a => {
                const maxHealth = getMaxHealth(a);
                return (a.health || 0) / maxHealth < 0.25;
            }),
            enemyMissingDuration: enemyMissingDuration,
            goodRotationWindow: minionWaveState.goodRotation,
            teamMomentum: teamMomentum,
            goldDifferential: goldDiff,
            incomingCCChain: ccChain,
            predictedEnemyGank: gankPrediction,
            objectiveContestedSoon: objectiveThreat && nearbyEnemies.length > 0,
            deathProbability: deathProb,
            killOpportunity: killOpp,
            nearObjective: nearObj,
            hasEscapeRoute: hasEscape
        };
    }

    getTeamState() {
        const team = this.hero.team;
        let totalHP = 0;
        let count = 0;

        if (typeof HeroManager !== 'undefined' && HeroManager.heroes) {
            for (const h of HeroManager.heroes) {
                if (h.team === team && h.isAlive) {
                    const maxHealth = h.stats?.maxHealth || h.health || 100;
                    totalHP += ((h.health || 0) / maxHealth) * 100;
                    count++;
                }
            }
        }

        return {
            averageHP: count > 0 ? totalHP / count : 0
        };
    }
    
    checkTowerUnderAttack() {
        if (typeof TowerManager === 'undefined' || !TowerManager.towers) return false;
        
        const hero = this.hero;
        const checkRange = 1500;
        
        for (const tower of TowerManager.towers) {
            if (tower.team === hero.team && tower.isAlive) {
                const dist = Utils.distance(hero.x, hero.y, tower.x, tower.y);
                if (dist < checkRange) {
                    const maxHealth = tower.maxHealth || 5000;
                    if (tower.health < maxHealth * 0.9) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    checkObjectiveThreat() {
        if (typeof CreatureManager === 'undefined' || !CreatureManager.creatures) return false;
        
        const hero = this.hero;
        const checkRange = 2000;
        const objectiveTypes = ['ancient_titan', 'void_herald'];
        
        for (const creature of CreatureManager.creatures) {
            if (objectiveTypes.includes(creature.type) && creature.isAlive) {
                const dist = Utils.distance(hero.x, hero.y, creature.x, creature.y);
                if (dist < checkRange) {
                    const enemyTeam = hero.team === 'blue' ? 'red' : 'blue';
                    const enemiesNearby = Combat.getEnemiesInRange(creature, 1000);
                    if (enemiesNearby.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    analyzeMinionWaves() {
        if (typeof MinionManager === 'undefined' || !MinionManager.minions) {
            return { pushed: false, frozen: false, pushing: false, goodRotation: true };
        }
        
        const hero = this.hero;
        const checkRange = 1500;
        const enemyTeam = hero.team === 'blue' ? 'red' : 'blue';
        
        let allyMinions = 0;
        let enemyMinions = 0;
        let allyMinionPosSum = { x: 0, y: 0 };
        let enemyMinionPosSum = { x: 0, y: 0 };
        
        for (const minion of MinionManager.minions) {
            if (!minion.isAlive) continue;
            
            const dist = Utils.distance(hero.x, hero.y, minion.x, minion.y);
            if (dist < checkRange) {
                if (minion.team === hero.team) {
                    allyMinions++;
                    allyMinionPosSum.x += minion.x;
                    allyMinionPosSum.y += minion.y;
                } else {
                    enemyMinions++;
                    enemyMinionPosSum.x += minion.x;
                    enemyMinionPosSum.y += minion.y;
                }
            }
        }
        
        const pushed = allyMinions > enemyMinions + 3;
        const frozen = Math.abs(allyMinions - enemyMinions) <= 2 && allyMinions > 0;
        const pushing = allyMinions > enemyMinions && allyMinions > 0;
        const goodRotation = allyMinions >= 3 || enemyMinions === 0;
        
        return { pushed, frozen, pushing, goodRotation };
    }
    
    checkVisionState() {
        if (typeof BrushManager === 'undefined' || !BrushManager.brushes) return false;
        
        const hero = this.hero;
        for (const brush of BrushManager.brushes) {
            if (Utils.pointInRect(hero.x, hero.y, brush.x, brush.y, brush.width, brush.height)) {
                const enemiesNearby = Combat.getEnemiesInRange(hero, 800);
                if (enemiesNearby.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    calculateEnemyMissingDuration() {
        if (typeof HeroManager === 'undefined' || !HeroManager.heroes) return 0;
        
        const hero = this.hero;
        const enemyTeam = hero.team === 'blue' ? 'red' : 'blue';
        const visionRange = 1500;
        
        let maxMissingTime = 0;
        for (const enemy of HeroManager.heroes) {
            if (enemy.team === enemyTeam && enemy.isAlive) {
                const dist = Utils.distance(hero.x, hero.y, enemy.x, enemy.y);
                if (dist > visionRange) {
                    maxMissingTime = Math.max(maxMissingTime, 10);
                }
            }
        }
        return maxMissingTime;
    }
    
    calculateTeamMomentum() {
        if (typeof HeroManager === 'undefined' || !HeroManager.heroes) return 0;
        
        const hero = this.hero;
        let teamKills = 0;
        let teamDeaths = 0;
        let enemyKills = 0;
        let enemyDeaths = 0;
        
        for (const h of HeroManager.heroes) {
            if (h.team === hero.team) {
                teamKills += h.kills || 0;
                teamDeaths += h.deaths || 0;
            } else {
                enemyKills += h.kills || 0;
                enemyDeaths += h.deaths || 0;
            }
        }
        
        const momentum = (teamKills - teamDeaths) - (enemyKills - enemyDeaths);
        return momentum;
    }
    
    calculateGoldDifferential() {
        if (typeof Game === 'undefined') return 0;
        
        const blueGold = Game.blueScore || 0;
        const redGold = Game.redScore || 0;
        
        if (this.hero.team === 'blue') {
            return blueGold - redGold;
        } else {
            return redGold - blueGold;
        }
    }
    
    predictCCChain(nearbyEnemies) {
        if (!nearbyEnemies || nearbyEnemies.length === 0) return false;
        
        let ccAbilitiesReady = 0;
        for (const enemy of nearbyEnemies) {
            if (enemy.type === 'hero' && enemy.isAlive) {
                for (const key of ['q', 'e', 'r']) {
                    if (enemy.abilityCooldowns && enemy.abilityCooldowns[key] <= 0) {
                        if (enemy.heroData && enemy.heroData.abilities && enemy.heroData.abilities[key]) {
                            const ability = enemy.heroData.abilities[key];
                            if (ability.effects && (
                                ability.effects.includes('stun') ||
                                ability.effects.includes('root') ||
                                ability.effects.includes('slow')
                            )) {
                                ccAbilitiesReady++;
                            }
                        }
                    }
                }
            }
        }
        
        return ccAbilitiesReady >= 2;
    }
    
    predictEnemyGank() {
        if (typeof HeroManager === 'undefined' || !HeroManager.heroes) return false;
        
        const hero = this.hero;
        const enemyTeam = hero.team === 'blue' ? 'red' : 'blue';
        const dangerRange = 2000;
        const visionRange = 1200;
        
        let enemiesApproaching = 0;
        for (const enemy of HeroManager.heroes) {
            if (enemy.team === enemyTeam && enemy.isAlive) {
                const dist = Utils.distance(hero.x, hero.y, enemy.x, enemy.y);
                if (dist < dangerRange && dist > visionRange) {
                    enemiesApproaching++;
                }
            }
        }
        
        return enemiesApproaching >= 2;
    }
    
    calculateDeathProbability(nearbyEnemies) {
        if (!nearbyEnemies || nearbyEnemies.length === 0) return 0;
        
        const hero = this.hero;
        const maxHealth = hero.stats?.maxHealth || hero.health || 100;
        const healthPercent = (hero.health || 0) / maxHealth;
        
        let incomingDamage = 0;
        for (const enemy of nearbyEnemies) {
            if (enemy.distance < 600) {
                const enemyAD = enemy.attackDamage || 50;
                incomingDamage += enemyAD * 3;
            }
        }
        
        if (incomingDamage >= hero.health) {
            return 0.9;
        } else if (healthPercent < 0.2 && nearbyEnemies.length >= 2) {
            return 0.7;
        } else if (healthPercent < 0.3 && nearbyEnemies.length >= 1) {
            return 0.4;
        }
        
        return 0;
    }
    
    checkKillOpportunity(nearbyEnemies) {
        if (!nearbyEnemies || nearbyEnemies.length === 0) return false;
        
        const hero = this.hero;
        const heroAD = hero.stats?.attackDamage || 50;
        
        for (const enemy of nearbyEnemies) {
            if (enemy.distance < 600) {
                const enemyHealth = enemy.health || 500;
                const estimatedDamage = heroAD * 3;
                
                if (estimatedDamage >= enemyHealth * 1.2) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    checkNearObjective() {
        if (typeof CreatureManager === 'undefined' || !CreatureManager.creatures) return false;
        
        const hero = this.hero;
        const checkRange = 1000;
        const objectiveTypes = ['ancient_titan', 'void_herald'];
        
        for (const creature of CreatureManager.creatures) {
            if (objectiveTypes.includes(creature.type) && creature.isAlive) {
                const dist = Utils.distance(hero.x, hero.y, creature.x, creature.y);
                if (dist < checkRange) {
                    return true;
                }
            }
        }
        return false;
    }
    
    calculateEscapeRoute(nearbyEnemies, nearbyAllies) {
        const hero = this.hero;
        
        if (nearbyEnemies.length === 0) return true;
        
        if (nearbyAllies.length >= nearbyEnemies.length) return true;
        
        const spawnPoint = typeof GameMap !== 'undefined' ? GameMap.getSpawnPoint(hero.team) : { x: hero.x, y: hero.y };
        const distToBase = Utils.distance(hero.x, hero.y, spawnPoint.x, spawnPoint.y);
        
        let enemiesBlockingEscape = 0;
        for (const enemy of nearbyEnemies) {
            const enemyToBase = Utils.distance(enemy.x || hero.x, enemy.y || hero.y, spawnPoint.x, spawnPoint.y);
            if (enemyToBase < distToBase) {
                enemiesBlockingEscape++;
            }
        }
        
        return enemiesBlockingEscape === 0;
    }
    
    checkHasCC(enemy) {
        if (!enemy.heroData || !enemy.heroData.abilities) return false;
        
        for (const key of ['q', 'e', 'r']) {
            const ability = enemy.heroData.abilities[key];
            if (ability && ability.effects) {
                if (ability.effects.includes('stun') || 
                    ability.effects.includes('root') || 
                    ability.effects.includes('slow')) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkHighGround(entity) {
        return false;
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