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
            `;
            document.body.appendChild(countdownEl);
        }

        const seconds = Math.ceil(this.firstWaveCountdown / 1000);
        countdownEl.textContent = `Minions spawning in: ${seconds}s`;
    },

    /**
     * Ẩn UI đếm ngược
     */
    hideFirstWaveCountdown() {
        const countdownEl = document.getElementById('firstWaveCountdown');
        if (countdownEl) {
            countdownEl.style.display = 'none';
        }
    },

    spawnWave() {
        const spawnPoints = {
            blue: this.getMainTowerSpawnPoint(CONFIG.teams.BLUE),
            red: this.getMainTowerSpawnPoint(CONFIG.teams.RED),
        };

        const lanes = ['top', 'mid', 'bot'];

        // Use lowercase team keys
        for (const teamKey of ['blue', 'red']) {
            for (const lane of lanes) {
                const spawnPoint = spawnPoints[teamKey];
                const waypoints = this.waypoints[teamKey][lane];

                // Spawn melee minions
                for (let i = 0; i < CONFIG.minion.spawn.meleeCount; i++) {
                    const offset = (i - CONFIG.minion.spawn.meleeCount / 2) * CONFIG.minion.spawn.spacing;
                    const minion = new Minion({
                        x: spawnPoint.x + offset,
                        y: spawnPoint.y,
                        team: teamKey === 'blue' ? CONFIG.teams.BLUE : CONFIG.teams.RED,
                        type: 'melee',
                        lane: lane,
                        waypoints: waypoints,
                    });
                    this.minions.push(minion);
                }

                // Spawn ranged minions
                for (let i = 0; i < CONFIG.minion.spawn.rangedCount; i++) {
                    const offset = (i - CONFIG.minion.spawn.rangedCount / 2 + CONFIG.minion.spawn.meleeCount / 2) * CONFIG.minion.spawn.spacing;
                    const minion = new Minion({
                        x: spawnPoint.x + offset,
                        y: spawnPoint.y,
                        team: teamKey === 'blue' ? CONFIG.teams.BLUE : CONFIG.teams.RED,
                        type: 'ranged',
                        lane: lane,
                        waypoints: waypoints,
                    });
                    this.minions.push(minion);
                }
            }
        }
    },

    /**
     * Clear tất cả lính (cho restart)
     */
    clear() {
        this.minions = [];
        this.spawnTimer = CONFIG.game.minionSpawnInterval;
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
    
    /**
     * Render all minions
     */
    render(ctx) {
        for (const minion of this.minions) {
            minion.render(ctx);
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
            this.baseMaxHealth = CONFIG.minion.meleeHealth;
            this.baseDamage = CONFIG.minion.meleeDamage;
            this.maxHealth = CONFIG.minion.meleeHealth;
            this.health = CONFIG.minion.meleeHealth;
            this.damage = CONFIG.minion.meleeDamage;
            this.armor = CONFIG.minion.meleeArmor;
            this.attackRange = CONFIG.minion.attackRange.melee;
        } else {
            this.baseMaxHealth = CONFIG.minion.rangedHealth;
            this.baseDamage = CONFIG.minion.rangedDamage;
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

        // Scaling
        this.spawnTime = Date.now();
        this.lastScaleCheck = 0;

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

        // Apply scaling
        this.applyScaling(deltaTime);

        this.updateAI(deltaTime, entities);
        this.updateMovement(deltaTime);
    }

    applyScaling(deltaTime) {
        const now = Date.now();
        const elapsedTime = now - this.spawnTime;
        const config = CONFIG.gameScaling?.minion;

        if (!config) return;

        // Check scaling interval
        if (now - this.lastScaleCheck >= config.scaleInterval) {
            this.lastScaleCheck = now;

            // Calculate scaling factor
            const minutesElapsed = elapsedTime / 60000; // Convert to minutes
            const healthMultiplier = 1 + (minutesElapsed * (config.healthPerMinute - 1));
            const damageMultiplier = 1 + (minutesElapsed * (config.damagePerMinute - 1));

            // Apply scaling to max health and damage
            this.maxHealth = this.baseMaxHealth * healthMultiplier;
            this.damage = this.baseDamage * damageMultiplier;
        }
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

        if (dist < 100) {
            this.currentWaypointIndex++;
            if (this.currentWaypointIndex >= this.waypoints.length) {
                this.currentWaypointIndex = this.waypoints.length - 1;
            }
        } else {
            this.moveTowards(waypoint.x, waypoint.y);
        }
    }

    moveTowards(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
            this.facingAngle = Math.atan2(dy, dx);
        }
    }

    updateMovement(deltaTime) {
        // Normalize diagonal movement
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.speed) {
            this.vx = (this.vx / speed) * this.speed;
            this.vy = (this.vy / speed) * this.speed;
        }

        // Apply movement
        let newX = this.x + this.vx * deltaTime / 1000;
        let newY = this.y + this.vy * deltaTime / 1000;

        // Check collision with walls
        if (!this.checkWallCollision(newX, newY)) {
            this.x = newX;
            this.y = newY;
        } else {
            // Try to slide around obstacle
            if (!this.checkWallCollision(newX, this.y)) {
                this.x = newX;
            } else if (!this.checkWallCollision(this.x, newY)) {
                this.y = newY;
            }
        }
    }

    checkWallCollision(x, y) {
        for (const wall of GameMap.walls) {
            if (Utils.circleRectCollision(x, y, this.radius, wall.x, wall.y, wall.width, wall.height)) {
                return true;
            }
        }
        return false;
    }

    attack(target) {
        const damage = this.damage;
        Combat.dealDamage(this, target, damage);
        this.attackCooldown = 1000 / this.attackSpeed;
    }

    takeDamage(amount) {
        this.health -= amount;

        if (this.health <= 0) {
            this.isAlive = false;
            Combat.onEntityDeath(this);
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.facingAngle);

        // Draw minion
        this.drawMinion(ctx);

        ctx.restore();

        // Draw health bar
        this.drawHealthBar(ctx);
    }

    drawMinion(ctx) {
        const size = this.radius * 2;

        // Body
        ctx.fillStyle = this.primaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = this.secondaryColor;
        ctx.beginPath();
        ctx.arc(-this.radius * 0.2, -this.radius * 0.2, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Eye direction indicator
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.radius * 0.3, -this.radius * 0.1, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Weapon indicator for melee
        if (this.minionType === 'melee') {
            ctx.fillStyle = this.accentColor;
            ctx.fillRect(this.radius * 0.5, -this.radius * 0.1, this.radius * 0.8, this.radius * 0.3);
        }
    }

    drawHealthBar(ctx) {
        const barWidth = this.radius * 2.5;
        const barHeight = 4;
        const x = this.x - barWidth / 2;
        const y = this.y - this.radius - 8;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }

    getState() {
        return {
            id: this.id,
            type: this.type,
            minionType: this.minionType,
            x: this.x,
            y: this.y,
            health: this.health,
            maxHealth: this.maxHealth,
            team: this.team,
            lane: this.lane,
            isAlive: this.isAlive,
            damage: this.damage,
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MinionManager, Minion };
}
