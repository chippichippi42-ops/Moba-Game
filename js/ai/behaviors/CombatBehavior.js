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
        const attackRange = hero.stats?.attackRange || 500;
        const targetRadius = target.radius || 30;
        if (dist <= attackRange + targetRadius) {
            hero.basicAttack(target);
        }
    }
    
    tryCombo(target) {
        const now = Date.now();
        if (now - this.lastComboTime < this.comboCooldown) return;

        const hero = this.controller.hero;
        const comboExecutor = this.controller.comboExecutor;

        if (!comboExecutor) return;
        
        // Let combo executor handle the combo
        comboExecutor.executeBestCombo(hero, target, 'all_in');
        
        this.lastComboTime = now;
    }
    
    positionForCombat(target, currentDistance) {
        const hero = this.controller.hero;
        const attackRange = hero.stats?.attackRange || 500;
        const idealRange = attackRange * this.controller.getTargetingSetting('preferredRangePercentage');

        if (currentDistance < idealRange - 50) {
            // Too close, move back
            const angle = Utils.angleBetweenPoints(target.x, target.y, hero.x, hero.y);
            const retreatPos = {
                x: hero.x + Math.cos(angle) * 100,
                y: hero.y + Math.sin(angle) * 100
            };
            this.controller.movementOptimizer.setMovementTarget(retreatPos, 'kiting');
        } else if (currentDistance > idealRange + 50) {
            // Too far, move closer
            const approachPos = {
                x: target.x + (Math.random() - 0.5) * 50,
                y: target.y + (Math.random() - 0.5) * 50
            };
            this.controller.movementOptimizer.setMovementTarget(approachPos, 'chasing');
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
                this.controller.movementOptimizer.setMovementTarget(strafePos, 'strafing');
            } else {
                this.controller.movementOptimizer.clearMovementTarget();
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

    // Predictive movement interception
    interceptMovingTarget(target, hero) {
        // Predict target position after 0.8s
        const predictedPos = this.predictTargetPosition(target, 0.8);

        const distance = Utils.distance(hero.x, hero.y, predictedPos.x, predictedPos.y);
        const heroAttackRange = hero.stats?.attackRange || 500;

        // If target running into us, dash intercept
        if (distance < 200 && this.canDashIntercept()) {
            this.controller.movementOptimizer.useDashToChase(target);
            return;
        }

        // Move to intercept point
        this.moveToInterceptPoint(predictedPos, target);
    }

    predictTargetPosition(target, timeAhead = 0.5) {
        // Simple linear prediction
        return {
            x: target.x + (target.vx || 0) * timeAhead,
            y: target.y + (target.vy || 0) * timeAhead
        };
    }

    moveToInterceptPoint(predictedPos, actualTarget) {
        // Move to intercept point instead of current target position
        this.controller.movementOptimizer.setMovementTarget(predictedPos, 'intercepting');
    }

    canDashIntercept() {
        const hero = this.controller.hero;
        if (!hero.heroData || !hero.heroData.abilities) return false;
        if (!hero.abilityCooldowns) return false;

        // Check if has dash ability ready
        for (const key of ['e', 'r', 'q']) {
            const ability = hero.heroData.abilities[key];
            if (ability && (ability.isDash || ability.type === 'dash')) {
                if (hero.abilityCooldowns[key] <= 0 && hero.abilityLevels[key] > 0) {
                    return true;
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