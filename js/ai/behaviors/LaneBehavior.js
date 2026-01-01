/**
 * ========================================
 * Lane Behavior
 * ========================================
 * Handles laning phase behavior
 */

class LaneBehavior {
    constructor(controller) {
        this.controller = controller;
        this.assignedLane = this.assignLane();
        this.lastFarmTime = 0;
        this.farmCooldown = 500; // 500ms between farm attempts
    }
    
    initialize() {
        // Initialization if needed
    }
    
    assignLane() {
        const hints = this.controller.hero.heroData.aiHints;
        if (hints && hints.preferredLane) {
            return hints.preferredLane;
        }
        
        switch (this.controller.hero.role) {
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
    
    execute(deltaTime, entities) {
        const hero = this.controller.hero;
        
        // Check for last hit opportunities
        this.tryLastHit();
        
        // Check for jungle opportunities
        if (this.shouldJungle()) {
            this.controller.stateMachine.setState('jungling');
            return;
        }
        
        // Get lane position
        const lanePos = this.getLanePosition(this.assignedLane, 0.4);
        if (!lanePos) return;
        
        // Apply movement with waypoints
        this.controller.movementOptimizer.setMovementTarget(lanePos, 'laning');
        
        // Farm minions if available
        this.farmMinions();
    }
    
    tryLastHit() {
        const now = Date.now();
        if (now - this.lastFarmTime < this.farmCooldown) return;

        const hero = this.controller.hero;
        const heroAttackRange = hero.stats?.attackRange || 500;
        const heroAttackDamage = hero.stats?.attackDamage || 50;

        if (typeof MinionManager === 'undefined' || !MinionManager.getMinionsInRange) return false;

        const nearbyMinions = MinionManager.getMinionsInRange(hero.x, hero.y, heroAttackRange + 100)
            .filter(m => m.team !== hero.team);
        
        const lastHitTarget = nearbyMinions.find(m => 
            m.health <= heroAttackDamage * 1.2
        );
        
        if (lastHitTarget) {
            const shouldLastHit = this.controller.getDifficultySetting('perfectLastHit') ||
                                (this.controller.difficulty === 'nightmare') ||
                                (this.controller.difficulty === 'veryhard' && Math.random() < 0.9);
            
            if (shouldLastHit) {
                const dist = Utils.distance(hero.x, hero.y, lastHitTarget.x, lastHitTarget.y);
                if (dist <= heroAttackRange + (lastHitTarget.radius || 20)) {
                    hero.basicAttack(lastHitTarget);
                    this.lastFarmTime = now;
                    return true;
                }
            }
        }
        
        return false;
    }
    
    farmMinions() {
        const hero = this.controller.hero;
        const heroAttackRange = hero.stats?.attackRange || 500;

        if (typeof MinionManager === 'undefined' || !MinionManager.getMinionsInRange) return;

        const nearbyMinions = MinionManager.getMinionsInRange(hero.x, hero.y, heroAttackRange + 100)
            .filter(m => m.team !== hero.team);
        
        if (nearbyMinions.length === 0) return;
        
        // Prioritize minions based on type
        const minionPriority = this.controller.getFarmingSetting('minionPriority');
        
        let bestMinion = null;
        let bestPriority = -1;
        
        for (const minion of nearbyMinions) {
            let priority = 0;
            
            // Determine minion type
            if (minion.type === 'siege') {
                priority = minionPriority.cannon;
            } else if (minion.type === 'ranged') {
                priority = minionPriority.ranged;
            } else {
                priority = minionPriority.melee;
            }
            
            // Bonus for low health minions
            const minionMaxHealth = minion.type === 'siege' ? 800 : minion.type === 'ranged' ? 280 : 450;
            const healthPercent = (minion.health || 0) / minionMaxHealth;
            priority += (1 - healthPercent) * 0.2;
            
            if (priority > bestPriority) {
                bestPriority = priority;
                bestMinion = minion;
            }
        }
        
        if (bestMinion) {
            const dist = Utils.distance(hero.x, hero.y, bestMinion.x, bestMinion.y);
            if (dist <= heroAttackRange + (bestMinion.radius || 20)) {
                hero.basicAttack(bestMinion);
            } else {
                // Move towards the minion
                const targetPos = {
                    x: bestMinion.x + (Math.random() - 0.5) * 50,
                    y: bestMinion.y + (Math.random() - 0.5) * 50
                };
                this.controller.movementOptimizer.setMovementTarget(targetPos, 'farming');
            }
        }
    }
    
    shouldJungle() {
        const hero = this.controller.hero;
        const jungleRate = this.controller.getDifficultySetting('jungleRate');
        
        // Don't jungle if low health
        const maxHealth = hero.stats?.maxHealth || hero.health || 100;
        const healthPercent = (hero.health || 0) / maxHealth;
        if (healthPercent < 0.5) return false;
        
        // Check if there are enemy minions nearby
        let enemyMinions = [];
        if (typeof MinionManager !== 'undefined' && MinionManager.getMinionsInRange) {
            enemyMinions = MinionManager.getMinionsInRange(hero.x, hero.y, 800)
                .filter(m => m.team !== hero.team);
        }
        
        // Only jungle if no enemy minions or random chance based on jungle rate
        if (enemyMinions.length === 0 && Math.random() < jungleRate) {
            const nearestCamp = this.findNearestJungleCamp();
            return nearestCamp !== null;
        }
        
        return false;
    }
    
    findNearestJungleCamp() {
        if (typeof CreatureManager === 'undefined' || !CreatureManager.camps || CreatureManager.camps.length === 0) {
            return null;
        }
        
        let nearest = null;
        let nearestDist = Infinity;
        const hero = this.controller.hero;
        
        for (const camp of CreatureManager.camps) {
            if (camp.isCleared) continue;
            
            const dist = Utils.distance(hero.x, hero.y, camp.x, camp.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = camp;
            }
        }
        
        return nearestDist < 1000 ? nearest : null;
    }
    
    getLanePosition(lane, progress) {
        if (typeof MinionManager === 'undefined' || !MinionManager.waypoints) {
            return { x: CONFIG.map.width / 2, y: CONFIG.map.height / 2 };
        }

        const waypoints = this.controller.hero.team === CONFIG.teams.BLUE
            ? MinionManager.waypoints.blue[lane]
            : MinionManager.waypoints.red[lane];
        
        if (!waypoints || waypoints.length === 0) {
            return { x: CONFIG.map.width / 2, y: CONFIG.map.height / 2 };
        }
        
        const index = Math.floor(progress * (waypoints.length - 1));
        return waypoints[Math.min(index, waypoints.length - 1)];
    }
    
    getAssignedLane() {
        return this.assignedLane;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LaneBehavior;
}