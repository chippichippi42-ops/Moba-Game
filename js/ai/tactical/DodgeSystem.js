/**
 * ========================================
 * Dodge System
 * ========================================
 * Handles all dodging mechanics (projectiles, abilities, obstacles)
 */

class DodgeSystem {
    constructor() {
        this.lastDodgeTime = 0;
        this.dodgeCooldown = 300; // 300ms between dodges
        this.dodgeDirection = null;
        this.obstacleCache = [];
        this.lastObstacleScan = 0;
    }
    
    initialize() {
        // Initialization if needed
    }
    
    update(deltaTime) {
        // Update obstacle cache periodically
        const now = Date.now();
        if (now - this.lastObstacleScan > 1000) {
            this.scanObstacles();
            this.lastObstacleScan = now;
        }
    }
    
    scanObstacles() {
        this.obstacleCache = [];
        
        // Add walls
        for (const wall of CONFIG.wallPositions) {
            this.obstacleCache.push({
                type: 'wall',
                x: wall.x + wall.width/2,
                y: wall.y + wall.height/2,
                width: wall.width,
                height: wall.height,
                radius: Math.max(wall.width, wall.height) / 2
            });
        }
    }
    
    shouldDodgeProjectiles(hero) {
        if (!ProjectileManager || !ProjectileManager.projectiles) return false;
        
        const now = Date.now();
        if (now - this.lastDodgeTime < this.dodgeCooldown) return false;
        
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
            
            if (willHit) {
                this.dodgeDirection = proj.angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2);
                return true;
            }
        }
        
        return false;
    }
    
    shouldDodgeAbilities() {
        // This would require more complex ability detection
        // For now, we'll return false
        return false;
    }
    
    shouldDodgeObstacles(hero) {
        for (const obstacle of this.obstacleCache) {
            const dist = Utils.distance(hero.x, hero.y, obstacle.x, obstacle.y);
            if (dist < CONFIG.aiDodge.obstacleMargin + hero.radius) {
                return true;
            }
        }
        
        return false;
    }
    
    getDodgeDirection() {
        return this.dodgeDirection;
    }
    
    calculateObstacleAvoidance(hero) {
        let avoidanceVector = { x: 0, y: 0 };
        
        for (const obstacle of this.obstacleCache) {
            const dist = Utils.distance(hero.x, hero.y, obstacle.x, obstacle.y);
            
            if (dist < CONFIG.aiDodge.obstacleScanRange) {
                // Calculate direction away from obstacle
                const angle = Utils.angleBetweenPoints(obstacle.x, obstacle.y, hero.x, hero.y);
                const avoidanceStrength = 1 - (dist / CONFIG.aiDodge.obstacleScanRange);
                
                avoidanceVector.x += Math.cos(angle) * avoidanceStrength;
                avoidanceVector.y += Math.sin(angle) * avoidanceStrength;
            }
        }
        
        // Normalize vector
        const length = Math.sqrt(avoidanceVector.x * avoidanceVector.x + avoidanceVector.y * avoidanceVector.y);
        if (length > 0) {
            avoidanceVector.x /= length;
            avoidanceVector.y /= length;
        }
        
        return avoidanceVector;
    }
    
    performDodge(hero, dodgeType = 'projectile') {
        const now = Date.now();
        if (now - this.lastDodgeTime < this.dodgeCooldown) return false;
        
        let dodgeAngle;
        
        switch (dodgeType) {
            case 'projectile':
                dodgeAngle = this.dodgeDirection;
                break;
            case 'obstacle':
                const avoidance = this.calculateObstacleAvoidance(hero);
                dodgeAngle = Math.atan2(avoidance.y, avoidance.x);
                break;
            case 'ability':
                // Random dodge for abilities
                dodgeAngle = Math.random() * Math.PI * 2;
                break;
        }
        
        if (dodgeAngle !== undefined) {
            const dodgeDist = 100 + Math.random() * 50;
            const dodgePos = {
                x: hero.x + Math.cos(dodgeAngle) * dodgeDist,
                y: hero.y + Math.sin(dodgeAngle) * dodgeDist
            };
            
            // Check if dodge position is valid
            if (!GameMap.checkWallCollision(dodgePos.x, dodgePos.y, hero.radius)) {
                // Move to dodge position
                hero.vx = Math.cos(dodgeAngle) * hero.stats.moveSpeed;
                hero.vy = Math.sin(dodgeAngle) * hero.stats.moveSpeed;
                hero.facingAngle = dodgeAngle;
                
                this.lastDodgeTime = now;
                return true;
            }
        }
        
        return false;
    }
    
    // Check if hero is in danger from obstacles
    isInObstacleDanger(hero) {
        for (const obstacle of this.obstacleCache) {
            const dist = Utils.distance(hero.x, hero.y, obstacle.x, obstacle.y);
            if (dist < CONFIG.aiDodge.obstacleMargin + hero.radius) {
                return true;
            }
        }
        
        return false;
    }
    
    // Get safe direction away from obstacles
    getSafeDirection(hero) {
        const avoidance = this.calculateObstacleAvoidance(hero);
        
        if (avoidance.x !== 0 || avoidance.y !== 0) {
            return Math.atan2(avoidance.y, avoidance.x);
        }
        
        return null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DodgeSystem;
}