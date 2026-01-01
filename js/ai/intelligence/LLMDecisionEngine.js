/**
 * ========================================
 * LLM Decision Engine
 * ========================================
 * Simulates LLM-based decision making for advanced AI
 */

class LLMDecisionEngine {
    constructor(controller) {
        this.controller = controller;
        this.llmQuality = this.controller.getDifficultySetting('llmQuality') || 0;
        this.llmAccuracy = this.controller.getDifficultySetting('llmAccuracy') || 0;
        this.llmUsageFrequency = this.controller.getDifficultySetting('llmUsageFrequency') || 0;
        this.lastLLMDecisionTime = 0;
        this.decisionCooldown = 2000; // 2 seconds between LLM decisions
        
        // LLM decision context
        this.decisionContext = {
            gameState: {},
            heroState: {},
            teamState: {},
            enemyState: {},
            recentActions: []
        };
    }
    
    initialize() {
        this.updateDecisionContext();
    }
    
    update(deltaTime, entities) {
        const now = Date.now();
        
        // Update context regularly
        this.updateDecisionContext();
        
        // Make LLM decisions based on frequency
        if (this.shouldUseLLM() && now - this.lastLLMDecisionTime >= this.decisionCooldown) {
            this.makeLLMDecision(entities);
            this.lastLLMDecisionTime = now;
        }
    }
    
    updateDecisionContext() {
        const hero = this.controller.hero;
        
        this.decisionContext = {
            gameState: {
                gameTime: (typeof Game !== 'undefined') ? Game.gameTime : 0,
                gamePhase: this.controller.strategicAnalyzer.getCurrentGamePhase(),
                blueScore: (typeof Game !== 'undefined' && Game.blueScore) ? Game.blueScore : 0,
                redScore: (typeof Game !== 'undefined' && Game.redScore) ? Game.redScore : 0
            },
            heroState: {
                health: hero.health,
                mana: hero.mana,
                level: hero.level,
                position: { x: hero.x, y: hero.y },
                abilities: this.getAbilityStates(),
                items: this.getItemStates(),
                buffs: this.getBuffStates(),
                debuffs: this.getDebuffStates()
            },
            teamState: this.getTeamState(),
            enemyState: this.getEnemyState(),
            recentActions: this.getRecentActions()
        };
    }
    
    getAbilityStates() {
        const hero = this.controller.hero;
        const abilities = {};
        
        for (const key of ['q', 'e', 'r', 't']) {
            abilities[key] = {
                level: hero.abilityLevels[key],
                cooldown: hero.abilityCooldowns[key],
                ready: hero.abilityCooldowns[key] <= 0 && hero.abilityLevels[key] > 0
            };
        }
        
        return abilities;
    }
    
    getItemStates() {
        // Placeholder for item system
        return {};
    }
    
    getBuffStates() {
        const hero = this.controller.hero;
        const buffs = {};
        
        if (Array.isArray(hero.buffs)) {
            for (const buff of hero.buffs) {
                buffs[buff.type] = {
                    duration: buff.duration,
                    remaining: buff.remainingTime
                };
            }
        }
        
        return buffs;
    }
    
    getDebuffStates() {
        const hero = this.controller.hero;
        const debuffs = {};
        
        if (Array.isArray(hero.debuffs)) {
            for (const debuff of hero.debuffs) {
                debuffs[debuff.type] = {
                    duration: debuff.duration,
                    remaining: debuff.remainingTime,
                    intensity: debuff.percent || debuff.value || 0
                };
            }
        }
        
        return debuffs;
    }
    
    getTeamState() {
        const team = this.controller.hero.team;
        const teamState = {
            heroes: [],
            averageLevel: 0,
            totalHealth: 0,
            mapControl: 0
        };
        
        if (HeroManager && HeroManager.heroes) {
            let levelSum = 0;
            let healthSum = 0;
            let heroCount = 0;
            
            for (const hero of HeroManager.heroes) {
                if (hero.team === team && hero.isAlive) {
                    teamState.heroes.push({
                        id: hero.id,
                        health: hero.health,
                        mana: hero.mana,
                        level: hero.level,
                        position: { x: hero.x, y: hero.y }
                    });
                    
                    levelSum += hero.level;
                    healthSum += hero.health;
                    heroCount++;
                }
            }
            
            teamState.averageLevel = heroCount > 0 ? levelSum / heroCount : 0;
            teamState.totalHealth = healthSum;
        }
        
        return teamState;
    }
    
    getEnemyState() {
        const enemyTeam = this.controller.hero.team === CONFIG.teams.BLUE ? CONFIG.teams.RED : CONFIG.teams.BLUE;
        const enemyState = {
            heroes: [],
            averageLevel: 0,
            totalHealth: 0,
            visibleHeroes: 0,
            missingHeroes: 0
        };
        
        if (HeroManager && HeroManager.heroes) {
            let levelSum = 0;
            let healthSum = 0;
            let visibleCount = 0;
            
            for (const hero of HeroManager.heroes) {
                if (hero.team === enemyTeam) {
                    const isVisible = this.controller.systems.visionSystem.isHeroVisible(hero);
                    
                    if (isVisible) {
                        enemyState.heroes.push({
                            id: hero.id,
                            health: hero.health,
                            mana: hero.mana,
                            level: hero.level,
                            position: { x: hero.x, y: hero.y },
                            visible: true
                        });
                        
                        levelSum += hero.level;
                        healthSum += hero.health;
                        visibleCount++;
                    } else {
                        enemyState.heroes.push({
                            id: hero.id,
                            visible: false,
                            lastSeen: this.controller.systems.visionSystem.getLastSeenPosition(hero.id)
                        });
                    }
                }
            }
            
            enemyState.averageLevel = visibleCount > 0 ? levelSum / visibleCount : 0;
            enemyState.totalHealth = healthSum;
            enemyState.visibleHeroes = visibleCount;
            enemyState.missingHeroes = enemyState.heroes.length - visibleCount;
        }
        
        return enemyState;
    }
    
    getRecentActions() {
        // Get recent actions from controller
        return this.controller.stateMachine.getStateHistory().slice(-5);
    }
    
    shouldUseLLM() {
        // Check if LLM is enabled for this difficulty
        if (!this.controller.getDifficultySetting('hasLLM')) {
            return false;
        }
        
        // Random chance based on usage frequency
        return Math.random() < this.llmUsageFrequency;
    }
    
    makeLLMDecision(entities) {
        // Simulate LLM decision making based on context
        const decision = this.generateLLMDecision();
        
        // Apply decision based on LLM accuracy
        if (Math.random() < this.llmAccuracy) {
            this.applyLLMDecision(decision);
        }
        
        return decision;
    }
    
    generateLLMDecision() {
        const context = this.decisionContext;
        const hero = this.controller.hero;
        
        // Simple decision tree based on context
        const decision = {
            type: 'default',
            action: 'continue_current',
            priority: 0.5,
            reasoning: 'No strong reason to change behavior'
        };
        
        // Analyze current situation
        const enemies = Combat.getEnemiesInRange(hero, 1000);
        const healthPercent = hero.health / hero.stats.maxHealth;
        
        // LLM Quality-based decisions
        if (this.llmQuality > 0.7) { // High quality LLM
            if (enemies.length > 0 && healthPercent > 0.6) {
                decision.type = 'combat';
                decision.action = 'engage';
                decision.priority = 0.9;
                decision.reasoning = 'Good health and enemies in range - engage';
            } else if (healthPercent < 0.3) {
                decision.type = 'survival';
                decision.action = 'retreat';
                decision.priority = 0.95;
                decision.reasoning = 'Low health - retreat to safety';
            } else if (context.enemyState.missingHeroes > 1) {
                decision.type = 'caution';
                decision.action = 'play_safe';
                decision.priority = 0.8;
                decision.reasoning = 'Multiple missing enemies - play safe';
            }
        } else if (this.llmQuality > 0.3) { // Medium quality LLM
            if (enemies.length > 0 && healthPercent > 0.7) {
                decision.type = 'combat';
                decision.action = 'harass';
                decision.priority = 0.7;
                decision.reasoning = 'Good health - harass enemies';
            } else if (healthPercent < 0.4) {
                decision.type = 'survival';
                decision.action = 'retreat';
                decision.priority = 0.8;
                decision.reasoning = 'Low health - retreat';
            }
        }
        
        // Add some randomness based on LLM quality
        if (Math.random() < (1 - this.llmQuality) * 0.5) {
            decision.action = 'random_action';
            decision.reasoning = 'LLM hallucination - random action';
        }
        
        return decision;
    }
    
    applyLLMDecision(decision) {
        const hero = this.controller.hero;
        
        switch (decision.action) {
            case 'engage':
                this.controller.stateMachine.setState('fighting');
                break;
            case 'retreat':
                this.controller.stateMachine.setState('retreating');
                break;
            case 'harass':
                this.controller.stateMachine.setState('harassing');
                break;
            case 'play_safe':
                this.controller.stateMachine.setState('laning');
                break;
            case 'random_action':
                // Do something random
                const actions = ['engage', 'retreat', 'harass', 'play_safe'];
                const randomAction = actions[Math.floor(Math.random() * actions.length)];
                
                switch (randomAction) {
                    case 'engage': this.controller.stateMachine.setState('fighting'); break;
                    case 'retreat': this.controller.stateMachine.setState('retreating'); break;
                    case 'harass': this.controller.stateMachine.setState('harassing'); break;
                    case 'play_safe': this.controller.stateMachine.setState('laning'); break;
                }
                break;
        }
    }
    
    getDecisionContext() {
        return this.decisionContext;
    }
    
    getLLMQuality() {
        return this.llmQuality;
    }
    
    // Advanced LLM simulation for target selection
    suggestOptimalTarget(enemies) {
        if (!this.shouldUseLLM() || enemies.length === 0) {
            return null;
        }
        
        // Simple target selection based on LLM logic
        let bestTarget = null;
        let bestScore = -Infinity;
        
        for (const enemy of enemies) {
            if (enemy.type === 'hero') {
                const score = this.calculateTargetScore(enemy);
                if (score > bestScore) {
                    bestScore = score;
                    bestTarget = enemy;
                }
            }
        }
        
        return bestTarget;
    }
    
    calculateTargetScore(target) {
        let score = 0;
        
        // Health factor - prefer low health targets
        const healthPercent = target.health / target.stats.maxHealth;
        score += (1 - healthPercent) * 50;
        
        // Threat factor - prefer high threat targets
        const threat = this.controller.combatAnalyzer.calculateEnemyThreat(target);
        score += threat * 0.3;
        
        // Distance factor - prefer closer targets
        const distance = Utils.distance(this.controller.hero.x, this.controller.hero.y, target.x, target.y);
        const maxRange = this.controller.hero.stats.attackRange * 2;
        score += (1 - Math.min(distance / maxRange, 1)) * 30;
        
        // Role factor
        switch (target.role) {
            case 'marksman': score += 20; break;
            case 'mage': score += 15; break;
            case 'assassin': score += 25; break;
        }
        
        // Add some randomness based on LLM quality
        score += (Math.random() - 0.5) * 20 * (1 - this.llmQuality);
        
        return score;
    }
    
    // LLM-based positioning suggestion
    suggestOptimalPosition() {
        if (!this.shouldUseLLM()) {
            return null;
        }
        
        const hero = this.controller.hero;
        const enemies = Combat.getEnemiesInRange(hero, 1200);
        
        if (enemies.length === 0) {
            return null;
        }
        
        // Calculate optimal position based on combat situation
        const optimalPosition = { x: hero.x, y: hero.y };
        
        // If we have range advantage, stay at max range
        if (hero.stats.attackRange > 400) {
            const enemy = enemies[0];
            const angle = Utils.angleBetweenPoints(enemy.x, enemy.y, hero.x, hero.y);
            const optimalRange = hero.stats.attackRange * 0.9;
            
            optimalPosition.x = enemy.x + Math.cos(angle) * optimalRange;
            optimalPosition.y = enemy.y + Math.sin(angle) * optimalRange;
        }
        
        return optimalPosition;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LLMDecisionEngine;
}