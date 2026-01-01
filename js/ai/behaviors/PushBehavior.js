/**
 * ========================================
 * Push Behavior
 * ========================================
 * Handles tower pushing and objective focus
 */

class PushBehavior {
    constructor(controller) {
        this.controller = controller;
        this.targetTower = null;
        this.lastPushTime = 0;
        this.pushCooldown = 1000; // 1 second between push attempts
    }
    
    initialize() {
        // Initialization if needed
    }
    
    execute(deltaTime, entities) {
        const hero = this.controller.hero;
        
        // Find target tower
        this.findTargetTower();
        
        if (!this.targetTower || !this.targetTower.isAlive) {
            // No tower to push, switch back to laning
            this.controller.stateMachine.setState('laning');
            return;
        }
        
        const dist = Utils.distance(hero.x, hero.y, this.targetTower.x, this.targetTower.y);
        
        // Check if we have enough minions
        const myMinions = this.getNearbyAlliedMinions();
        
        if (myMinions.length < 2) {
            // Not enough minions, fall back to laning
            this.controller.stateMachine.setState('laning');
            return;
        }
        
        // Attack tower if in range
        const heroAttackRange = hero.stats?.attackRange || 500;
        const towerRadius = this.targetTower.radius || 100;
        
        if (dist <= heroAttackRange + towerRadius) {
            if (this.targetTower.currentTarget && this.targetTower.currentTarget.type === 'minion') {
                hero.basicAttack(this.targetTower);
            }
        } else {
            // Move towards tower
            this.moveToTower();
        }
    }
    
    findTargetTower() {
        const hero = this.controller.hero;

        // Get the next attackable tower in our lane
        if (typeof TowerManager === 'undefined' || !TowerManager.getNextAttackableTower) return;

        this.targetTower = TowerManager.getNextAttackableTower(hero.team, this.controller.laneBehavior.getAssignedLane());
    }
    
    getNearbyAlliedMinions() {
        const hero = this.controller.hero;

        if (typeof MinionManager === 'undefined' || !MinionManager.getMinionsInRange) return [];

        return MinionManager.getMinionsInRange(hero.x, hero.y, 400)
            .filter(m => m.team === hero.team);
    }
    
    moveToTower() {
        if (!this.targetTower) return;
        
        // Move to optimal position near tower
        const towerPos = this.getOptimalTowerPosition();
        this.controller.movementOptimizer.setMovementTarget(towerPos, 'pushing');
    }
    
    getOptimalTowerPosition() {
        if (!this.targetTower) return { x: this.controller.hero.x, y: this.controller.hero.y };
        
        const hero = this.controller.hero;
        const tower = this.targetTower;
        
        // Calculate position at max attack range from tower
        const angle = Utils.angleBetweenPoints(tower.x, tower.y, hero.x, hero.y);
        const heroAttackRange = hero.stats?.attackRange || 500;
        const optimalRange = heroAttackRange * 0.9;
        
        return {
            x: tower.x + Math.cos(angle) * optimalRange,
            y: tower.y + Math.sin(angle) * optimalRange
        };
    }
    
    // Check if we should continue pushing
    shouldContinuePushing() {
        const hero = this.controller.hero;
        
        // Don't push if low health
        const maxHealth = hero.stats?.maxHealth || hero.health || 100;
        const healthPercent = (hero.health || 0) / maxHealth;
        if (healthPercent < 0.4) return false;
        
        // Don't push if enemies are nearby and we're at disadvantage
        let enemies = [];
        let allies = [];
        if (typeof Combat !== 'undefined') {
            enemies = Combat.getEnemiesInRange(hero, 1000) || [];
            allies = Combat.getAlliesInRange(hero, 1000) || [];
        }

        if (enemies.length > allies.length + 1) return false;
        
        return true;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PushBehavior;
}