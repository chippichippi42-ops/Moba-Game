/**
 * ========================================
 * MOBA Arena - Minimap System
 * ========================================
 * Hiển thị minimap và vision system
 */

const Minimap = {
    canvas: null,
    ctx: null,
    
    // Dimensions
    width: CONFIG.ui.minimapSize,
    height: CONFIG.ui.minimapSize,
    
    // Scale factor
    scale: 0,
    
    // Visibility tracking
    visibleEnemies: new Set(),
    
    // Cache
    backgroundCache: null,
    
    /**
     * Khởi tạo minimap
     */
    init() {
        this.canvas = document.getElementById('minimapCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set actual size
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Calculate scale
        this.scale = this.width / CONFIG.map.width;
        
        // Generate background cache
        this.generateBackgroundCache();
    },
    
    /**
     * Generate cached background
     */
    generateBackgroundCache() {
        this.backgroundCache = document.createElement('canvas');
        this.backgroundCache.width = this.width;
        this.backgroundCache.height = this.height;
        
        const ctx = this.backgroundCache.getContext('2d');
        
        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Map terrain (simplified)
        ctx.fillStyle = CONFIG.colors.grass;
        ctx.fillRect(2, 2, this.width - 4, this.height - 4);
        
        // River
        ctx.strokeStyle = CONFIG.colors.river;
        ctx.lineWidth = 8 * this.scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(5, 5);
        ctx.lineTo(this.width - 5, this.height - 5);
        ctx.stroke();
        
        // Lanes
        ctx.strokeStyle = CONFIG.colors.path;
        ctx.lineWidth = 15 * this.scale;
        
        // Top lane
        ctx.beginPath();
        ctx.moveTo(5, this.height - 5);
        ctx.lineTo(5, 5);
        ctx.lineTo(this.width - 5, 5);
        ctx.stroke();
        
        // Mid lane
        ctx.beginPath();
        ctx.moveTo(5, this.height - 5);
        ctx.lineTo(this.width - 5, 5);
        ctx.stroke();
        
        // Bot lane
        ctx.beginPath();
        ctx.moveTo(5, this.height - 5);
        ctx.lineTo(this.width - 5, this.height - 5);
        ctx.lineTo(this.width - 5, 5);
        ctx.stroke();
        
        // Bases
        const baseSize = 30 * this.scale;
        
        // Blue base
        ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(5, this.height - 5, baseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Red base
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.beginPath();
        ctx.arc(this.width - 5, 5, baseSize, 0, Math.PI * 2);
        ctx.fill();
    },
    
    /**
     * Update minimap
     */
    update(deltaTime) {
        // Update visibility
        this.updateVisibility();
    },
    
    /**
     * Update enemy visibility
     */
    updateVisibility() {
        this.visibleEnemies.clear();
        
        const playerTeam = HeroManager.player?.team;
        if (playerTeam === undefined) return;
        
        // Check each enemy
        for (const hero of HeroManager.heroes) {
            if (hero.team === playerTeam) continue;
            if (!hero.isAlive) continue;
            
            // Check visibility conditions
            if (this.isVisible(hero, playerTeam)) {
                this.visibleEnemies.add(hero.id);
            }
        }
    },
    
    /**
     * Check if entity is visible to team
     */
    isVisible(entity, viewerTeam) {
        // Check if in vision range of any ally
        
        // Ally heroes
        for (const hero of HeroManager.heroes) {
            if (hero.team !== viewerTeam) continue;
            if (!hero.isAlive) continue;
            
            const dist = Utils.distance(hero.x, hero.y, entity.x, entity.y);
            if (dist <= CONFIG.hero.visionRange) {
                // In brush check
                if (entity.isInBrush && entity.isInBrush() && !hero.isInBrush()) {
                    continue;
                }
                // Invisible check
                if (entity.invisible) {
                    continue;
                }
                return true;
            }
        }
        
        // Ally minions
        for (const minion of MinionManager.minions) {
            if (minion.team !== viewerTeam) continue;
            if (!minion.isAlive) continue;
            
            const dist = Utils.distance(minion.x, minion.y, entity.x, entity.y);
            if (dist <= CONFIG.minion.visionRange) {
                return true;
            }
        }
        
        // Ally towers
        for (const tower of TowerManager.towers) {
            if (tower.team !== viewerTeam) continue;
            if (!tower.isAlive) continue;
            
            const dist = Utils.distance(tower.x, tower.y, entity.x, entity.y);
            if (dist <= CONFIG.tower.attackRange) {
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * Render minimap
     */
    render() {
        if (!this.ctx) return;
        
        // Clear
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw cached background
        if (this.backgroundCache) {
            this.ctx.drawImage(this.backgroundCache, 0, 0);
        }
        
        // Draw towers
        this.renderTowers();
        
        // Draw minions (small dots)
        this.renderMinions();
        
        // Draw creatures
        this.renderCreatures();
        
        // Draw heroes
        this.renderHeroes();
        
        // Draw camera viewport
        this.renderViewport();
        
        // Border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.width, this.height);
    },
    
    /**
     * Render towers on minimap
     */
    renderTowers() {
        for (const tower of TowerManager.towers) {
            const x = tower.x * this.scale;
            const y = tower.y * this.scale;
            
            // Color based on team and status
            if (!tower.isAlive) {
                this.ctx.fillStyle = '#333333';
            } else if (tower.team === CONFIG.teams.BLUE) {
                this.ctx.fillStyle = tower.towerType === 'main' ? '#00d4ff' : '#0099cc';
            } else {
                this.ctx.fillStyle = tower.towerType === 'main' ? '#ef4444' : '#b91c1c';
            }
            
            // Size based on type
            const size = tower.towerType === 'main' ? 8 : 5;
            
            // Draw
            if (tower.towerType === 'main') {
                // Diamond shape for main tower
                this.ctx.beginPath();
                this.ctx.moveTo(x, y - size);
                this.ctx.lineTo(x + size, y);
                this.ctx.lineTo(x, y + size);
                this.ctx.lineTo(x - size, y);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                // Square for other towers
                this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
            }
        }
    },
    
    /**
     * Render minions on minimap
     */
    renderMinions() {
        const dotSize = 2;
        
        for (const minion of MinionManager.minions) {
            if (!minion.isAlive) continue;
            
            const x = minion.x * this.scale;
            const y = minion.y * this.scale;
            
            this.ctx.fillStyle = minion.team === CONFIG.teams.BLUE ? '#00d4ff' : '#ef4444';
            this.ctx.globalAlpha = 0.7;
            this.ctx.beginPath();
            this.ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
    },
    
    /**
     * Render creatures on minimap
     */
    renderCreatures() {
        for (const creature of CreatureManager.creatures) {
            if (!creature.isAlive) continue;
            
            const x = creature.x * this.scale;
            const y = creature.y * this.scale;
            
            this.ctx.fillStyle = CONFIG.colors.neutral;
            this.ctx.globalAlpha = 0.8;
            this.ctx.beginPath();
            this.ctx.arc(x, y, creature.creatureType === 'large' ? 4 : 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
    },
    
    /**
     * Render heroes on minimap
     */
    renderHeroes() {
        const playerTeam = HeroManager.player?.team;
        
        for (const hero of HeroManager.heroes) {
            if (!hero.isAlive) continue;
            
            const x = hero.x * this.scale;
            const y = hero.y * this.scale;
            
            // Check visibility for enemies
            if (hero.team !== playerTeam && !this.visibleEnemies.has(hero.id)) {
                continue;
            }
            
            // Color
            const isPlayer = hero === HeroManager.player;
            let color;
            
            if (isPlayer) {
                color = '#22c55e'; // Green for player
            } else if (hero.team === playerTeam) {
                color = '#00d4ff'; // Blue for ally
            } else {
                color = '#ef4444'; // Red for enemy
            }
            
            // Draw hero dot
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, isPlayer ? 6 : 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Direction indicator for player
            if (isPlayer) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(hero.facingAngle);
                this.ctx.moveTo(10, 0);
                this.ctx.lineTo(6, -3);
                this.ctx.lineTo(6, 3);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.restore();
            }
        }
    },
    
    /**
     * Render camera viewport rectangle
     */
    renderViewport() {
        if (!Camera) return;
        
        const bounds = Camera.getVisibleBounds();
        
        const x = bounds.left * this.scale;
        const y = bounds.top * this.scale;
        const w = bounds.width * this.scale;
        const h = bounds.height * this.scale;
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, w, h);
    },
    
    /**
     * Handle click on minimap
     */
    handleClick(clickX, clickY) {
        // Convert to world coordinates
        const rect = this.canvas.getBoundingClientRect();
        const x = (clickX - rect.left) / this.scale;
        const y = (clickY - rect.top) / this.scale;
        
        // Move camera to clicked position
        Camera.setTarget(x, y);
    },
    
    /**
     * Check if point is on minimap
     */
    isPointOnMinimap(screenX, screenY) {
        if (!this.canvas) return false;
        
        const rect = this.canvas.getBoundingClientRect();
        return screenX >= rect.left && screenX <= rect.right &&
               screenY >= rect.top && screenY <= rect.bottom;
    },
    
    /**
     * Convert world position to minimap position
     */
    worldToMinimap(worldX, worldY) {
        return {
            x: worldX * this.scale,
            y: worldY * this.scale
        };
    },
    
    /**
     * Convert minimap position to world position
     */
    minimapToWorld(minimapX, minimapY) {
        return {
            x: minimapX / this.scale,
            y: minimapY / this.scale
        };
    },
    
    /**
     * Ping location on minimap
     */
    ping(worldX, worldY, type = 'default') {
        // Create ping effect (to be implemented with visual/audio feedback)
        const mapPos = this.worldToMinimap(worldX, worldY);
        
        // TODO: Add ping animation and sound
        console.log(`Ping at ${worldX}, ${worldY}`);
    },
    
    /**
     * Reset minimap
     */
    reset() {
        this.visibleEnemies.clear();
        this.generateBackgroundCache();
    },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Minimap;
}