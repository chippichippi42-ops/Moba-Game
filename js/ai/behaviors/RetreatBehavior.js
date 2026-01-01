/**
 * ========================================
 * Retreat Behavior
 * ========================================
 * Handles retreat and escape behavior
 */

class RetreatBehavior {
    constructor(controller) {
        this.controller = controller;
        this.lastEscapeAttempt = 0;
        this.escapeCooldown = 2000; // 2 seconds between escape attempts
    }
    
    initialize() {
        // Initialization if needed
    }
    
    execute(deltaTime, entities) {
        const hero = this.controller.hero;
        
        // Use escape abilities if available
        this.tryEscapeAbilities();
        
        // Move towards safety
        this.moveToSafety();
        
        // Check if we can stop retreating
        if (this.canStopRetreating()) {
            this.controller.stateMachine.setState('laning');
        }
    }
    
    tryEscapeAbilities() {
        const now = Date.now();
        if (now - this.lastEscapeAttempt < this.escapeCooldown) return;

        const hero = this.controller.hero;

        if (typeof GameMap === 'undefined' || !GameMap.getSpawnPoint) return false;

        const basePoint = GameMap.getSpawnPoint(hero.team);
        
        // Try to use dash/blink abilities
        for (const key of ['r', 'e', 'q']) {
            const ability = hero.heroData.abilities[key];
            if (!ability) continue;
            
            if (ability.type === 'dash' || ability.type === 'blink') {
                if (hero.abilityCooldowns[key] <= 0 && hero.abilityLevels[key] > 0) {
                    // Dash towards base
                    const escapeAngle = Utils.angleBetweenPoints(hero.x, hero.y, basePoint.x, basePoint.y);
                    const escapeX = hero.x + Math.cos(escapeAngle) * 400;
                    const escapeY = hero.y + Math.sin(escapeAngle) * 400;
                    
                    hero.useAbility(key, escapeX, escapeY);
                    this.lastEscapeAttempt = now;
                    return true;
                }
            }
        }
        
        // Try to use healing abilities
        if (hero.spell === 'heal' && hero.spellCooldown <= 0) {
            hero.useSpell(hero.x, hero.y);
            this.lastEscapeAttempt = now;
            return true;
        }
        
        // Try to use flash
        if (hero.spell === 'flash' && hero.spellCooldown <= 0) {
            let enemies = [];
            if (typeof Combat !== 'undefined') {
                enemies = Combat.getEnemiesInRange(hero, 500) || [];
            }
            if (enemies.length > 0) {
                const escapeAngle = Utils.angleBetweenPoints(hero.x, hero.y, basePoint.x, basePoint.y);
                hero.useSpell(
                    hero.x + Math.cos(escapeAngle) * 400,
                    hero.y + Math.sin(escapeAngle) * 400
                );
                this.lastEscapeAttempt = now;
                return true;
            }
        }

        return false;
    }
    
    moveToSafety() {
        const hero = this.controller.hero;

        if (typeof GameMap === 'undefined' || !GameMap.getSpawnPoint) return;

        const basePoint = GameMap.getSpawnPoint(hero.team);

        // Find the safest path to base
        const safePosition = this.findSafePosition();

        if (safePosition) {
            this.controller.movementOptimizer.setMovementTarget(safePosition, 'retreating');
        } else {
            // Fallback to direct path to base
            this.controller.movementOptimizer.setMovementTarget(basePoint, 'retreating');
        }
    }
    
    findSafePosition() {
        const hero = this.controller.hero;

        if (typeof GameMap === 'undefined' || !GameMap.getSpawnPoint) return null;

        const basePoint = GameMap.getSpawnPoint(hero.team);

        // Check if direct path to base is safe
        const directPathSafe = this.isPathSafe(hero.x, hero.y, basePoint.x, basePoint.y);
        
        if (directPathSafe) {
            return basePoint;
        }
        
        // Try to find alternative safe positions
        const testPositions = [
            { x: basePoint.x, y: basePoint.y },
            { x: basePoint.x + 200, y: basePoint.y },
            { x: basePoint.x - 200, y: basePoint.y },
            { x: basePoint.x, y: basePoint.y + 200 },
            { x: basePoint.x, y: basePoint.y - 200 }
        ];
        
        for (const pos of testPositions) {
            if (this.isPathSafe(hero.x, hero.y, pos.x, pos.y)) {
                return pos;
            }
        }
        
        return null;
    }
    
    isPathSafe(startX, startY, endX, endY) {
        // Check if path is clear of enemies
        let enemies = [];
        if (typeof Combat !== 'undefined') {
            enemies = Combat.getEnemiesInRange({ x: startX, y: startY }, 800) || [];
        }

        // Simple check - if there are enemies nearby, path might not be safe
        return enemies.length === 0;
    }
    
    canStopRetreating() {
        const hero = this.controller.hero;

        // Stop retreating if health is good
        const maxHealth = hero.stats?.maxHealth || hero.health || 100;
        const healthPercent = (hero.health || 0) / maxHealth;
        if (healthPercent > 0.7) return true;

        // Stop retreating if no enemies nearby
        let enemies = [];
        if (typeof Combat !== 'undefined') {
            enemies = Combat.getEnemiesInRange(hero, 1000) || [];
        }
        if (enemies.length === 0) return true;

        // Stop retreating if we're near base
        if (typeof GameMap === 'undefined' || !GameMap.getSpawnPoint) return false;

        const basePoint = GameMap.getSpawnPoint(hero.team);
        const distToBase = Utils.distance(hero.x, hero.y, basePoint.x, basePoint.y);
        if (distToBase < 1000) return true;

        return false;
    }
    
    // Use defensive positioning
    useDefensivePositioning() {
        const hero = this.controller.hero;

        let enemies = [];
        if (typeof Combat !== 'undefined') {
            enemies = Combat.getEnemiesInRange(hero, 800) || [];
        }

        if (enemies.length === 0) return;

        // Try to position behind minions or obstacles
        let minions = [];
        if (typeof MinionManager !== 'undefined' && MinionManager.getMinionsInRange) {
            minions = MinionManager.getMinionsInRange(hero.x, hero.y, 500)
                .filter(m => m.team === hero.team);
        }
        
        if (minions.length > 0) {
            // Move behind minions
            const minion = minions[0];
            const angle = Utils.angleBetweenPoints(enemies[0].x, enemies[0].y, minion.x, minion.y);
            const safePos = {
                x: minion.x + Math.cos(angle) * 100,
                y: minion.y + Math.sin(angle) * 100
            };

            this.controller.movementOptimizer.setMovementTarget(safePos, 'defensive');
            return true;
        }

        return false;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RetreatBehavior;
}