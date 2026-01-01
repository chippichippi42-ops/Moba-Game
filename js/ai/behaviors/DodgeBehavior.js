/**
 * ========================================
 * Dodge Behavior
 * ========================================
 * Handles dodging projectiles and abilities
 */

class DodgeBehavior {
    constructor(controller) {
        this.controller = controller;
        this.lastDodgeTime = 0;
        this.dodgeCooldown = 500; // 500ms between dodges
    }
    
    initialize() {
        // Initialization if needed
    }
    
    execute(deltaTime, entities) {
        const hero = this.controller.hero;
        if (!hero || !hero.isAlive) return;
        
        // Try to dodge incoming projectiles
        this.tryDodgeProjectiles();
        
        // Try to dodge abilities
        this.tryDodgeAbilities();
        
        // Try to avoid obstacles
        this.avoidObstacles();
        
        // Check if we can stop dodging
        if (this.canStopDodging()) {
            this.controller.stateMachine.setState('laning');
        }
    }
    
    tryDodgeProjectiles() {
        const now = Date.now();
        if (now - this.lastDodgeTime < this.dodgeCooldown) return;
        
        const hero = this.controller.hero;
        
        if (typeof ProjectileManager === 'undefined' || !ProjectileManager.projectiles) return;
        
        for (const proj of ProjectileManager.projectiles) {
            if (proj.team === hero.team) continue;
            
            const dist = Utils.distance(hero.x, hero.y, proj.x, proj.y);
            if (dist > CONFIG.aiDodge.projectilePredictionMs) continue;
            
            const timeToHit = dist / proj.speed;
            const projEndX = proj.x + Math.cos(proj.angle) * proj.speed * timeToHit;
            const projEndY = proj.y + Math.sin(proj.angle) * proj.speed * timeToHit;
            
            const willHit = Utils.lineCircleIntersection(
                proj.x, proj.y, projEndX, projEndY,
                hero.x, hero.y, hero.radius + proj.width / 2
            );
            
            if (willHit && Math.random() < this.controller.getDifficultySetting('dodgeProjectile')) {
                this.performDodge(proj);
                this.lastDodgeTime = now;
                return true;
            }
        }
        
        return false;
    }
    
    tryDodgeAbilities() {
        const hero = this.controller.hero;
        
        // This would be more complex in a full implementation
        // For now, we'll use the dodge system
        const shouldDodge = this.controller.systems.dodgeSystem.shouldDodgeAbilities();
        
        if (shouldDodge) {
            const dodgeDirection = this.controller.systems.dodgeSystem.getDodgeDirection();
            if (dodgeDirection) {
                this.performAbilityDodge(dodgeDirection);
                return true;
            }
        }
        
        return false;
    }
    
    avoidObstacles() {
        const hero = this.controller.hero;
        
        // Check for nearby walls and obstacles
        const obstacles = this.detectNearbyObstacles();
        
        if (obstacles.length > 0) {
            // Move away from obstacles
            const avoidDirection = this.calculateAvoidDirection(obstacles);
            if (avoidDirection) {
                const avoidPos = {
                    x: hero.x + Math.cos(avoidDirection) * 100,
                    y: hero.y + Math.sin(avoidDirection) * 100
                };
                this.controller.movementOptimizer?.setMovementTarget?.(avoidPos, 'avoiding');
                return true;
            }
        }
        
        return false;
    }
    
    detectNearbyObstacles() {
        const hero = this.controller.hero;
        const obstacles = [];
        
        // Check walls
        for (const wall of CONFIG.wallPositions) {
            const dist = Utils.distance(hero.x, hero.y, wall.x + wall.width/2, wall.y + wall.height/2);
            if (dist < CONFIG.aiDodge.obstacleScanRange + hero.radius) {
                obstacles.push({
                    type: 'wall',
                    x: wall.x + wall.width/2,
                    y: wall.y + wall.height/2,
                    width: wall.width,
                    height: wall.height
                });
            }
        }
        
        // Check towers
        if (typeof TowerManager !== 'undefined' && Array.isArray(TowerManager.towers)) {
            for (const tower of TowerManager.towers) {
                if (tower.team !== hero.team && tower.isAlive) {
                    const dist = Utils.distance(hero.x, hero.y, tower.x, tower.y);
                    if (dist < CONFIG.aiDodge.obstacleScanRange + hero.radius) {
                        obstacles.push({
                            type: 'tower',
                            x: tower.x,
                            y: tower.y,
                            radius: tower.radius
                        });
                    }
                }
            }
        }
        
        return obstacles;
    }
    
    calculateAvoidDirection(obstacles) {
        const hero = this.controller.hero;
        const avoidVectors = [];
        
        for (const obstacle of obstacles) {
            if (obstacle.type === 'wall') {
                // Avoid walls by moving away from center
                const angle = Utils.angleBetweenPoints(obstacle.x, obstacle.y, hero.x, hero.y);
                avoidVectors.push({
                    x: Math.cos(angle),
                    y: Math.sin(angle),
                    weight: 1.0
                });
            } else if (obstacle.type === 'tower') {
                // Avoid towers by moving away
                const angle = Utils.angleBetweenPoints(obstacle.x, obstacle.y, hero.x, hero.y);
                avoidVectors.push({
                    x: Math.cos(angle),
                    y: Math.sin(angle),
                    weight: 0.8
                });
            }
        }
        
        if (avoidVectors.length === 0) return null;
        
        // Calculate average avoid direction
        let avgX = 0, avgY = 0, totalWeight = 0;
        
        for (const vector of avoidVectors) {
            avgX += vector.x * vector.weight;
            avgY += vector.y * vector.weight;
            totalWeight += vector.weight;
        }
        
        if (totalWeight > 0) {
            avgX /= totalWeight;
            avgY /= totalWeight;
            return Math.atan2(avgY, avgX);
        }
        
        return null;
    }
    
    performDodge(projectile) {
        const hero = this.controller.hero;
        
        // Calculate dodge direction perpendicular to projectile
        const dodgeAngle = projectile.angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
        const dodgeDist = CONFIG.aiDodge.dodgeSideMargin;
        
        const dodgePos = {
            x: hero.x + Math.cos(dodgeAngle) * dodgeDist,
            y: hero.y + Math.sin(dodgeAngle) * dodgeDist
        };
        
        // Make sure dodge position is safe
        if (!GameMap.checkWallCollision(dodgePos.x, dodgePos.y, hero.radius)) {
            this.controller.movementOptimizer?.setMovementTarget?.(dodgePos, 'dodging');
        }
    }
    
    performAbilityDodge(dodgeDirection) {
        const hero = this.controller.hero;
        const dodgeDist = 150;
        
        const dodgePos = {
            x: hero.x + Math.cos(dodgeDirection) * dodgeDist,
            y: hero.y + Math.sin(dodgeDirection) * dodgeDist
        };
        
        if (!GameMap.checkWallCollision(dodgePos.x, dodgePos.y, hero.radius)) {
            this.controller.movementOptimizer?.setMovementTarget?.(dodgePos, 'dodging');
        }
    }
    
    canStopDodging() {
        const hero = this.controller.hero;
        
        // Stop dodging if no immediate threats
        const projectiles = this.detectIncomingProjectiles();
        if (projectiles.length === 0) {
            // Small delay to ensure we're safe
            return Date.now() - this.lastDodgeTime > 1000;
        }
        
        return false;
    }
    
    detectIncomingProjectiles() {
        const hero = this.controller.hero;
        const projectiles = [];
        
        if (typeof ProjectileManager === 'undefined' || !ProjectileManager.projectiles) return projectiles;
        
        for (const proj of ProjectileManager.projectiles) {
            if (proj.team === hero.team) continue;
            
            const dist = Utils.distance(hero.x, hero.y, proj.x, proj.y);
            if (dist > 800) continue;
            
            const timeToHit = dist / proj.speed;
            const projEndX = proj.x + Math.cos(proj.angle) * proj.speed * timeToHit;
            const projEndY = proj.y + Math.sin(proj.angle) * proj.speed * timeToHit;
            
            const willHit = Utils.lineCircleIntersection(
                proj.x, proj.y, projEndX, projEndY,
                hero.x, hero.y, hero.radius + proj.width / 2
            );
            
            if (willHit) {
                projectiles.push(proj);
            }
        }
        
        return projectiles;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DodgeBehavior;
}