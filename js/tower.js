/**
 * ========================================
 * MOBA Arena - Tower System
 * ========================================
 * Quản lý trụ, base, và công trình
 */

const TowerManager = {
    towers: [],
    bases: [],
    isInitialized: false,  // Add initialization flag
    
    /**
     * Khởi tạo
     */
    init() {
        this.towers = [];
        this.bases = [];
        this.createTowers();
        this.isInitialized = true;  // Set to true after setup complete
        this.createBases();
    },
    
    /**
     * Tạo tất cả trụ
     */
    createTowers() {
        // Blue team towers
        this.createTeamTowers(CONFIG.teams.BLUE);
        
        // Red team towers
        this.createTeamTowers(CONFIG.teams.RED);
    },
    
    /**
     * Tạo trụ cho một team - Sử dụng vị trí từ GameMap
     */
    createTeamTowers(team) {
        const positions = team === CONFIG.teams.BLUE 
            ? GameMap.towerPositions.blue 
            : GameMap.towerPositions.red;
        const color = team === CONFIG.teams.BLUE 
            ? CONFIG.colors.blueTeam 
            : CONFIG.colors.redTeam;
        
        // Main tower (Nexus)
        this.towers.push(new Tower({
            x: positions.main.x,
            y: positions.main.y,
            team: team,
            type: 'main',
            health: CONFIG.tower.mainHealth,
            damage: CONFIG.tower.mainDamage,
            color: color,
            name: team === CONFIG.teams.BLUE ? 'Trụ Chính Xanh' : 'Trụ Chính Đỏ',
        }));
        
        // Lane towers
        const lanes = ['top', 'mid', 'bot'];
        const towerTypes = ['outer', 'inner', 'inhibitor'];
        const towerDamage = [CONFIG.tower.outerDamage, CONFIG.tower.innerDamage, CONFIG.tower.inhibitorDamage];
        const towerHealth = [CONFIG.tower.outerHealth, CONFIG.tower.innerHealth, CONFIG.tower.inhibitorHealth];
        
        for (const lane of lanes) {
            const lanePositions = positions[lane];
            
            for (let i = 0; i < lanePositions.length; i++) {
                const pos = lanePositions[i];
                
                this.towers.push(new Tower({
                    x: pos.x,
                    y: pos.y,
                    team: team,
                    type: towerTypes[i],
                    lane: lane,
                    health: towerHealth[i],
                    damage: towerDamage[i],
                    color: color,
                    name: `${lane.toUpperCase()} ${towerTypes[i]}`,
                    index: i,
                }));
            }
        }
    },
    
    /**
     * Tạo bases (Tế đàn)
     */
    createBases() {
        // Blue base
        this.bases.push({
            team: CONFIG.teams.BLUE,
            x: GameMap.blueBase.healZone.x,
            y: GameMap.blueBase.healZone.y,
            radius: GameMap.blueBase.healZone.radius,
            damage: CONFIG.tower.baseDamage,
            attackRange: 400,
            color: CONFIG.colors.blueTeam,
            currentTarget: null,
            attackCooldown: 0,
            damageStacks: new Map(),
        });
        
        // Red base
        this.bases.push({
            team: CONFIG.teams.RED,
            x: GameMap.redBase.healZone.x,
            y: GameMap.redBase.healZone.y,
            radius: GameMap.redBase.healZone.radius,
            damage: CONFIG.tower.baseDamage,
            attackRange: 400,
            color: CONFIG.colors.redTeam,
            currentTarget: null,
            attackCooldown: 0,
            damageStacks: new Map(),
        });
    },
    
    /**
     * Update towers
     */
    update(deltaTime, entities) {
        // Update towers
        for (const tower of this.towers) {
            tower.update(deltaTime, entities);
        }
        
        // Update bases
        for (const base of this.bases) {
            this.updateBase(base, deltaTime, entities);
        }
    },
    
    /**
     * Update base attack
     */
    updateBase(base, deltaTime, entities) {
        base.attackCooldown -= deltaTime;
        
        if (base.attackCooldown <= 0) {
            // Find target
            let target = base.currentTarget;
            
            // Check if current target is still valid
            if (target) {
                const dist = Utils.distance(base.x, base.y, target.x, target.y);
                if (!target.isAlive || dist > base.attackRange || target.team === base.team) {
                    target = null;
                    base.currentTarget = null;
                }
            }
            
            // Find new target if needed
            if (!target) {
                let minDist = base.attackRange;
                
                for (const entity of entities) {
                    if (!entity.isAlive) continue;
                    if (entity.team === base.team) continue;
                    if (entity.untargetable) continue;
                    
                    const dist = Utils.distance(base.x, base.y, entity.x, entity.y);
                    if (dist < minDist) {
                        // Priority: minions > heroes
                        if (!target || (entity.type === 'minion' && target.type === 'hero')) {
                            minDist = dist;
                            target = entity;
                        }
                    }
                }
                
                base.currentTarget = target;
            }
            
            // Attack target
            if (target) {
                let damage = base.damage;
                
                // Apply damage stacks
                const stacks = base.damageStacks.get(target.id) || 0;
                damage *= (1 + stacks * CONFIG.tower.damageStackPercent);
                
                // Update stacks
                base.damageStacks.set(target.id, Math.min(stacks + 1, CONFIG.tower.maxDamageStacks));
                
                // Deal damage
                Combat.dealDamage(null, target, damage, 'true');
                
                // Create visual
                EffectManager.createExplosion(target.x, target.y, 30, base.color);
                
                base.attackCooldown = 1000 / CONFIG.tower.attackSpeed;
            }
        }
        
        // Reset stacks for entities out of range
        for (const [entityId, stacks] of base.damageStacks) {
            const entity = entities.find(e => e.id === entityId);
            if (!entity || !entity.isAlive || 
                Utils.distance(base.x, base.y, entity.x, entity.y) > base.attackRange) {
                base.damageStacks.delete(entityId);
            }
        }
    },
    
    /**
     * Render tower - UPDATED với main tower đẹp hơn
     */
    render(ctx) {
        if (!this.isAlive) {
            // Render ruins
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        
        if (this.towerType === 'main') {
            this.renderMainTower(ctx);
        } else {
            this.renderNormalTower(ctx);
        }
        
        // Range indicator when targeting
        if (this.currentTarget) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.attackRange, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        }
        
        // Health bar
        this.renderHealthBar(ctx);
    },

    /**
     * Render main tower (Nexus) - NEW
     */
    renderMainTower(ctx) {
        const size = this.radius * 1.5; // Lớn hơn
        const time = Date.now() / 1000;
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(
            this.x, this.y, size * 0.5,
            this.x, this.y, size * 2
        );
        glowGradient.addColorStop(0, this.color + '40');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Base platform
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(this.x, this.y + 10, size * 1.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Main structure - hexagonal base
        ctx.fillStyle = '#2a2a4e';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const x = this.x + Math.cos(angle) * size;
            const y = this.y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Inner glow ring
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.6 + Math.sin(time * 2) * 0.2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Central crystal
        const crystalSize = size * 0.5;
        const crystalGradient = ctx.createLinearGradient(
            this.x - crystalSize, this.y - crystalSize * 1.5,
            this.x + crystalSize, this.y + crystalSize
        );
        crystalGradient.addColorStop(0, '#ffffff');
        crystalGradient.addColorStop(0.3, this.color);
        crystalGradient.addColorStop(1, this.team === CONFIG.teams.BLUE ? '#0066aa' : '#aa2222');
        
        ctx.fillStyle = crystalGradient;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - crystalSize * 2);
        ctx.lineTo(this.x + crystalSize, this.y);
        ctx.lineTo(this.x, this.y + crystalSize * 0.5);
        ctx.lineTo(this.x - crystalSize, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Crystal highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(this.x - crystalSize * 0.3, this.y - crystalSize * 1.2);
        ctx.lineTo(this.x, this.y - crystalSize * 1.8);
        ctx.lineTo(this.x + crystalSize * 0.2, this.y - crystalSize);
        ctx.closePath();
        ctx.fill();
        
        // Energy particles
        ctx.fillStyle = this.color;
        for (let i = 0; i < 6; i++) {
            const angle = (time + i / 6 * Math.PI * 2) % (Math.PI * 2);
            const dist = size * 0.9;
            const px = this.x + Math.cos(angle) * dist;
            const py = this.y + Math.sin(angle) * dist;
            const particleSize = 4 + Math.sin(time * 3 + i) * 2;
            
            ctx.globalAlpha = 0.6 + Math.sin(time * 2 + i) * 0.3;
            ctx.beginPath();
            ctx.arc(px, py, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Team emblem glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 30;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y - crystalSize * 0.5, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    },

    /**
     * Render normal tower - RENAMED from original render logic
     */
    renderNormalTower(ctx) {
        // Tower base
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Tower body
        const gradient = ctx.createRadialGradient(
            this.x, this.y - 20, 10,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, '#1a1a2e');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Tower top (crystal)
        const crystalSize = 20;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - crystalSize * 1.5);
        ctx.lineTo(this.x + crystalSize * 0.7, this.y - crystalSize * 0.3);
        ctx.lineTo(this.x, this.y + crystalSize * 0.3);
        ctx.lineTo(this.x - crystalSize * 0.7, this.y - crystalSize * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.x, this.y - crystalSize * 0.5, crystalSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    },

    /**
     * Render health bar - UPDATED cho main tower
     */
    renderHealthBar(ctx) {
        const barWidth = this.towerType === 'main' ? this.radius * 3 : this.radius * 2;
        const barHeight = this.towerType === 'main' ? 14 : 10;
        const barY = this.y + (this.towerType === 'main' ? this.radius * 1.8 : this.radius + 15);
        
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(this.x - barWidth / 2 - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // Health fill
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : 
                        healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth / 2, barY, barWidth, barHeight);
    }
    
    /**
     * Get tower at position
     */
    getTowerAt(x, y, radius = 50) {
        for (const tower of this.towers) {
            const dist = Utils.distance(x, y, tower.x, tower.y);
            if (dist <= tower.radius + radius) {
                return tower;
            }
        }
        return null;
    },
    
    /**
     * Get all towers for team
     */
    getTeamTowers(team) {
        return this.towers.filter(t => t.team === team);
    },
    
    /**
     * Get alive towers
     */
    getAliveTowers(team = null) {
        return this.towers.filter(t => t.isAlive && (team === null || t.team === team));
    },
    
    /**
     * Check if lane tower is destroyed
     */
    isLaneTowerDestroyed(team, lane, index) {
        const tower = this.towers.find(t => 
            t.team === team && t.lane === lane && t.index === index
        );
        return tower ? !tower.isAlive : true;
    },
    
    /**
     * Get next attackable tower in lane
     */
    getNextAttackableTower(team, lane) {
        // Enemy towers
        const enemyTeam = team === CONFIG.teams.BLUE ? CONFIG.teams.RED : CONFIG.teams.BLUE;
        const enemyTowers = this.towers.filter(t => 
            t.team === enemyTeam && t.lane === lane && t.isAlive
        );
        
        if (enemyTowers.length === 0) {
            // No lane towers left, target main
            return this.towers.find(t => t.team === enemyTeam && t.type === 'main' && t.isAlive);
        }
        
        // Return outermost tower
        return enemyTowers[0];
    },
    
    /**
     * Clear all
     */
    clear() {
        this.towers = [];
        this.bases = [];
    },
    
    /**
     * Render all towers
     */
    render(ctx) {
        for (const tower of this.towers) {
            tower.render(ctx);
        }
    },

    /**
     * Render tower range indicators when enemy heroes are nearby
     */
    renderRangeIndicators(ctx, player) {
        if (!player || !player.isAlive) return;

        const rangeDistance = CONFIG.tower.rangeIndicatorDistance || 150;

        for (const tower of this.towers) {
            // Skip if tower is dead
            if (!tower.isAlive) continue;

            // Check if there's an enemy hero nearby
            let hasNearbyEnemy = false;
            for (const hero of HeroManager.heroes) {
                // Skip if not alive or same team as tower
                if (!hero.isAlive || hero.team === tower.team) continue;

                // Calculate distance from hero to tower attack range
                const distToTowerRange = Utils.distance(hero.x, hero.y, tower.x, tower.y) - tower.attackRange;

                // If hero is within rangeDistance of tower's attack range
                if (distToTowerRange < rangeDistance && distToTowerRange > -tower.attackRange) {
                    hasNearbyEnemy = true;
                    break;
                }
            }

            // Render indicator if enemy is nearby
            if (hasNearbyEnemy) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.5)'; // Yellow with 50% transparency
                ctx.beginPath();
                ctx.arc(tower.x, tower.y, tower.attackRange, 0, Math.PI * 2);
                ctx.fill();

                // Optional: Add a subtle border
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    },
};

/**
 * Tower Class
 */
class Tower {
    constructor(config) {
        this.id = Utils.generateId();
        this.type = 'tower';
        this.towerType = config.type; // main, outer, inner, inhibitor
        this.lane = config.lane || null;
        this.index = config.index ?? -1;
        this.name = config.name || 'Tower';
        
        this.x = config.x;
        this.y = config.y;
        this.radius = 60;
        
        this.team = config.team;
        this.color = config.color;
        
        this.maxHealth = config.health;
        this.health = config.health;
        this.damage = config.damage;
        this.attackRange = CONFIG.tower.attackRange;
        this.attackSpeed = CONFIG.tower.attackSpeed;
        
        this.isAlive = true;
        this.currentTarget = null;
        this.attackCooldown = 0;
        this.damageStacks = new Map();
        
        // Experience reward
        this.expReward = this.towerType === 'main' ? 500 : 200;
    }
    
    /**
     * Update tower
     */
    update(deltaTime, entities) {
        if (!this.isAlive) return;
        
        this.attackCooldown -= deltaTime;
        
        if (this.attackCooldown <= 0) {
            // Find target
            let target = this.currentTarget;
            
            // Check if current target is still valid
            if (target) {
                const dist = Utils.distance(this.x, this.y, target.x, target.y);
                if (!target.isAlive || dist > this.attackRange || target.team === this.team) {
                    target = null;
                    this.currentTarget = null;
                }
            }
            
            // Find new target if needed
            if (!target) {
                let minDist = this.attackRange;
                
                for (const entity of entities) {
                    if (!entity.isAlive) continue;
                    if (entity.team === this.team) continue;
                    if (entity.untargetable) continue;
                    
                    const dist = Utils.distance(this.x, this.y, entity.x, entity.y);
                    if (dist < minDist) {
                        // Priority: minions > heroes
                        if (!target || (entity.type === 'minion' && target.type === 'hero')) {
                            minDist = dist;
                            target = entity;
                        }
                    }
                }
                
                this.currentTarget = target;
            }
            
            // Attack target
            if (target) {
                let damage = this.damage;
                
                // Apply damage stacks
                const stacks = this.damageStacks.get(target.id) || 0;
                damage *= (1 + stacks * CONFIG.tower.damageStackPercent);
                
                // Update stacks
                this.damageStacks.set(target.id, Math.min(stacks + 1, CONFIG.tower.maxDamageStacks));
                
                // Deal damage
                Combat.dealDamage(this, target, damage, 'true');
                
                // Create visual
                EffectManager.createExplosion(target.x, target.y, 30, this.color);
                
                this.attackCooldown = 1000 / this.attackSpeed;
            }
        }
        
        // Reset stacks for entities out of range
        for (const [entityId, stacks] of this.damageStacks) {
            const entity = entities.find(e => e.id === entityId);
            if (!entity || !entity.isAlive || 
                Utils.distance(this.x, this.y, entity.x, entity.y) > this.attackRange) {
                this.damageStacks.delete(entityId);
            }
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TowerManager, Tower };
}
