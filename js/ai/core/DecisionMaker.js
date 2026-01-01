/**
 * ========================================
 * Decision Maker
 * ========================================
 * Handles AI decision making logic
 */

class DecisionMaker {
    constructor(controller, difficulty) {
        this.controller = controller;
        this.difficulty = difficulty;
        this.lastDecisionTime = 0;
        this.currentStrategy = 'FARM_SAFE';
        this.currentTarget = null;
        this.currentObjective = null;
    }
    
    makeDecision(deltaTime, entities, aggressiveness = 'balanced') {
        const now = Date.now();
        const decisionInterval = this.controller.getDifficultySetting('decisionInterval');
        
        if (now - this.lastDecisionTime >= decisionInterval || typeof deltaTime === 'string') {
            const situation = this.analyzeSituation(entities);
            
            // Apply aggressiveness to situation if needed
            if (aggressiveness === 'aggressive') {
                situation.hasAdvantage = true;
                situation.shouldRetreat = situation.healthPercent < 0.1;
            } else if (aggressiveness === 'passive') {
                situation.hasAdvantage = false;
                situation.shouldRetreat = situation.healthPercent < 0.6;
            }

            this.currentStrategy = this.determineStrategy(situation);
            this.updateTarget(situation);
            this.lastDecisionTime = now;
        }
        
        return {
            action: this.currentStrategy,
            target: this.currentTarget
        };
    }
    
    analyzeSituation(entities) {
        const myTeam = this.controller.hero.team;
        const enemyTeam = myTeam === CONFIG.teams.BLUE ? CONFIG.teams.RED : CONFIG.teams.BLUE;
        
        const nearbyEnemies = Combat.getEnemiesInRange(this.controller.hero, 1000);
        const nearbyAllies = Combat.getAlliesInRange(this.controller.hero, 1000);
        const nearbyMinions = MinionManager.getMinionsInRange(this.controller.hero.x, this.controller.hero.y, 600);
        
        const hero = this.controller.hero;
        const maxHealth = hero.stats?.maxHealth || hero.health || 100;
        const maxMana = hero.stats?.maxMana || hero.mana || 100;
        const healthPercent = (hero.health || 0) / maxHealth;
        const manaPercent = (hero.mana || 0) / maxMana;
        
        const enemyHeroes = nearbyEnemies.filter(e => e.type === 'hero');
        const lowHpEnemies = enemyHeroes.filter(e => {
            const enemyMaxHealth = e.stats?.maxHealth || e.health || 100;
            return (e.health || 0) / enemyMaxHealth < 0.3;
        });
        
        const nearbyEnemyTower = TowerManager.towers.find(t => 
            t.team !== myTeam && t.isAlive && 
            Utils.distance(this.controller.hero.x, this.controller.hero.y, t.x, t.y) < 800
        );
        
        const nearbyAllyTower = TowerManager.towers.find(t => 
            t.team === myTeam && t.isAlive && 
            Utils.distance(this.controller.hero.x, this.controller.hero.y, t.x, t.y) < 800
        );
        
        const myMinions = nearbyMinions.filter(m => m.team === myTeam);
        const enemyMinions = nearbyMinions.filter(m => m.team !== myTeam);
        
        const basePoint = GameMap.getSpawnPoint(myTeam);
        const distFromBase = Utils.distance(this.controller.hero.x, this.controller.hero.y, basePoint.x, basePoint.y);
        
        // Check for incoming projectiles
        const incomingProjectiles = this.detectIncomingProjectiles();
        
        // Check for nearby jungle camps
        const nearbyJungleCamps = this.detectNearbyJungleCamps();
        
        return {
            healthPercent,
            manaPercent,
            nearbyEnemies,
            nearbyAllies,
            enemyHeroes,
            lowHpEnemies,
            nearbyEnemyTower,
            nearbyAllyTower,
            myMinions,
            enemyMinions,
            distFromBase,
            incomingProjectiles,
            nearbyJungleCamps,
            inDanger: nearbyEnemyTower && enemyHeroes.length > 0,
            canKill: lowHpEnemies.length > 0,
            shouldRetreat: healthPercent < this.controller.getAIParameter('healthThresholdRetreat') || 
                          (healthPercent < 0.4 && enemyHeroes.length > nearbyAllies.length),
            hasAdvantage: nearbyAllies.length >= enemyHeroes.length && healthPercent > 0.5,
        };
    }
    
    detectIncomingProjectiles() {
        if (!ProjectileManager || !ProjectileManager.projectiles) return [];
        
        const incoming = [];
        const hero = this.controller.hero;
        
        for (const proj of ProjectileManager.projectiles) {
            if (proj.team === hero.team) continue;
            
            const dist = Utils.distance(hero.x, hero.y, proj.x, proj.y);
            if (dist > 500) continue;
            
            const timeToHit = dist / proj.speed;
            const projEndX = proj.x + Math.cos(proj.angle) * proj.speed * timeToHit;
            const projEndY = proj.y + Math.sin(proj.angle) * proj.speed * timeToHit;
            
            const willHit = Utils.lineCircleIntersection(
                proj.x, proj.y, projEndX, projEndY,
                hero.x, hero.y, hero.radius + proj.width / 2
            );
            
            if (willHit) {
                incoming.push(proj);
            }
        }
        
        return incoming;
    }
    
    detectNearbyJungleCamps() {
        if (!CreatureManager.camps || CreatureManager.camps.length === 0) return [];
        
        const nearby = [];
        const hero = this.controller.hero;
        
        for (const camp of CreatureManager.camps) {
            if (camp.isCleared) continue;
            
            const dist = Utils.distance(hero.x, hero.y, camp.x, camp.y);
            if (dist < 1000) {
                nearby.push(camp);
            }
        }
        
        return nearby;
    }
    
    determineStrategy(situation) {
        const difficulty = this.difficulty;
        
        if (difficulty === 'nightmare') {
            return this.nightmareStrategy(situation);
        }
        
        if (difficulty === 'veryhard') {
            return this.veryhardStrategy(situation);
        }
        
        if (situation.shouldRetreat) {
            return 'RETREAT';
        }
        
        if (situation.canKill && situation.hasAdvantage) {
            return 'ALL_IN';
        }
        
        if (situation.enemyHeroes.length > 0 && situation.healthPercent > 0.6) {
            if (Math.random() < this.controller.getDifficultySetting('skillUsage')) {
                return 'HARASS';
            }
        }
        
        if (situation.nearbyEnemyTower && situation.myMinions.length >= 4 && !situation.inDanger) {
            return 'PUSH_OBJECTIVE';
        }
        
        return 'FARM_SAFE';
    }
    
    nightmareStrategy(situation) {
        if (situation.healthPercent < 0.2) {
            return 'RETREAT';
        }
        
        if (situation.lowHpEnemies.length > 0) {
            const target = situation.lowHpEnemies[0];
            const canKill = this.calculateKillPotential(target);
            if (canKill && situation.healthPercent > 0.4) {
                return 'ALL_IN';
            }
        }
        
        if (situation.myMinions.length >= 3 && !situation.nearbyEnemyTower) {
            return 'PUSH_OBJECTIVE';
        }
        
        if (situation.enemyHeroes.length > 0 && situation.hasAdvantage) {
            return 'HARASS';
        }
        
        return 'FARM_SAFE';
    }
    
    veryhardStrategy(situation) {
        if (situation.shouldRetreat && Math.random() < 0.95) {
            return 'RETREAT';
        }
        
        if (situation.canKill && Math.random() < 0.9) {
            return 'ALL_IN';
        }
        
        if (situation.hasAdvantage && Math.random() < 0.8) {
            return 'HARASS';
        }
        
        if (situation.myMinions.length >= 3 && Math.random() < 0.7) {
            return 'PUSH_OBJECTIVE';
        }
        
        return 'FARM_SAFE';
    }
    
    calculateKillPotential(target) {
        if (!target || !target.isAlive) return false;
        
        const hero = this.controller.hero;
        const heroAD = hero.stats?.attackDamage || 50;
        const heroAP = hero.stats?.abilityPower || 0;
        
        let totalDamage = 0;
        totalDamage += heroAD * 3;
        
        if (hero.abilityLevels && hero.abilityCooldowns && hero.heroData && hero.heroData.abilities) {
            for (const key of ['q', 'e', 'r', 't']) {
                if (hero.abilityLevels[key] > 0 && hero.abilityCooldowns[key] <= 0) {
                    const ability = hero.heroData.abilities[key];
                    if (!ability) continue;
                    
                    const level = hero.abilityLevels[key];
                    
                    let damage = (ability.baseDamage && ability.baseDamage[level - 1]) || 0;
                    damage += (ability.adRatio || 0) * heroAD;
                    damage += (ability.apRatio || 0) * heroAP;
                    
                    totalDamage += damage;
                }
            }
        }
        
        return totalDamage > (target.health || 0) * 1.2;
    }
    
    updateTarget(situation) {
        if (situation.lowHpEnemies.length > 0) {
            this.currentTarget = situation.lowHpEnemies[0];
        } else if (situation.enemyHeroes.length > 0) {
            this.currentTarget = this.controller.systems.targetSelector.selectBestTarget(
                situation.enemyHeroes,
                this.controller.hero
            );
        } else if (situation.enemyMinions.length > 0) {
            this.currentTarget = situation.enemyMinions[0];
        } else {
            this.currentTarget = null;
        }
    }
    
    getCurrentStrategy() {
        return this.currentStrategy;
    }
    
    getCurrentTarget() {
        return this.currentTarget;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DecisionMaker;
}