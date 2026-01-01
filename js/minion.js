/**
 * ========================================
 * MOBA Arena - Minion System (Improved Graphics)
 * ========================================
 */

const MinionManager = {
    minions: [],
    spawnTimer: 0,
    waveNumber: 0,
    firstWaveCountdown: 10000, // 10 giây đếm ngược
    firstWaveSpawned: false,
    
    waypoints: {
        blue: { top: [], mid: [], bot: [] },
        red: { top: [], mid: [], bot: [] },
    },
    
    init() {
        this.minions = [];
        this.spawnTimer = CONFIG.game.minionSpawnInterval;
        this.waveNumber = 0;
        this.firstWaveCountdown = 10000;
        this.firstWaveSpawned = false;
        this.generateWaypoints();
    },
    
    generateWaypoints() {
        const w = CONFIG.map.width;
        const h = CONFIG.map.height;
        
        // Blue team waypoints
        this.waypoints.blue = {
            top: [
                { x: 500, y: h - 700 },
                { x: 500, y: 500 },
                { x: w - 700, y: 500 },
                { x: w - 300, y: 300 },
            ],
            mid: [
                { x: 800, y: h - 800 },
                { x: w / 2, y: h / 2 },
                { x: w - 800, y: 800 },
                { x: w - 300, y: 300 },
            ],
            bot: [
                { x: 700, y: h - 500 },
                { x: w - 500, y: h - 500 },
                { x: w - 500, y: 700 },
                { x: w - 300, y: 300 },
            ],
        };
        
        // Red team waypoints
        this.waypoints.red = {
            top: [
                { x: w - 500, y: 700 },
                { x: w - 500, y: h - 500 },
                { x: 500, y: h - 500 },
                { x: 300, y: h - 300 },
            ],
            mid: [
                { x: w - 800, y: 800 },
                { x: w / 2, y: h / 2 },
                { x: 800, y: h - 800 },
                { x: 300, y: h - 300 },
            ],
            bot: [
                { x: w - 700, y: 500 },
                { x: 500, y: 500 },
                { x: 500, y: h - 700 },
                { x: 300, y: h - 300 },
            ],
        };
    },
	
	 /**
     * Lấy vị trí trụ chính để spawn lính
     */
    getMainTowerSpawnPoint(team) {
        const mainTower = TowerManager.towers.find(t => 
            t.team === team && t.towerType === 'main'
        );
        
        if (mainTower) {
            return { x: mainTower.x, y: mainTower.y };
        }
        
        // Fallback to base spawn point
        return team === CONFIG.teams.BLUE 
            ? { x: 600, y: CONFIG.map.height - 600 }
            : { x: CONFIG.map.width - 600, y: 600 };
    },
    
    update(deltaTime, entities) {
        // Xử lý đếm ngược wave đầu tiên
        if (!this.firstWaveSpawned) {
            this.firstWaveCountdown -= deltaTime;
            
            // Cập nhật UI đếm ngược
            this.updateFirstWaveCountdown();
            
            if (this.firstWaveCountdown <= 0) {
                this.spawnWave();
                this.firstWaveSpawned = true;
                this.spawnTimer = CONFIG.game.minionSpawnInterval;
                
                // Ẩn thông báo đếm ngược
                this.hideFirstWaveCountdown();
            }
        } else {
            // Spawn bình thường sau wave đầu
            this.spawnTimer -= deltaTime;
            if (this.spawnTimer <= 0) {
                this.spawnWave();
                this.spawnTimer = CONFIG.game.minionSpawnInterval;
                this.waveNumber++;
            }
        }
        
        for (let i = this.minions.length - 1; i >= 0; i--) {
            const minion = this.minions[i];
            minion.update(deltaTime, entities);
            
            if (!minion.isAlive) {
                this.minions.splice(i, 1);
            }
        }
    },
	
	    /**
     * Cập nhật UI đếm ngược wave đầu
     */
    updateFirstWaveCountdown() {
        let countdownEl = document.getElementById('firstWaveCountdown');
        
        if (!countdownEl) {
            countdownEl = document.createElement('div');
            countdownEl.id = 'firstWaveCountdown';
            countdownEl.style.cssText = `
                position: fixed;
                top: 120px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: #fbbf24;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 18px;
                font-weight: bold;
                z-index: 1000;
                border: 2px solid #fbbf24;
                text-align: center;
            `;
            document.body.appendChild(countdownEl);
        }
        
        const seconds = Math.ceil(this.firstWaveCountdown / 1000);
        countdownEl.innerHTML = `
            <div style="font-size: 14px; color: #94a3b8; margin-bottom: 5px;">LÍNH SẮP XUẤT HIỆN</div>
            <div style="font-size: 28px;">${seconds}s</div>
        `;
    },
    
	/**
	 * Ẩn đếm ngược
	 */
	hideFirstWaveCountdown() {
		const countdownEl = document.getElementById('firstWaveCountdown');
		if (countdownEl) {
			countdownEl.remove();
		}
	},
    
    spawnWave() {
        const lanes = ['top', 'mid', 'bot'];
        
        for (const lane of lanes) {
            this.spawnLaneMinions(CONFIG.teams.BLUE, lane);
            this.spawnLaneMinions(CONFIG.teams.RED, lane);
        }
        
        if (typeof AudioManager !== 'undefined') {
            AudioManager.play('minionSpawn', 0.3);
        }
    },
    
    spawnLaneMinions(team, lane) {
        // Spawn từ trụ chính thay vì tế đàn
        const spawnPoint = this.getMainTowerSpawnPoint(team);
        
        const waypoints = team === CONFIG.teams.BLUE 
            ? this.waypoints.blue[lane] 
            : this.waypoints.red[lane];
        
        // Offset dựa trên lane để lính không chồng chất
        const laneOffset = { top: -80, mid: 0, bot: 80 };
        const offset = laneOffset[lane] || 0;
        
        // Spawn 3 melee, 2 ranged
        for (let i = 0; i < 3; i++) {
            const minionOffset = (i - 1) * 50;
            this.minions.push(new Minion({
                x: spawnPoint.x + minionOffset + offset,
                y: spawnPoint.y + minionOffset,
                team: team,
                type: 'melee',
                lane: lane,
                waypoints: [...waypoints],
            }));
        }
        
        for (let i = 0; i < 2; i++) {
            const minionOffset = (i - 0.5) * 50;
            this.minions.push(new Minion({
                x: spawnPoint.x + minionOffset - 40 + offset,
                y: spawnPoint.y + minionOffset - 40,
                team: team,
                type: 'ranged',
                lane: lane,
                waypoints: [...waypoints],
            }));
        }
    },
    
    render(ctx) {
        for (const minion of this.minions) {
            minion.render(ctx);
        }
    },
    
    getTeamMinions(team) {
        return this.minions.filter(m => m.team === team && m.isAlive);
    },
    
    getMinionsInRange(x, y, range, team = null) {
        return this.minions.filter(m => {
            if (!m.isAlive) return false;
            if (team !== null && m.team !== team) return false;
            return Utils.distance(x, y, m.x, m.y) <= range;
        });
    },
    
    getAll() {
        return this.minions;
    },
    
    clear() {
        this.minions = [];
        this.spawnTimer = 0;
        this.waveNumber = 0;
        this.firstWaveCountdown = 10000;
        this.firstWaveSpawned = false;
        
        // Remove countdown element
        const countdownEl = document.getElementById('firstWaveCountdown');
        if (countdownEl) countdownEl.remove();
    },
	
	/**
	 * Hide countdown immediately (for pause)
	 */
	hideCountdownForPause() {
		const countdownEl = document.getElementById('firstWaveCountdown');
		if (countdownEl) {
			countdownEl.style.display = 'none';
		}
	},

	/**
	 * Show countdown (for resume)
	 */
	showCountdownForResume() {
		const countdownEl = document.getElementById('firstWaveCountdown');
		if (countdownEl && !this.firstWaveSpawned) {
			countdownEl.style.display = 'block';
		}
	},
};

/**
 * Minion Class - Improved Graphics
 */
class Minion {
    constructor(config) {
        this.id = Utils.generateId();
        this.type = 'minion';
        this.minionType = config.type;
        this.lane = config.lane;
        
        this.x = config.x;
        this.y = config.y;
        this.team = config.team;
        
        // Team colors
        this.primaryColor = this.team === CONFIG.teams.BLUE ? '#00a8ff' : '#ff4757';
        this.secondaryColor = this.team === CONFIG.teams.BLUE ? '#0097e6' : '#e84118';
        this.accentColor = this.team === CONFIG.teams.BLUE ? '#74b9ff' : '#ff6b81';
        
        this.radius = this.minionType === 'melee' ? 22 : 18;
        
        // Stats
        if (this.minionType === 'melee') {
            this.maxHealth = CONFIG.minion.meleeHealth;
            this.health = CONFIG.minion.meleeHealth;
            this.damage = CONFIG.minion.meleeDamage;
            this.armor = CONFIG.minion.meleeArmor;
            this.attackRange = CONFIG.minion.attackRange.melee;
        } else {
            this.maxHealth = CONFIG.minion.rangedHealth;
            this.health = CONFIG.minion.rangedHealth;
            this.damage = CONFIG.minion.rangedDamage;
            this.armor = CONFIG.minion.rangedArmor;
            this.attackRange = CONFIG.minion.attackRange.ranged;
        }
        
        this.speed = CONFIG.minion.speed;
        this.visionRange = CONFIG.minion.visionRange;
        this.exp = CONFIG.minion.exp;
        
        // State
        this.isAlive = true;
        this.target = null;
        this.waypoints = config.waypoints || [];
        this.currentWaypointIndex = 0;
        
        // Combat
        this.attackCooldown = 0;
        this.attackSpeed = this.minionType === 'melee' ? 1.0 : 0.8;
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.facingAngle = 0;
        
        // Animation
        this.animationFrame = 0;
        this.walkCycle = 0;
    }
    
    update(deltaTime, entities) {
        if (!this.isAlive) return;
        
        this.attackCooldown -= deltaTime;
        this.animationFrame += deltaTime;
        
        // Walk animation
        if (Math.abs(this.vx) > 0 || Math.abs(this.vy) > 0) {
            this.walkCycle += deltaTime * 0.01;
        }
        
        this.updateAI(deltaTime, entities);
        this.updateMovement(deltaTime);
    }
    
    updateAI(deltaTime, entities) {
        this.target = this.findTarget(entities);
        
        if (this.target) {
            const dist = Utils.distance(this.x, this.y, this.target.x, this.target.y);
            
            if (dist <= this.attackRange) {
                this.vx = 0;
                this.vy = 0;
                
                if (this.attackCooldown <= 0) {
                    this.attack(this.target);
                }
            } else {
                this.moveTowards(this.target.x, this.target.y);
            }
        } else {
            this.followWaypoints();
        }
    }
    
    findTarget(entities) {
        let bestTarget = null;
        let bestPriority = -1;
        let bestDist = this.visionRange;
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            if (entity.team === this.team) continue;
            if (entity.untargetable) continue;
            
            const dist = Utils.distance(this.x, this.y, entity.x, entity.y);
            if (dist > this.visionRange) continue;
            
            let priority = 0;
            if (entity.type === 'minion') {
                priority = 2;
            } else if (entity.type === 'hero') {
                priority = 1;
                if (entity.lastAttackTarget && entity.lastAttackTarget === this) {
                    priority = 4;
                }
            } else if (entity.type === 'tower') {
                priority = 0;
            }
            
            if (priority > bestPriority || (priority === bestPriority && dist < bestDist)) {
                bestPriority = priority;
                bestDist = dist;
                bestTarget = entity;
            }
        }
        
        // Check towers
        for (const tower of TowerManager.towers) {
            if (!tower.isAlive) continue;
            if (tower.team === this.team) continue;
            
            const dist = Utils.distance(this.x, this.y, tower.x, tower.y);
            if (dist > this.visionRange) continue;
            
            if (!bestTarget || dist < bestDist) {
                bestTarget = tower;
                bestDist = dist;
            }
        }
        
        return bestTarget;
    }
    
    followWaypoints() {
        if (this.waypoints.length === 0) return;
        
        const waypoint = this.waypoints[this.currentWaypointIndex];
        const dist = Utils.distance(this.x, this.y, waypoint.x, waypoint.y);
        
        if (dist < 60) {
            this.currentWaypointIndex++;
            if (this.currentWaypointIndex >= this.waypoints.length) {
                this.currentWaypointIndex = this.waypoints.length - 1;
            }
        }
        
        this.moveTowards(waypoint.x, waypoint.y);
    }
    
    moveTowards(targetX, targetY) {
        const angle = Utils.angleBetweenPoints(this.x, this.y, targetX, targetY);
        this.facingAngle = angle;
        
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }
    
    updateMovement(deltaTime) {
        const dt = deltaTime / 1000;
        
        const newX = this.x + this.vx * dt;
        const newY = this.y + this.vy * dt;
        
        if (!GameMap.checkWallCollision(newX, newY, this.radius)) {
            this.x = newX;
            this.y = newY;
        } else {
            if (!GameMap.checkWallCollision(newX, this.y, this.radius)) {
                this.x = newX;
            }
            if (!GameMap.checkWallCollision(this.x, newY, this.radius)) {
                this.y = newY;
            }
        }
        
        this.x = Utils.clamp(this.x, this.radius, CONFIG.map.width - this.radius);
        this.y = Utils.clamp(this.y, this.radius, CONFIG.map.height - this.radius);
    }
    
    attack(target) {
        if (this.minionType === 'ranged') {
            ProjectileManager.create({
                x: this.x,
                y: this.y,
                target: target,
                speed: 900,
                damage: this.damage,
                damageType: 'physical',
                owner: this,
                color: this.primaryColor,
                width: 12,
                range: this.attackRange + 50,
            });
        } else {
            Combat.dealDamage(this, target, this.damage, 'physical');
        }
        
        this.attackCooldown = 1000 / this.attackSpeed;
        
        if (typeof AudioManager !== 'undefined') {
            AudioManager.play('hit', 0.2);
        }
    }
    
    takeDamage(amount, attacker, damageType) {
        if (!this.isAlive) return 0;
        
        let actualDamage = amount;
        if (damageType === 'physical') {
            const reduction = this.armor / (this.armor + 100);
            actualDamage = amount * (1 - reduction);
        }
        
        actualDamage = Math.min(this.health, actualDamage);
        this.health -= actualDamage;
        
        EffectManager.createDamageNumber(this.x, this.y, actualDamage, damageType);
        
        if (this.health <= 0) {
            this.die(attacker);
        }
        
        return actualDamage;
    }
    
    /**
     * Minion dies - CẬP NHẬT: sử dụng hệ thống exp mới
     */
    die(killer) {
        this.isAlive = false;
        this.health = 0;
        
        // Distribute experience using new system
        Combat.distributeExperience(this, killer, this.exp);
        
        // Play sound for last-hit
        if (killer && killer.type === 'hero') {
            if (typeof AudioManager !== 'undefined') {
                AudioManager.play('gold', 0.3);
            }
        }
        
        EffectManager.createExplosion(this.x, this.y, 25, this.primaryColor);
    }
    
    /**
     * Render minion - IMPROVED GRAPHICS
     */
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(3, 5, this.radius * 0.8, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.minionType === 'melee') {
            this.renderMeleeMinion(ctx);
        } else {
            this.renderRangedMinion(ctx);
        }
        
        ctx.restore();
        
        // Health bar
        this.renderHealthBar(ctx);
    }
    
    /**
     * Render melee minion - soldier-like
     */
    renderMeleeMinion(ctx) {
        const bounce = Math.sin(this.walkCycle) * 2;
        
        // Body (armor)
        ctx.fillStyle = this.primaryColor;
        ctx.beginPath();
        ctx.roundRect(-this.radius, -this.radius + bounce, this.radius * 2, this.radius * 2.2, 5);
        ctx.fill();
        
        // Armor detail
        ctx.fillStyle = this.secondaryColor;
        ctx.beginPath();
        ctx.roundRect(-this.radius + 4, -this.radius + 4 + bounce, this.radius * 2 - 8, this.radius * 1.4, 3);
        ctx.fill();
        
        // Helmet
        ctx.fillStyle = this.primaryColor;
        ctx.beginPath();
        ctx.arc(0, -this.radius * 0.6 + bounce, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Helmet visor
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.ellipse(0, -this.radius * 0.5 + bounce, this.radius * 0.4, this.radius * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Shield
        ctx.save();
        ctx.rotate(this.facingAngle);
        ctx.fillStyle = this.accentColor;
        ctx.beginPath();
        ctx.ellipse(this.radius * 0.8, 0, this.radius * 0.4, this.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Shield emblem
        ctx.fillStyle = this.team === CONFIG.teams.BLUE ? '#fff' : '#fff';
        ctx.beginPath();
        ctx.arc(this.radius * 0.8, 0, this.radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Sword
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(this.radius * 0.3, -this.radius * 0.1, this.radius * 1.2, this.radius * 0.2);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(this.radius * 0.2, -this.radius * 0.2, this.radius * 0.2, this.radius * 0.4);
        ctx.restore();
    }
    
    /**
     * Render ranged minion - mage/archer-like
     */
    renderRangedMinion(ctx) {
        const bounce = Math.sin(this.walkCycle) * 1.5;
        
        // Robe body
        ctx.fillStyle = this.secondaryColor;
        ctx.beginPath();
        ctx.moveTo(-this.radius, this.radius + bounce);
        ctx.lineTo(this.radius, this.radius + bounce);
        ctx.lineTo(this.radius * 0.6, -this.radius * 0.5 + bounce);
        ctx.lineTo(-this.radius * 0.6, -this.radius * 0.5 + bounce);
        ctx.closePath();
        ctx.fill();
        
        // Inner robe
        ctx.fillStyle = this.primaryColor;
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.6, this.radius * 0.8 + bounce);
        ctx.lineTo(this.radius * 0.6, this.radius * 0.8 + bounce);
        ctx.lineTo(this.radius * 0.4, -this.radius * 0.3 + bounce);
        ctx.lineTo(-this.radius * 0.4, -this.radius * 0.3 + bounce);
        ctx.closePath();
        ctx.fill();
        
        // Hood
        ctx.fillStyle = this.primaryColor;
        ctx.beginPath();
        ctx.arc(0, -this.radius * 0.5 + bounce, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Face shadow
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.ellipse(0, -this.radius * 0.4 + bounce, this.radius * 0.35, this.radius * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Glowing eyes
        ctx.fillStyle = this.accentColor;
        ctx.shadowColor = this.accentColor;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(-this.radius * 0.15, -this.radius * 0.45 + bounce, 3, 0, Math.PI * 2);
        ctx.arc(this.radius * 0.15, -this.radius * 0.45 + bounce, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Staff
        ctx.save();
        ctx.rotate(this.facingAngle);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.radius * 0.5, -this.radius * 0.1, this.radius * 1.5, 4);
        
        // Staff orb
        ctx.fillStyle = this.accentColor;
        ctx.shadowColor = this.accentColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.radius * 2, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    /**
     * Render health bar - improved
     */
    renderHealthBar(ctx) {
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent >= 1) return;
        
        const barWidth = this.radius * 2.2;
        const barHeight = 6;
        const barY = this.y - this.radius - 15;
        
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.beginPath();
        ctx.roundRect(this.x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2, 2);
        ctx.fill();
        
        // Health fill with gradient
        const gradient = ctx.createLinearGradient(
            this.x - barWidth / 2, barY,
            this.x - barWidth / 2 + barWidth * healthPercent, barY
        );
        
        if (healthPercent > 0.5) {
            gradient.addColorStop(0, '#22c55e');
            gradient.addColorStop(1, '#16a34a');
        } else if (healthPercent > 0.25) {
            gradient.addColorStop(0, '#fbbf24');
            gradient.addColorStop(1, '#f59e0b');
        } else {
            gradient.addColorStop(0, '#ef4444');
            gradient.addColorStop(1, '#dc2626');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(this.x - barWidth / 2, barY, barWidth * healthPercent, barHeight, 2);
        ctx.fill();
    }
}

// Polyfill for roundRect if not available
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
    };
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MinionManager, Minion };
}
