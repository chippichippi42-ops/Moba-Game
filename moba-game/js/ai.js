/**
 * ========================================
 * MOBA Arena - AI System (Improved)
 * ========================================
 * Cải thiện AI để tránh bị kẹt
 */

const AIManager = {
    controllers: [],
    
    init() {
        this.controllers = [];
    },
    
    createController(hero, difficulty) {
        const controller = new AIController(hero, difficulty);
        this.controllers.push(controller);
        return controller;
    },
    
    update(deltaTime, entities) {
        for (const controller of this.controllers) {
            controller.update(deltaTime, entities);
        }
    },
    
    clear() {
        this.controllers = [];
    },
};

/**
 * AI Controller - Improved pathfinding
 */
class AIController {
    constructor(hero, difficulty) {
        this.hero = hero;
        this.difficulty = difficulty;
        this.difficultySettings = CONFIG.aiDifficulty[difficulty];
        
        // Decision making
        this.lastDecisionTime = 0;
        this.currentStrategy = 'FARM_SAFE';
        this.currentTarget = null;
        this.currentObjective = null;
        
        // Pathfinding - Improved
        this.path = [];
        this.pathIndex = 0;
        this.lastPosition = { x: hero.x, y: hero.y };
        this.stuckTimer = 0;
        this.stuckThreshold = 1000; // 1 second
        this.lastMoveTime = Date.now();
        
        // Anti-stuck measures
        this.stuckCount = 0;
        this.lastStuckCheck = Date.now();
        this.randomOffset = { x: 0, y: 0 };
        
        // Lane assignment
        this.assignedLane = this.assignLane();
        
        // Behavior state
        this.state = 'laning';
        this.lastStateChange = 0;
        
        // Combat state
        this.inCombat = false;
        this.combatStartTime = 0;
        this.retreating = false;
        
        // Ability usage tracking
        this.lastAbilityUse = { q: 0, e: 0, r: 0, t: 0 };
        
        // Skill order
        this.skillOrder = this.generateSkillOrder();
        this.skillOrderIndex = 0;
    }
    
    assignLane() {
        const hints = this.hero.heroData.aiHints;
        if (hints && hints.preferredLane) {
            return hints.preferredLane;
        }
        
        switch (this.hero.role) {
            case 'marksman':
                return 'bot';
            case 'mage':
                return 'mid';
            case 'fighter':
            case 'tank':
                return 'top';
            case 'assassin':
                return 'mid';
            default:
                return Utils.randomItem(['top', 'mid', 'bot']);
        }
    }
    
    generateSkillOrder() {
        const order = [];
        
        for (let level = 1; level <= 15; level++) {
            if (level === 4 || level === 8 || level === 12) {
                order.push('t');
            } else if (level <= 9 && level % 2 === 1) {
                order.push('q');
            } else if (level <= 9) {
                order.push('e');
            } else {
                order.push('r');
            }
        }
        
        return order;
    }
    
    update(deltaTime, entities) {
        if (!this.hero.isAlive || this.hero.isDead) return;
        
        // Auto level up skills
        this.autoLevelSkills();
        
        // Check if stuck
        this.checkStuck(deltaTime);
        
        // Make decisions
        const now = Date.now();
        if (now - this.lastDecisionTime >= this.difficultySettings.decisionInterval) {
            this.makeDecision(entities);
            this.lastDecisionTime = now;
        }
        
        // Execute strategy
        this.executeStrategy(deltaTime, entities);
        
        // Update movement with anti-stuck
        this.updateMovement(deltaTime);
        
        // Try to dodge
        this.tryDodge(entities);
        
        // Store position for stuck detection
        this.lastPosition = { x: this.hero.x, y: this.hero.y };
    }
    
    /**
     * Check if AI is stuck
     */
    checkStuck(deltaTime) {
        const distMoved = Utils.distance(
            this.hero.x, this.hero.y,
            this.lastPosition.x, this.lastPosition.y
        );
        
        // If barely moved but should be moving
        if (distMoved < 5 && (Math.abs(this.hero.vx) > 10 || Math.abs(this.hero.vy) > 10)) {
            this.stuckTimer += deltaTime;
        } else {
            this.stuckTimer = 0;
            this.stuckCount = 0;
        }
        
        // If stuck for too long, take action
        if (this.stuckTimer > this.stuckThreshold) {
            this.handleStuck();
            this.stuckTimer = 0;
            this.stuckCount++;
        }
    }
    
    /**
     * Handle being stuck
     */
    handleStuck() {
        // Generate random offset to escape
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 200;
        
        this.randomOffset = {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
        };
        
        // If stuck multiple times, try more drastic measures
        if (this.stuckCount > 3) {
            // Try to move to a known safe location
            const waypoint = this.getLanePosition(this.assignedLane, 0.2);
            if (waypoint) {
                this.randomOffset = {
                    x: waypoint.x - this.hero.x,
                    y: waypoint.y - this.hero.y,
                };
            }
        }
        
        // Use dash ability if available to escape
        if (this.stuckCount > 2) {
            this.tryEscapeDash();
        }
    }
    
    /**
     * Try to use dash ability to escape stuck position
     */
    tryEscapeDash() {
        const hero = this.hero;
        
        for (const key of ['e', 'r', 'q']) {
            const ability = hero.heroData.abilities[key];
            if (!ability) continue;
            
            if (ability.type === 'dash' || ability.type === 'blink') {
                if (hero.abilityCooldowns[key] <= 0 && hero.abilityLevels[key] > 0) {
                    // Dash towards lane center
                    const lanePos = this.getLanePosition(this.assignedLane, 0.3);
                    if (lanePos) {
                        hero.useAbility(key, lanePos.x, lanePos.y);
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    autoLevelSkills() {
        while (this.hero.abilityPoints > 0 && this.skillOrderIndex < this.skillOrder.length) {
            const skill = this.skillOrder[this.skillOrderIndex];
            
            if (this.hero.levelUpAbility(skill)) {
                this.skillOrderIndex++;
            } else {
                this.skillOrderIndex++;
            }
        }
    }
    
    makeDecision(entities) {
        const situation = this.analyzeSituation(entities);
        this.currentStrategy = this.determineStrategy(situation);
        this.updateState(situation);
    }
    
    analyzeSituation(entities) {
        const myTeam = this.hero.team;
        const enemyTeam = myTeam === CONFIG.teams.BLUE ? CONFIG.teams.RED : CONFIG.teams.BLUE;
        
        const nearbyEnemies = Combat.getEnemiesInRange(this.hero, 1000);
        const nearbyAllies = Combat.getAlliesInRange(this.hero, 1000);
        const nearbyMinions = MinionManager.getMinionsInRange(this.hero.x, this.hero.y, 600);
        
        const healthPercent = this.hero.health / this.hero.stats.maxHealth;
        const manaPercent = this.hero.mana / this.hero.stats.maxMana;
        
        const enemyHeroes = nearbyEnemies.filter(e => e.type === 'hero');
        const lowHpEnemies = enemyHeroes.filter(e => e.health / e.stats.maxHealth < 0.3);
        
        const nearbyEnemyTower = TowerManager.towers.find(t => 
            t.team !== myTeam && t.isAlive && 
            Utils.distance(this.hero.x, this.hero.y, t.x, t.y) < 800
        );
        
        const nearbyAllyTower = TowerManager.towers.find(t => 
            t.team === myTeam && t.isAlive && 
            Utils.distance(this.hero.x, this.hero.y, t.x, t.y) < 800
        );
        
        const myMinions = nearbyMinions.filter(m => m.team === myTeam);
        const enemyMinions = nearbyMinions.filter(m => m.team !== myTeam);
        
        const basePoint = GameMap.getSpawnPoint(myTeam);
        const distFromBase = Utils.distance(this.hero.x, this.hero.y, basePoint.x, basePoint.y);
        
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
            inDanger: nearbyEnemyTower && enemyHeroes.length > 0,
            canKill: lowHpEnemies.length > 0,
            shouldRetreat: healthPercent < 0.25 || (healthPercent < 0.4 && enemyHeroes.length > nearbyAllies.length),
            hasAdvantage: nearbyAllies.length >= enemyHeroes.length && healthPercent > 0.5,
        };
    }
    
    determineStrategy(situation) {
        const difficulty = this.difficultySettings;
        
        if (this.difficulty === 'nightmare') {
            return this.nightmareStrategy(situation);
        }
        
        if (this.difficulty === 'veryhard') {
            return this.veryhardStrategy(situation);
        }
        
        if (situation.shouldRetreat) {
            return 'RETREAT';
        }
        
        if (situation.canKill && situation.hasAdvantage) {
            return 'ALL_IN';
        }
        
        if (situation.enemyHeroes.length > 0 && situation.healthPercent > 0.6) {
            if (Math.random() < difficulty.skillUsage) {
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
        
        let totalDamage = 0;
        totalDamage += this.hero.stats.attackDamage * 3;
        
        for (const key of ['q', 'e', 'r', 't']) {
            if (this.hero.abilityLevels[key] > 0 && this.hero.abilityCooldowns[key] <= 0) {
                const ability = this.hero.heroData.abilities[key];
                const level = this.hero.abilityLevels[key];
                
                let damage = ability.baseDamage[level - 1] || 0;
                damage += (ability.adRatio || 0) * this.hero.stats.attackDamage;
                damage += (ability.apRatio || 0) * this.hero.stats.abilityPower;
                
                totalDamage += damage;
            }
        }
        
        return totalDamage > target.health * 1.2;
    }
    
    updateState(situation) {
        const previousState = this.state;
        
        switch (this.currentStrategy) {
            case 'RETREAT':
                this.state = 'retreating';
                break;
            case 'ALL_IN':
                this.state = 'fighting';
                break;
            case 'HARASS':
                this.state = 'harassing';
                break;
            case 'PUSH_OBJECTIVE':
                this.state = 'pushing';
                break;
            case 'FARM_SAFE':
            default:
                this.state = 'laning';
                break;
        }
        
        if (this.state !== previousState) {
            this.lastStateChange = Date.now();
            this.randomOffset = { x: 0, y: 0 }; // Reset offset on state change
        }
    }
    
    executeStrategy(deltaTime, entities) {
        switch (this.state) {
            case 'retreating':
                this.executeRetreat(entities);
                break;
            case 'fighting':
                this.executeFight(entities);
                break;
            case 'harassing':
                this.executeHarass(entities);
                break;
            case 'pushing':
                this.executePush(entities);
                break;
            case 'laning':
            default:
                this.executeLaning(entities);
                break;
        }
    }
    
    executeRetreat(entities) {
        const basePoint = GameMap.getSpawnPoint(this.hero.team);
        this.moveTowards(basePoint.x, basePoint.y);
        
        this.useEscapeAbilities();
        
        if (this.hero.spell === 'heal' && this.hero.spellCooldown <= 0) {
            this.hero.useSpell(this.hero.x, this.hero.y);
        }
        
        if (this.hero.spell === 'flash' && this.hero.spellCooldown <= 0) {
            const enemies = Combat.getEnemiesInRange(this.hero, 500);
            if (enemies.length > 0) {
                const angle = Utils.angleBetweenPoints(this.hero.x, this.hero.y, basePoint.x, basePoint.y);
                this.hero.useSpell(
                    this.hero.x + Math.cos(angle) * 400,
                    this.hero.y + Math.sin(angle) * 400
                );
            }
        }
    }
    
    executeFight(entities) {
        const target = Combat.getPriorityTarget(this.hero, this.hero.stats.attackRange + 200);
        
        if (!target) {
            this.state = 'laning';
            return;
        }
        
        const dist = Utils.distance(this.hero.x, this.hero.y, target.x, target.y);
        
        if (dist > this.hero.stats.attackRange) {
            this.moveTowards(target.x, target.y);
        }
        
        this.useCombo(target, 'all_in');
        
        if (dist <= this.hero.stats.attackRange + target.radius) {
            this.hero.basicAttack(target);
        }
    }
    
    executeHarass(entities) {
        const enemies = Combat.getEnemiesInRange(this.hero, 800);
        const enemyHeroes = enemies.filter(e => e.type === 'hero');
        
        if (enemyHeroes.length === 0) {
            this.state = 'laning';
            return;
        }
        
        const target = enemyHeroes[0];
        const dist = Utils.distance(this.hero.x, this.hero.y, target.x, target.y);
        
        this.useCombo(target, 'poke');
        
        const optimalRange = this.hero.stats.attackRange * 0.9;
        
        if (dist < optimalRange - 50) {
            const angle = Utils.angleBetween(target, this.hero);
            this.moveTowards(
                this.hero.x + Math.cos(angle) * 100,
                this.hero.y + Math.sin(angle) * 100
            );
        } else if (dist > optimalRange + 50) {
            this.moveTowards(target.x, target.y);
        } else {
            this.hero.basicAttack(target);
        }
    }
    
    executePush(entities) {
        const targetTower = TowerManager.getNextAttackableTower(this.hero.team, this.assignedLane);
        
        if (!targetTower) {
            this.state = 'laning';
            return;
        }
        
        const dist = Utils.distance(this.hero.x, this.hero.y, targetTower.x, targetTower.y);
        
        const myMinions = MinionManager.getMinionsInRange(this.hero.x, this.hero.y, 400)
            .filter(m => m.team === this.hero.team);
        
        if (myMinions.length < 2) {
            const waypoint = this.getLanePosition(this.assignedLane, 0.3);
            if (waypoint) {
                this.moveTowards(waypoint.x, waypoint.y);
            }
            return;
        }
        
        if (dist <= this.hero.stats.attackRange + targetTower.radius) {
            if (targetTower.currentTarget && targetTower.currentTarget.type === 'minion') {
                this.hero.basicAttack(targetTower);
            }
        } else {
            this.moveTowards(targetTower.x, targetTower.y);
        }
    }
    
    executeLaning(entities) {
        const lanePos = this.getLanePosition(this.assignedLane, 0.4);
        if (!lanePos) return;
        
        // Apply random offset if stuck
        const targetX = lanePos.x + this.randomOffset.x;
        const targetY = lanePos.y + this.randomOffset.y;
        
        const nearbyMinions = MinionManager.getMinionsInRange(this.hero.x, this.hero.y, this.hero.stats.attackRange + 100)
            .filter(m => m.team !== this.hero.team);
        
        const lastHitTarget = nearbyMinions.find(m => 
            m.health <= this.hero.stats.attackDamage * 1.2
        );
        
        if (lastHitTarget) {
            if (this.difficulty === 'nightmare' || 
                (this.difficulty === 'veryhard' && Math.random() < 0.9)) {
                const dist = Utils.distance(this.hero.x, this.hero.y, lastHitTarget.x, lastHitTarget.y);
                if (dist <= this.hero.stats.attackRange + lastHitTarget.radius) {
                    this.hero.basicAttack(lastHitTarget);
                } else {
                    this.moveTowards(lastHitTarget.x, lastHitTarget.y);
                }
                return;
            }
        }
        
        const enemyMinions = MinionManager.getMinionsInRange(lanePos.x, lanePos.y, 400)
            .filter(m => m.team !== this.hero.team);
        
        if (enemyMinions.length === 0) {
            const nearestCamp = this.findNearestJungleCamp();
            if (nearestCamp) {
                const campDist = Utils.distance(this.hero.x, this.hero.y, nearestCamp.x, nearestCamp.y);
                if (campDist < 1000) {
                    this.attackJungleCamp(nearestCamp);
                    return;
                }
            }
        }
        
        const dist = Utils.distance(this.hero.x, this.hero.y, targetX, targetY);
        if (dist > 100) {
            this.moveTowards(targetX, targetY);
        } else {
            // Clear random offset once we reach destination
            this.randomOffset = { x: 0, y: 0 };
            
            if (nearbyMinions.length > 0) {
                const target = nearbyMinions[0];
                const targetDist = Utils.distance(this.hero.x, this.hero.y, target.x, target.y);
                
                if (targetDist <= this.hero.stats.attackRange + target.radius) {
                    this.hero.basicAttack(target);
                } else {
                    this.moveTowards(target.x, target.y);
                }
            }
        }
    }
    
    getLanePosition(lane, progress) {
        const waypoints = this.hero.team === CONFIG.teams.BLUE 
            ? MinionManager.waypoints.blue[lane]
            : MinionManager.waypoints.red[lane];
        
        if (!waypoints || waypoints.length === 0) {
            return { x: CONFIG.map.width / 2, y: CONFIG.map.height / 2 };
        }
        
        const index = Math.floor(progress * (waypoints.length - 1));
        return waypoints[Math.min(index, waypoints.length - 1)];
    }
    
    findNearestJungleCamp() {
        if (!CreatureManager.camps || CreatureManager.camps.length === 0) {
            return null;
        }
        
        let nearest = null;
        let nearestDist = Infinity;
        
        for (const camp of CreatureManager.camps) {
            if (camp.isCleared) continue;
            
            const dist = Utils.distance(this.hero.x, this.hero.y, camp.x, camp.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = camp;
            }
        }
        
        return nearest;
    }
    
    attackJungleCamp(camp) {
        const creature = camp.creatures.find(c => c.isAlive);
        if (!creature) return;
        
        const dist = Utils.distance(this.hero.x, this.hero.y, creature.x, creature.y);
        
        if (dist <= this.hero.stats.attackRange + creature.radius) {
            this.hero.basicAttack(creature);
            this.useCombo(creature, 'trade');
        } else {
            this.moveTowards(creature.x, creature.y);
        }
    }
    
    useCombo(target, condition) {
        const combos = this.hero.heroData.aiHints?.combos || [];
        const combo = combos.find(c => c.condition === condition) || combos[0];
        
        if (!combo) return;
        
        const now = Date.now();
        const reactionTime = this.difficultySettings.reactionTime;
        
        for (const action of combo.sequence) {
            if (action === 'auto') {
                this.hero.basicAttack(target);
            } else if (['q', 'e', 'r', 't'].includes(action)) {
                if (this.hero.abilityCooldowns[action] <= 0 &&
                    this.hero.abilityLevels[action] > 0 &&
                    now - this.lastAbilityUse[action] > reactionTime) {
                    
                    if (Math.random() < this.difficultySettings.skillUsage) {
                        this.hero.useAbility(action, target.x, target.y, target);
                        this.lastAbilityUse[action] = now;
                        return;
                    }
                }
            }
        }
    }
    
    useEscapeAbilities() {
        const basePoint = GameMap.getSpawnPoint(this.hero.team);
        const escapeAngle = Utils.angleBetweenPoints(this.hero.x, this.hero.y, basePoint.x, basePoint.y);
        const escapeX = this.hero.x + Math.cos(escapeAngle) * 500;
        const escapeY = this.hero.y + Math.sin(escapeAngle) * 500;
        
        for (const key of ['r', 'e', 'q']) {
            const ability = this.hero.heroData.abilities[key];
            if (!ability) continue;
            
            if (ability.type === 'dash' || ability.type === 'blink') {
                if (this.hero.abilityCooldowns[key] <= 0 && this.hero.abilityLevels[key] > 0) {
                    this.hero.useAbility(key, escapeX, escapeY);
                    return;
                }
            }
        }
    }
    
    /**
     * Move towards target with wall avoidance
     */
    moveTowards(targetX, targetY) {
        let angle = Utils.angleBetweenPoints(this.hero.x, this.hero.y, targetX, targetY);
        
        // Check if direct path is blocked
        const testDist = 50;
        const testX = this.hero.x + Math.cos(angle) * testDist;
        const testY = this.hero.y + Math.sin(angle) * testDist;
        
        if (GameMap.checkWallCollision(testX, testY, this.hero.radius)) {
            // Try alternative angles
            const alternativeAngles = [
                angle + Math.PI / 4,
                angle - Math.PI / 4,
                angle + Math.PI / 2,
                angle - Math.PI / 2,
                angle + Math.PI * 3 / 4,
                angle - Math.PI * 3 / 4,
            ];
            
            for (const altAngle of alternativeAngles) {
                const altX = this.hero.x + Math.cos(altAngle) * testDist;
                const altY = this.hero.y + Math.sin(altAngle) * testDist;
                
                if (!GameMap.checkWallCollision(altX, altY, this.hero.radius)) {
                    angle = altAngle;
                    break;
                }
            }
        }
        
        let speed = this.hero.stats.moveSpeed;
        
        if (Array.isArray(this.hero.debuffs)) {
            const slow = this.hero.debuffs.find(d => d.type === 'slow');
            if (slow) {
                speed *= (1 - slow.percent / 100);
            }
        }
        
        this.hero.vx = Math.cos(angle) * speed;
        this.hero.vy = Math.sin(angle) * speed;
        this.hero.facingAngle = angle;
    }
    
    updateMovement(deltaTime) {
        if (Array.isArray(this.hero.debuffs)) {
            const stunned = this.hero.debuffs.some(d => d.type === 'stun' || d.type === 'knockup');
            if (stunned) {
                this.hero.vx = 0;
                this.hero.vy = 0;
            }
        }
    }
    
    tryDodge(entities) {
        if (Math.random() > this.difficultySettings.dodgeChance) return;
        
        if (!ProjectileManager || !ProjectileManager.projectiles || !Array.isArray(ProjectileManager.projectiles)) {
            return;
        }
        
        for (const proj of ProjectileManager.projectiles) {
            if (proj.team === this.hero.team) continue;
            
            const dist = Utils.distance(this.hero.x, this.hero.y, proj.x, proj.y);
            if (dist > 500) continue;
            
            const timeToHit = dist / proj.speed;
            const projEndX = proj.x + Math.cos(proj.angle) * proj.speed * timeToHit;
            const projEndY = proj.y + Math.sin(proj.angle) * proj.speed * timeToHit;
            
            const willHit = Utils.lineCircleIntersection(
                proj.x, proj.y, projEndX, projEndY,
                this.hero.x, this.hero.y, this.hero.radius + proj.width / 2
            );
            
            if (willHit) {
                const dodgeAngle = proj.angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
                const dodgeDist = 100;
                
                this.moveTowards(
                    this.hero.x + Math.cos(dodgeAngle) * dodgeDist,
                    this.hero.y + Math.sin(dodgeAngle) * dodgeDist
                );
                return;
            }
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIManager, AIController };
}
