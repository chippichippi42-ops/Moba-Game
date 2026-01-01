/**
 * ========================================
 * Combat Behavior
 * ========================================
 * Handles combat and fighting behavior
 */

class CombatBehavior {
    constructor(controller) {
        this.controller = controller;
        this.lastComboTime = 0;
        this.comboCooldown = 1000; // 1 second between combos
    }
    
    initialize() {
        // Initialization if needed
    }
    
    execute(deltaTime, entities) {
        const hero = this.controller.hero;
        const target = this.controller.decisionMaker.getCurrentTarget();
        
        if (!target || !target.isAlive) {
            // No valid target, switch back to laning
            this.controller.stateMachine.setState('laning');
            return;
        }
        
        const dist = Utils.distance(hero.x, hero.y, target.x, target.y);
        
        // Use combo if available
        this.tryCombo(target);
        
        // Position optimally
        this.positionForCombat(target, dist);
        
        // Basic attack if in range
        if (dist <= hero.stats.attackRange + target.radius) {
            hero.basicAttack(target);
        }
    }
    
    tryCombo(target) {
        const now = Date.now();
        if (now - this.lastComboTime < this.comboCooldown) return;
        
        const hero = this.controller.hero;
        const comboExecutor = this.controller.systems.comboExecutor;
        
        // Let combo executor handle the combo
        comboExecutor.executeBestCombo(hero, target, 'all_in');
        
        this.lastComboTime = now;
    }
    
    positionForCombat(target, currentDistance) {
        const hero = this.controller.hero;
        const idealRange = hero.stats.attackRange * this.controller.getTargetingSetting('preferredRangePercentage');
        
        if (currentDistance < idealRange - 50) {
            // Too close, move back
            const angle = Utils.angleBetweenPoints(target.x, target.y, hero.x, hero.y);
            const retreatPos = {
                x: hero.x + Math.cos(angle) * 100,
                y: hero.y + Math.sin(angle) * 100
            };
            this.controller.systems.movementOptimizer.setMovementTarget(retreatPos, 'kiting');
        } else if (currentDistance > idealRange + 50) {
            // Too far, move closer
            const approachPos = {
                x: target.x + (Math.random() - 0.5) * 50,
                y: target.y + (Math.random() - 0.5) * 50
            };
            this.controller.systems.movementOptimizer.setMovementTarget(approachPos, 'chasing');
        } else {
            // At ideal range, stop moving or strafe
            if (Math.random() < 0.3) {
                // Random strafing
                const strafeAngle = Utils.angleBetweenPoints(hero.x, hero.y, target.x, target.y) + 
                                    (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2);
                const strafePos = {
                    x: hero.x + Math.cos(strafeAngle) * 50,
                    y: hero.y + Math.sin(strafeAngle) * 50
                };
                this.controller.systems.movementOptimizer.setMovementTarget(strafePos, 'strafing');
            } else {
                this.controller.systems.movementOptimizer.clearMovementTarget();
            }
        }
    }
    
    // Use defensive abilities if needed
    useDefensiveAbilities() {
        const hero = this.controller.hero;
        const maxHealth = hero.stats?.maxHealth || hero.health || 100;
        const healthPercent = (hero.health || 0) / maxHealth;
        
        if (healthPercent < 0.3 && hero.heroData && hero.heroData.abilities) {
            // Look for healing or shield abilities
            for (const key of ['e', 'r', 'q']) {
                const ability = hero.heroData.abilities[key];
                if (!ability) continue;
                
                if ((ability.effects && ability.effects.includes('heal')) ||
                    (ability.effects && ability.effects.includes('shield'))) {
                    if (hero.abilityCooldowns && hero.abilityCooldowns[key] <= 0 && 
                        hero.abilityLevels && hero.abilityLevels[key] > 0) {
                        hero.useAbility(key, hero.x, hero.y, hero);
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // Use offensive abilities
    useOffensiveAbilities(target) {
        const hero = this.controller.hero;
        
        for (const key of ['q', 'e', 'r', 't']) {
            const ability = hero.heroData.abilities[key];
            if (!ability) continue;
            
            if (ability.type === 'damage' || ability.type === 'skillshot') {
                if (hero.abilityCooldowns[key] <= 0 && hero.abilityLevels[key] > 0) {
                    if (Math.random() < this.controller.getDifficultySetting('skillUsage')) {
                        hero.useAbility(key, target.x, target.y, target);
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatBehavior;
}