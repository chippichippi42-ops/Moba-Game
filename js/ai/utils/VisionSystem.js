/**
 * ========================================
 * Vision System
 * ========================================
 * Handles vision, awareness, and map knowledge
 */

class VisionSystem {
    constructor() {
        this.visibleEnemies = new Map();
        this.lastSeenPositions = new Map();
        this.wardPositions = [];
        this.lastVisionUpdate = 0;
        this.visionUpdateInterval = 500; // Update every 500ms
    }
    
    initialize() {
        this.updateVision();
    }
    
    update(deltaTime, entities) {
        const now = Date.now();
        if (now - this.lastVisionUpdate >= this.visionUpdateInterval) {
            this.updateVision();
            this.lastVisionUpdate = now;
        }
        
        // Update last seen positions timeout
        this.updateLastSeenTimeouts();
    }
    
    updateVision() {
        this.visibleEnemies.clear();
        
        // Update based on hero vision
        if (HeroManager && HeroManager.heroes) {
            for (const hero of HeroManager.heroes) {
                if (hero.isAlive) {
                    this.updateHeroVision(hero);
                }
            }
        }
        
        // Update based on wards (placeholder)
        this.updateWardVision();
    }
    
    updateHeroVision(hero) {
        // Check for visible enemies
        if (typeof HeroManager !== 'undefined' && HeroManager.heroes) {
            for (const otherHero of HeroManager.heroes) {
                if (otherHero.team !== hero.team && otherHero.isAlive) {
                    const dist = Utils.distance(hero.x, hero.y, otherHero.x, otherHero.y);
                    const visionRange = hero.stats?.visionRange || 1000;

                    if (dist <= visionRange) {
                        // Check line of sight
                        if (this.hasLineOfSight(hero, otherHero)) {
                            this.visibleEnemies.set(otherHero.id, otherHero);
                            this.lastSeenPositions.set(otherHero.id, {
                                position: { x: otherHero.x, y: otherHero.y },
                                time: Date.now(),
                                heroId: otherHero.id
                            });
                        }
                    }
                }
            }
        }
    }
    
    updateWardVision() {
        // Placeholder for ward vision
        // In a full implementation, this would check ward positions
        // and add vision from those locations
    }
    
    hasLineOfSight(from, to) {
        // Simple line of sight check
        const steps = 5;
        
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = from.x + (to.x - from.x) * t;
            const y = from.y + (to.y - from.y) * t;
            
            // Check walls
            if (GameMap.checkWallCollision(x, y, 20)) {
                return false;
            }
        }
        
        return true;
    }
    
    updateLastSeenTimeouts() {
        const now = Date.now();
        const timeout = CONFIG.aiVision.lastSeenTimeout;
        
        for (const [heroId, lastSeen] of this.lastSeenPositions) {
            if (now - lastSeen.time > timeout) {
                this.lastSeenPositions.delete(heroId);
            }
        }
    }
    
    isHeroVisible(hero) {
        return this.visibleEnemies.has(hero.id);
    }
    
    getVisibleEnemies() {
        return Array.from(this.visibleEnemies.values());
    }
    
    getLastSeenPosition(heroId) {
        return this.lastSeenPositions.get(heroId);
    }
    
    getMapAwareness(hero) {
        // Calculate map awareness score
        const totalEnemies = 3; // 3v3 game
        const visibleEnemies = this.getVisibleEnemies().length;
        const lastSeenEnemies = this.lastSeenPositions.size;
        
        const awareness = (visibleEnemies + lastSeenEnemies * 0.5) / totalEnemies;
        
        return Math.min(awareness, 1.0);
    }
    
    getEnemyPositionPrediction(heroId) {
        const lastSeen = this.getLastSeenPosition(heroId);
        
        if (!lastSeen) return null;
        
        // Simple prediction - assume enemy continues in same direction
        // In a full implementation, this would use more sophisticated prediction
        
        const now = Date.now();
        const timeSinceSeen = now - lastSeen.time;
        
        // If seen recently, return last position
        if (timeSinceSeen < 2000) {
            return lastSeen.position;
        }
        
        // Simple extrapolation
        const hero = this.getHeroById(heroId);
        if (hero) {
            // Assume hero moves towards their base or lane
            const basePoint = GameMap.getSpawnPoint(hero.team);
            const direction = Utils.angleBetweenPoints(lastSeen.position.x, lastSeen.position.y, basePoint.x, basePoint.y);
            const predictedX = lastSeen.position.x + Math.cos(direction) * timeSinceSeen * 0.2;
            const predictedY = lastSeen.position.y + Math.sin(direction) * timeSinceSeen * 0.2;
            
            return { x: predictedX, y: predictedY };
        }
        
        return lastSeen.position;
    }
    
    getHeroById(heroId) {
        if (HeroManager && HeroManager.heroes) {
            return HeroManager.heroes.find(h => h.id === heroId);
        }
        return null;
    }
    
    // Add ward placement suggestions
    suggestWardPlacement(hero) {
        const suggestions = [];
        
        // Suggest wards based on enemy positions
        const visibleEnemies = this.getVisibleEnemies();
        const lastSeenEnemies = Array.from(this.lastSeenPositions.values());
        
        // Suggest wards near enemy jungle
        const enemyBase = GameMap.getSpawnPoint(hero.team === CONFIG.teams.BLUE ? CONFIG.teams.RED : CONFIG.teams.BLUE);
        
        suggestions.push({
            position: {
                x: enemyBase.x + (Math.random() - 0.5) * 1000,
                y: enemyBase.y + (Math.random() - 0.5) * 1000
            },
            priority: 0.8,
            reason: 'Enemy jungle vision'
        });
        
        // Suggest wards near river
        suggestions.push({
            position: {
                x: CONFIG.map.width / 2 + (Math.random() - 0.5) * 500,
                y: CONFIG.map.height / 2 + (Math.random() - 0.5) * 500
            },
            priority: 0.7,
            reason: 'River vision'
        });
        
        return suggestions;
    }
    
    // Check if area is visible
    isAreaVisible(x, y, range = 500) {
        // Check if any hero can see this area
        if (HeroManager && HeroManager.heroes) {
            for (const hero of HeroManager.heroes) {
                if (hero.team === this.getHeroTeam() && hero.isAlive) {
                    const dist = Utils.distance(hero.x, hero.y, x, y);
                    if (dist <= hero.stats.visionRange + range && this.hasLineOfSight(hero, { x, y })) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    getHeroTeam() {
        // Get the team of the hero using this vision system
        // This would be set by the controller in a full implementation
        return CONFIG.teams.BLUE; // Default
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisionSystem;
}