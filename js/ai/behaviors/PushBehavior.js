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
        if (!hero || !hero.isAlive) return;
        
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
        const attackRange = hero.stats?.attackRange ?? 0;
        const towerRadius = this.targetTower?.radius ?? 0;

        if (dist <= attackRange + towerRadius) {
            if (this.targetTower.currentTarget && this.targetTower.currentTarget.type === 'minion') {
                hero.basicAttack?.(this.targetTower);
            }
        } else {
            // Move towards tower
            this.moveToTower();
        }
    }
    
    findTargetTower() {
        const hero = this.controller.hero;
        if (!hero) {
            this.targetTower = null;
            return;
        }

        const lane = this.controller.laneBehavior?.getAssignedLane?.() ?? this.controller.behaviors?.laneBehavior?.getAssignedLane?.();
        if (typeof TowerManager === 'undefined' || !TowerManager.getNextAttackableTower || !lane) {
            this.targetTower = null;
            return;
        }

        // Get the next attackable tower in our lane
        this.targetTower = TowerManager.getNextAttackableTower(hero.team, lane);
    }
    
    getNearbyAlliedMinions() {
        const hero = this.controller.hero;
        
        return (typeof MinionManager !== 'undefined' && MinionManager.getMinionsInRange)
            ? MinionManager.getMinionsInRange(hero.x, hero.y, 400).filter(m => m.team === hero.team)
            : [];
    }
    
    moveToTower() {
        if (!this.targetTower) return;
        
        // Move to optimal position near tower
        const towerPos = this.getOptimalTowerPosition();
        this.controller.movementOptimizer?.setMovementTarget?.(towerPos, 'pushing');
    }
    
    getOptimalTowerPosition() {
        if (!this.targetTower) return { x: this.controller.hero.x, y: this.controller.hero.y };
        
        const hero = this.controller.hero;
        const tower = this.targetTower;
        if (!hero || !tower) return { x: this.controller.hero?.x ?? 0, y: this.controller.hero?.y ?? 0 };
        
        // Calculate position at max attack range from tower
        const angle = Utils.angleBetweenPoints(tower.x, tower.y, hero.x, hero.y);
        const optimalRange = (hero.stats?.attackRange ?? 0) * 0.9;
        
        return {
            x: tower.x + Math.cos(angle) * optimalRange,
            y: tower.y + Math.sin(angle) * optimalRange
        };
    }
    
    // Check if we should continue pushing
    shouldContinuePushing() {
        const hero = this.controller.hero;
        
        // Don't push if low health
        const healthRatio = Utils.getHealthRatio(hero, 1);
        if (healthRatio < 0.4) return false;
        
        // Don't push if enemies are nearby and we're at disadvantage
        const enemies = (typeof Combat !== 'undefined') ? Combat.getEnemiesInRange(hero, 1000) : [];
        const allies = (typeof Combat !== 'undefined') ? Combat.getAlliesInRange(hero, 1000) : [];
        
        if (enemies.length > allies.length + 1) return false;
        
        return true;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PushBehavior;
}