/**
 * ========================================
 * Jungle Behavior
 * ========================================
 * Handles jungle clearing and camp behavior
 */

class JungleBehavior {
    constructor(controller) {
        this.controller = controller;
        this.currentCamp = null;
        this.lastCampAttackTime = 0;
        this.campAttackCooldown = 500; // 500ms between attacks
    }
    
    initialize() {
        // Initialization if needed
    }
    
    execute(deltaTime, entities) {
        const hero = this.controller.hero;
        
        // Find nearest jungle camp if we don't have one
        if (!this.currentCamp || this.currentCamp.isCleared) {
            this.currentCamp = this.findNearestJungleCamp();
            if (!this.currentCamp) {
                // No camps available, switch back to laning
                this.controller.stateMachine.setState('laning');
                return;
            }
        }
        
        // Attack jungle creatures
        this.attackJungleCamp();
        
        // Check if we should stop jungling
        if (this.shouldStopJungling()) {
            this.controller.stateMachine.setState('laning');
        }
    }
    
    findNearestJungleCamp() {
        if (!CreatureManager.camps || CreatureManager.camps.length === 0) {
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
    
    attackJungleCamp() {
        const now = Date.now();
        if (now - this.lastCampAttackTime < this.campAttackCooldown) return;
        
        if (!this.currentCamp) return;
        
        const hero = this.controller.hero;
        const creature = this.currentCamp.creatures.find(c => c.isAlive);
        
        if (!creature) {
            this.currentCamp = null;
            return;
        }
        
        const dist = Utils.distance(hero.x, hero.y, creature.x, creature.y);
        
        if (dist <= hero.stats.attackRange + creature.radius) {
            hero.basicAttack(creature);
            
            // Use abilities if appropriate
            this.useJungleAbilities(creature);
            
            this.lastCampAttackTime = now;
        } else {
            // Move towards creature
            this.moveToCreature(creature);
        }
    }
    
    useJungleAbilities(creature) {
        const hero = this.controller.hero;
        
        // Use abilities based on difficulty
        const skillUsage = this.controller.getDifficultySetting('skillUsage');
        
        for (const key of ['q', 'e', 'r']) {
            const ability = hero.heroData.abilities[key];
            if (!ability) continue;
            
            if (hero.abilityCooldowns[key] <= 0 && hero.abilityLevels[key] > 0) {
                if (Math.random() < skillUsage) {
                    hero.useAbility(key, creature.x, creature.y, creature);
                    return true;
                }
            }
        }
        
        return false;
    }
    
    moveToCreature(creature) {
        const hero = this.controller.hero;
        
        // Calculate optimal position for attacking creature
        const angle = Utils.angleBetweenPoints(creature.x, creature.y, hero.x, hero.y);
        const optimalRange = hero.stats.attackRange * 0.9;
        
        const targetPos = {
            x: creature.x + Math.cos(angle) * optimalRange,
            y: creature.y + Math.sin(angle) * optimalRange
        };
        
        this.controller.systems.movementOptimizer.setMovementTarget(targetPos, 'jungling');
    }
    
    shouldStopJungling() {
        const hero = this.controller.hero;
        
        // Stop if low health
        const healthPercent = hero.health / hero.stats.maxHealth;
        if (healthPercent < 0.3) return true;
        
        // Stop if enemies are nearby
        const enemies = Combat.getEnemiesInRange(hero, 800);
        if (enemies.length > 0) return true;
        
        // Stop if no camps available
        if (!this.currentCamp) return true;
        
        return false;
    }
    
    // Check if we should smite/secure jungle objectives
    shouldSecureObjective(creature) {
        if (!creature || creature.health > 200) return false;
        
        const hero = this.controller.hero;
        
        // Check if we have smite or similar ability
        if (hero.spell === 'smite' && hero.spellCooldown <= 0) {
            return true;
        }
        
        // Check for abilities that can secure
        for (const key of ['q', 'e', 'r', 't']) {
            const ability = hero.heroData.abilities[key];
            if (ability && ability.type === 'execute' && 
                hero.abilityCooldowns[key] <= 0 && hero.abilityLevels[key] > 0) {
                return true;
            }
        }
        
        return false;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JungleBehavior;
}