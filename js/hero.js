/**
 * ========================================
 * MOBA Arena - Hero System
 * ========================================
 * Quản lý tướng, stats, abilities
 */

// Hero Registry - lưu trữ tất cả hero definitions
const HeroRegistry = {
    heroes: {},
    
    register(heroData) {
        this.heroes[heroData.id] = heroData;
    },
    
    get(heroId) {
        return this.heroes[heroId];
    },
    
    getAll() {
        return Object.values(this.heroes);
    },
    
    getRandom() {
        const ids = Object.keys(this.heroes);
        return this.heroes[Utils.randomItem(ids)];
    },
};

// Register heroes
HeroRegistry.register(HeroVanheo);
HeroRegistry.register(HeroZephy);
HeroRegistry.register(HeroLaLo);
HeroRegistry.register(HeroNemo);
HeroRegistry.register(HeroBalametany);

/**
 * Hero Manager
 */
const HeroManager = {
    heroes: [],
    player: null,
    
    /**
     * Khởi tạo
     */
    init() {
        this.heroes = [];
        this.player = null;
    },
    
    /**
     * Tạo hero mới
     */
    createHero(heroId, team, isPlayer = false, playerName = null) {
        const heroData = HeroRegistry.get(heroId);
        if (!heroData) {
            console.error(`Hero not found: ${heroId}`);
            return null;
        }
        
        const spawnPoint = GameMap.getSpawnPoint(team);
        const hero = new Hero({
            heroData: heroData,
            team: team,
            x: spawnPoint.x + Utils.random(-50, 50),
            y: spawnPoint.y + Utils.random(-50, 50),
            isPlayer: isPlayer,
            playerName: playerName || heroData.name,
        });
        
        this.heroes.push(hero);
        
        if (isPlayer) {
            this.player = hero;
        }
        
        return hero;
    },
    
    /**
     * Update all heroes
     */
    update(deltaTime, entities) {
        for (const hero of this.heroes) {
            hero.update(deltaTime, entities);
        }
    },
    
    /**
     * Render heroes
     */
    render(ctx) {
        // Sort by Y for proper depth
        const sortedHeroes = [...this.heroes].sort((a, b) => a.y - b.y);
        
        for (const hero of sortedHeroes) {
            hero.render(ctx);
        }
    },
    
    /**
     * Get heroes by team
     */
    getTeamHeroes(team) {
        return this.heroes.filter(h => h.team === team);
    },
    
    /**
     * Get alive heroes
     */
    getAliveHeroes(team = null) {
        return this.heroes.filter(h => h.isAlive && (team === null || h.team === team));
    },
    
    /**
     * Get all heroes
     */
    getAll() {
        return this.heroes;
    },
    
    /**
     * Get player hero
     */
    getPlayer() {
        return this.player;
    },
    
    /**
     * Clear all
     */
    clear() {
        this.heroes = [];
        this.player = null;
    },
};

/**
 * Hero Class
 */
class Hero {
    constructor(config) {
        this.id = Utils.generateId();
        this.type = 'hero';
        this.heroData = config.heroData;
        this.name = this.heroData.name;
        this.playerName = config.playerName || this.name;
        this.role = this.heroData.role;
        
        this.x = config.x;
        this.y = config.y;
        this.team = config.team;
        this.isPlayer = config.isPlayer || false;
        
        this.radius = 35;
        this.color = config.team === CONFIG.teams.BLUE 
            ? CONFIG.colors.blueTeam 
            : CONFIG.colors.redTeam;
        
        // Level system
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = CONFIG.leveling.expPerLevel[1];
        
        // Calculate stats
        this.baseStats = Utils.deepClone(this.heroData.baseStats);
        this.stats = {};
        
        // Initialize buffs and debuffs BEFORE calculateStats
        this.buffs = [];
        this.debuffs = [];
        
        this.calculateStats();
        
        // Current values
        this.health = this.stats.maxHealth;
        this.mana = this.stats.maxMana;
        
        // Ability levels
        this.abilityLevels = { q: 0, e: 0, r: 0, t: 0 };
        this.abilityCooldowns = { q: 0, e: 0, r: 0, t: 0 };
        
        // Spell
        this.spell = null;
        this.spellCooldown = 0;
        
        // Attack
        this.attackCooldown = 0;
        this.lastAttackTarget = null;
        
        // State
        this.isAlive = true;
        this.isDead = false;
        this.respawnTimer = 0;
        this.untargetable = false;
        this.invisible = false;
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.facingAngle = 0;
        this.targetPosition = null;
        
        // Shield
        this.shield = 0;
        
        // Passive tracking
        this.passiveStacks = 0;
        this.passiveTarget = null;
        this.passiveLastHit = 0;
        
        // Combat stats
        this.kills = 0;
        this.deaths = 0;
        this.assists = 0;
        this.totalDamageDealt = 0;
        
        // Ability points
        this.abilityPoints = 1;
    }
    
    /**
     * Calculate final stats
     */
    calculateStats() {
        const base = this.baseStats;
        const growth = this.heroData.statGrowth;
        const lvl = this.level - 1;
        
        this.stats = {
            maxHealth: base.health + growth.health * lvl,
            maxMana: base.mana + growth.mana * lvl,
            healthRegen: base.healthRegen + growth.healthRegen * lvl,
            manaRegen: base.manaRegen + growth.manaRegen * lvl,
            attackDamage: base.attackDamage + growth.attackDamage * lvl,
            abilityPower: base.abilityPower + (growth.abilityPower || 0) * lvl,
            armor: base.armor + growth.armor * lvl,
            magicResist: base.magicResist + growth.magicResist * lvl,
            attackSpeed: Math.min(
                base.attackSpeed + growth.attackSpeed * lvl,
                CONFIG.caps.maxAttackSpeed / 100
            ),
            attackRange: base.attackRange,
            moveSpeed: Math.min(base.moveSpeed, CONFIG.caps.maxSpeed),
            critChance: Math.min(base.critChance + (growth.critChance || 0) * lvl, CONFIG.caps.maxCritChance),
            critDamage: base.critDamage,
            cdr: 0,
        };
        
        // Apply buffs - check if buffs is an array first
        if (Array.isArray(this.buffs)) {
            for (const buff of this.buffs) {
                this.applyBuffToStats(buff);
            }
        }
    }
    
    /**
     * Apply buff effects to stats
     */
    applyBuffToStats(buff) {
        if (buff.speedBoost) {
            this.stats.moveSpeed = Math.min(
                this.stats.moveSpeed * (1 + buff.speedBoost),
                CONFIG.caps.maxSpeed
            );
        }
        if (buff.damageReduction) {
            // Stored separately
        }
    }
    
    /**
     * Update hero
     */
    update(deltaTime, entities) {
        // QUAN TRỌNG: Cập nhật cooldowns ngay cả khi đang chờ hồi sinh
        this.updateCooldowns(deltaTime);
        
        // Respawn logic
        if (this.isDead) {
            this.respawnTimer -= deltaTime;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return;
        }
        
        if (!this.isAlive) return;
        
        // Regeneration
        this.updateRegen(deltaTime);
        
        // Base healing
        this.updateBaseHealing(deltaTime);
        
        // Update buffs/debuffs
        this.updateBuffs(deltaTime);
        
        // Passive update
        this.updatePassive(deltaTime);
        
        // Movement (for player or AI will set vx/vy)
        if (this.isPlayer) {
            this.updatePlayerMovement(deltaTime);
        }
        
        this.applyMovement(deltaTime);
    }
    
    /**
     * Update cooldowns
     */
    updateCooldowns(deltaTime) {
        for (const key of Object.keys(this.abilityCooldowns)) {
            if (this.abilityCooldowns[key] > 0) {
                this.abilityCooldowns[key] -= deltaTime;
            }
        }
        
        if (this.spellCooldown > 0) {
            this.spellCooldown -= deltaTime;
        }
        
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
    }
    
    /**
     * Update regen
     */
    updateRegen(deltaTime) {
        const dt = deltaTime / 1000;
        
        // Health regen
        if (this.health < this.stats.maxHealth) {
            this.health = Math.min(
                this.health + this.stats.healthRegen * dt,
                this.stats.maxHealth
            );
        }
        
        // Mana regen
        if (this.mana < this.stats.maxMana) {
            this.mana = Math.min(
                this.mana + this.stats.manaRegen * dt,
                this.stats.maxMana
            );
        }
    }
    
    /**
     * Heal in base
     */
    updateBaseHealing(deltaTime) {
        if (GameMap.isInHealZone(this.x, this.y, this.team)) {
            const dt = deltaTime / 1000;
            const healAmount = this.stats.maxHealth * 0.05 * dt; // 5% per second
            const manaAmount = this.stats.maxMana * 0.05 * dt;
            
            this.health = Math.min(this.health + healAmount, this.stats.maxHealth);
            this.mana = Math.min(this.mana + manaAmount, this.stats.maxMana);
        }
    }
    
    /**
     * Update buffs
     */
    updateBuffs(deltaTime) {
        // Ensure buffs is an array
        if (!Array.isArray(this.buffs)) {
            this.buffs = [];
        }
        if (!Array.isArray(this.debuffs)) {
            this.debuffs = [];
        }
        
        // Update buffs
        for (let i = this.buffs.length - 1; i >= 0; i--) {
            const buff = this.buffs[i];
            buff.duration -= deltaTime;
            
            if (buff.duration <= 0) {
                this.buffs.splice(i, 1);
                this.calculateStats();
            }
        }
        
        // Update debuffs
        for (let i = this.debuffs.length - 1; i >= 0; i--) {
            const debuff = this.debuffs[i];
            debuff.duration -= deltaTime;
            
            if (debuff.duration <= 0) {
                this.debuffs.splice(i, 1);
            }
        }
    }
    
    /**
     * Update passive
     */
    updatePassive(deltaTime) {
        // Reset passive stacks if timeout
        if (this.heroData.passive.resetTime) {
            if (Date.now() - this.passiveLastHit > this.heroData.passive.resetTime) {
                this.passiveStacks = 0;
                this.passiveTarget = null;
            }
        }
        
        // Decay passive stacks
        if (this.heroData.passive.decayTime) {
            if (Date.now() - this.passiveLastHit > this.heroData.passive.decayTime) {
                this.passiveStacks = Math.max(0, this.passiveStacks - 1);
                this.passiveLastHit = Date.now();
            }
        }
    }
    
    /**
     * Player movement from input - FIX: Reset velocity khi không có input
     */
    updatePlayerMovement(deltaTime) {
        // Cập nhật facing direction theo chuột trước
        const worldMouse = Camera.screenToWorld(Input.mouseX, Input.mouseY);
        this.facingAngle = Utils.angleBetweenPoints(this.x, this.y, worldMouse.x, worldMouse.y);
        
        let moveX = 0;
        let moveY = 0;
        
        // Kiểm tra từng phím một cách rõ ràng
        const wDown = Input.isKeyDown('w') || Input.isKeyDown('W');
        const sDown = Input.isKeyDown('s') || Input.isKeyDown('S');
        const aDown = Input.isKeyDown('a') || Input.isKeyDown('A');
        const dDown = Input.isKeyDown('d') || Input.isKeyDown('D');
        
        // W - đi về phía trước (hướng facing)
        if (wDown) {
            moveX += Math.cos(this.facingAngle);
            moveY += Math.sin(this.facingAngle);
        }
        // S - đi lùi (ngược hướng facing)
        if (sDown) {
            moveX -= Math.cos(this.facingAngle);
            moveY -= Math.sin(this.facingAngle);
        }
        // A - đi sang trái (vuông góc với facing, -90 độ)
        if (aDown) {
            const leftAngle = this.facingAngle - Math.PI / 2;
            moveX += Math.cos(leftAngle);
            moveY += Math.sin(leftAngle);
        }
        // D - đi sang phải (vuông góc với facing, +90 độ)
        if (dDown) {
            const rightAngle = this.facingAngle + Math.PI / 2;
            moveX += Math.cos(rightAngle);
            moveY += Math.sin(rightAngle);
        }
        
        // Normalize diagonal movement
        if (moveX !== 0 || moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }
        
        // Check for CC effects
        const stunned = Array.isArray(this.debuffs) && this.debuffs.some(d => d.type === 'stun' || d.type === 'knockup');
        if (stunned) {
            moveX = 0;
            moveY = 0;
        }
        
        // Apply speed - CHỈ KHI CÓ INPUT
        let speed = this.stats.moveSpeed;
        
        // Slow effects
        if (Array.isArray(this.debuffs)) {
            const slow = this.debuffs.find(d => d.type === 'slow');
            if (slow) {
                speed *= (1 - slow.percent / 100);
            }
        }
        
        // Set velocity - sẽ là 0 nếu không có phím nào được nhấn
        this.vx = moveX * speed;
        this.vy = moveY * speed;
    }
    
    /**
     * Apply movement
     */
    applyMovement(deltaTime) {
        const dt = deltaTime / 1000;
        
        const newX = this.x + this.vx * dt;
        const newY = this.y + this.vy * dt;
        
        // Wall collision
        if (!GameMap.checkWallCollision(newX, newY, this.radius)) {
            this.x = newX;
            this.y = newY;
        } else {
            // Slide along wall
            if (!GameMap.checkWallCollision(newX, this.y, this.radius)) {
                this.x = newX;
            }
            if (!GameMap.checkWallCollision(this.x, newY, this.radius)) {
                this.y = newY;
            }
        }
        
        // Clamp to map
        this.x = Utils.clamp(this.x, this.radius, CONFIG.map.width - this.radius);
        this.y = Utils.clamp(this.y, this.radius, CONFIG.map.height - this.radius);
    }
    
    /**
     * Use ability
     */
    useAbility(abilityKey, targetX, targetY, targetEntity = null) {
        const ability = this.heroData.abilities[abilityKey];
        if (!ability) return false;
        
        const level = this.abilityLevels[abilityKey];
        if (level === 0) return false;
        
        // Check cooldown
        if (this.abilityCooldowns[abilityKey] > 0) return false;
        
        // Check mana
        const manaCost = ability.manaCost[level - 1];
        if (this.mana < manaCost) return false;
        
        // Check CC
        if (Array.isArray(this.debuffs) && this.debuffs.some(d => d.type === 'stun' || d.type === 'silence')) {
            return false;
        }
        
        // Execute ability
        const result = ability.execute(this, targetX, targetY, level);
        if (!result) return false;
        
        // Consume mana
        this.mana -= manaCost;
        
        // Set cooldown
        let cooldown = ability.cooldown[level - 1];
        cooldown *= (1 - this.stats.cdr / 100);
        this.abilityCooldowns[abilityKey] = cooldown;
        
        // Process result
        this.processAbilityResult(result);
        
        // Break invisibility
        if (this.invisible) {
            this.breakInvisibility();
        }
        
        return true;
    }
    
    /**
     * Process ability result
     */
    processAbilityResult(result) {
        switch (result.type) {
            case 'projectile':
                ProjectileManager.create(result);
                break;
                
            case 'delayed_area':
                ProjectileManager.createDelayedArea(result);
                break;
                
            case 'instant_area':
                this.executeInstantArea(result);
                break;
                
            case 'dash_collision':
            case 'dash_through':
                this.executeDash(result);
                break;
                
            case 'dash_and_shoot':
                this.executeDashAndShoot(result);
                break;
                
            case 'blink':
                this.executeBlink(result);
                break;
                
            case 'leap_slam':
                this.executeLeap(result);
                break;
                
            case 'channel_area':
            case 'zone':
                ProjectileManager.createZone(result);
                break;
                
            case 'targeted_shield':
                this.executeShield(result);
                break;
                
            case 'self_buff':
                this.executeSelfBuff(result);
                break;
                
            case 'targeted_dash':
                this.executeTargetedDash(result);
                break;
                
            case 'charged_global_projectile':
                // Add charge time then create projectile
                setTimeout(() => {
                    ProjectileManager.create({
                        ...result,
                        type: 'projectile',
                        x: this.x,
                        y: this.y,
                    });
                }, result.chargeTime);
                break;
        }
    }
    
    /**
     * Execute instant area damage
     */
    executeInstantArea(result) {
        const entities = Game.getAllEntities();
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            if (entity === this) continue;
            if (entity.team === this.team) continue;
            if (entity.untargetable) continue;
            
            const dist = Utils.distance(result.x, result.y, entity.x, entity.y);
            if (dist <= result.radius) {
                Combat.dealDamage(this, entity, result.damage, result.damageType);
                
                if (result.effects) {
                    for (const effect of result.effects) {
                        Combat.applyEffect(entity, effect, this);
                    }
                }
            }
        }
        
        EffectManager.createExplosion(result.x, result.y, result.radius, result.color);
    }
    
    /**
     * Execute dash
     */
    executeDash(result) {
        const startX = this.x;
        const startY = this.y;
        const endX = result.dashX;
        const endY = result.dashY;
        
        // Validate end position
        let finalX = endX;
        let finalY = endY;
        
        // Check wall collision along dash path
        const steps = 20;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const testX = Utils.lerp(startX, endX, t);
            const testY = Utils.lerp(startY, endY, t);
            
            if (GameMap.checkWallCollision(testX, testY, this.radius)) {
                finalX = Utils.lerp(startX, endX, (i - 1) / steps);
                finalY = Utils.lerp(startY, endY, (i - 1) / steps);
                break;
            }
        }
        
        // If dash_collision, check for entity collision
        if (result.type === 'dash_collision' || result.type === 'dash_through') {
            const entities = Game.getAllEntities();
            let hitEntity = null;
            
            for (const entity of entities) {
                if (!entity.isAlive) continue;
                if (entity === this) continue;
                if (entity.team === this.team) continue;
                if (entity.untargetable) continue;
                
                // Check if entity is along dash path
                const intersection = Utils.lineCircleIntersection(
                    startX, startY, finalX, finalY,
                    entity.x, entity.y, entity.radius + this.radius
                );
                
                if (intersection) {
                    // Hit entity
                    Combat.dealDamage(this, entity, result.damage, result.damageType);
                    
                    if (result.onHit) {
                        Combat.applyEffect(entity, result.onHit, this);
                    }
                    
                    if (result.stopOnHit) {
                        finalX = intersection.x;
                        finalY = intersection.y;
                        hitEntity = entity;
                        break;
                    }
                }
            }
        }
        
        // Move to final position
        this.x = finalX;
        this.y = finalY;
    }
    
    /**
     * Execute dash and shoot
     */
    executeDashAndShoot(result) {
        // Dash first
        this.x = result.dashX;
        this.y = result.dashY;
        
        // Then shoot
        if (result.projectile) {
            ProjectileManager.create({
                ...result.projectile,
                x: this.x,
                y: this.y,
            });
        }
    }
    
    /**
     * Execute blink
     */
    executeBlink(result) {
        // Check if target is valid
        if (!GameMap.checkWallCollision(result.targetX, result.targetY, this.radius)) {
            this.x = result.targetX;
            this.y = result.targetY;
        }
    }
    
    /**
     * Execute leap
     */
    executeLeap(result) {
        this.untargetable = true;
        
        // Animate leap (simplified - instant for now)
        setTimeout(() => {
            this.x = result.targetX;
            this.y = result.targetY;
            this.untargetable = false;
            
            // Deal damage on landing
            this.executeInstantArea({
                x: this.x,
                y: this.y,
                radius: result.radius,
                damage: result.damage,
                damageType: result.damageType,
                effects: result.effects,
                color: result.color,
            });
        }, result.leapDuration);
    }
    
    /**
     * Execute shield
     */
    executeShield(result) {
        // Find target ally
        let target = this;
        
        const entities = Game.getAllEntities();
        let closestDist = result.range;
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            if (entity.type !== 'hero') continue;
            if (entity.team !== this.team) continue;
            
            const dist = Utils.distance(result.targetX, result.targetY, entity.x, entity.y);
            if (dist < closestDist) {
                closestDist = dist;
                target = entity;
            }
        }
        
        // Apply shield
        target.addShield(result.shieldAmount, result.duration);
    }
    
    /**
     * Execute self buff
     */
    executeSelfBuff(result) {
        if (result.effects.invisible) {
            this.invisible = true;
        }
        
        this.addBuff({
            type: 'self_buff',
            ...result.effects,
            duration: result.duration,
            breakOnAction: result.breakOnAction,
        });
    }
    
    /**
     * Execute targeted dash (to enemy)
     */
    executeTargetedDash(result) {
        if (!result.target) return;
        
        // Dash to behind target
        const angle = Utils.angleBetween(result.target, this);
        const targetX = result.target.x + Math.cos(angle) * (result.target.radius + this.radius);
        const targetY = result.target.y + Math.sin(angle) * (result.target.radius + this.radius);
        
        this.x = targetX;
        this.y = targetY;
        
        // Deal damage
        Combat.dealDamage(this, result.target, result.damage, result.damageType);
        
        // Check for kill
        if (!result.target.isAlive && result.onKill) {
            result.onKill();
        }
    }
    
    /**
     * Use spell (bổ trợ)
     */
    useSpell(targetX, targetY) {
        if (!this.spell) return false;
        if (this.spellCooldown > 0) return false;
        
        const spellData = CONFIG.spells[this.spell];
        if (!spellData) return false;
        
        // Execute spell
        switch (this.spell) {
            case 'heal':
                const healAmount = this.stats.maxHealth * spellData.healPercent;
                Combat.heal(this, this, healAmount);
                break;
                
            case 'flash':
                const angle = Utils.angleBetweenPoints(this.x, this.y, targetX, targetY);
                const flashX = this.x + Math.cos(angle) * spellData.distance;
                const flashY = this.y + Math.sin(angle) * spellData.distance;
                
                if (!GameMap.checkWallCollision(flashX, flashY, this.radius)) {
                    this.x = flashX;
                    this.y = flashY;
                }
                break;
                
            case 'haste':
                this.addBuff({
                    type: 'haste',
                    speedBoost: (spellData.speedBoost - this.stats.moveSpeed) / this.stats.moveSpeed,
                    duration: spellData.duration,
                });
                break;
        }
        
        this.spellCooldown = spellData.cooldown;
        return true;
    }
    
    /**
     * Basic attack
     */
    basicAttack(target) {
        if (this.attackCooldown > 0) return false;
        if (!target || !target.isAlive) return false;
        if (target.untargetable) return false;
        
        // Check range
        const dist = Utils.distance(this.x, this.y, target.x, target.y);
        if (dist > this.stats.attackRange + target.radius) return false;
        
        // Check CC
        if (Array.isArray(this.debuffs) && this.debuffs.some(d => d.type === 'stun' || d.type === 'disarm')) {
            return false;
        }
        
        // Execute attack
        const result = this.heroData.basicAttack.execute(this, target);
        
        if (result.type === 'projectile') {
            ProjectileManager.create({
                ...result,
                x: this.x,
                y: this.y,
                // Lấy pierceWalls từ heroData nếu có
                pierceWalls: this.heroData.basicAttack.pierceWalls || false,
            });
        } else {
            // Melee attack - instant damage
            Combat.dealDamage(this, target, result.damage, result.damageType);
        }
        
        this.lastAttackTarget = target;
        this.attackCooldown = 1000 / this.stats.attackSpeed;
        
        if (this.invisible) {
            this.breakInvisibility();
        }
        
        return true;
    }
    
    /**
     * Take damage
     */
    takeDamage(amount, attacker, damageType) {
        if (!this.isAlive) return 0;
        if (this.untargetable) return 0;
        
        let actualDamage = amount;
        
        // Damage reduction from buffs
        if (Array.isArray(this.buffs)) {
            for (const buff of this.buffs) {
                if (buff.damageReduction) {
                    actualDamage *= (1 - buff.damageReduction);
                }
            }
        }
        
        // Apply armor/magic resist
        if (damageType === 'physical') {
            const reduction = this.stats.armor / (this.stats.armor + 100);
            actualDamage *= (1 - reduction);
        } else if (damageType === 'magical') {
            const reduction = this.stats.magicResist / (this.stats.magicResist + 100);
            actualDamage *= (1 - reduction);
        }
        // True damage bypasses resistances
        
        // Shield first
        if (this.shield > 0) {
            const shieldDamage = Math.min(this.shield, actualDamage);
            this.shield -= shieldDamage;
            actualDamage -= shieldDamage;
        }
        
        actualDamage = Math.min(this.health, actualDamage);
        this.health -= actualDamage;
        
        // Trigger passive effects (e.g., Nemo's passive)
        this.checkPassiveTrigger();
        
        // Show damage
        EffectManager.createDamageNumber(this.x, this.y, actualDamage, damageType);
        
        if (this.health <= 0) {
            this.die(attacker);
        }
        
        return actualDamage;
    }
    
    /**
     * Check passive triggers
     */
    checkPassiveTrigger() {
        // Nemo passive
        if (this.heroData.id === 'nemo' && this.health / this.stats.maxHealth <= this.heroData.passive.hpThreshold) {
            if (!this.passiveOnCooldown) {
                this.addBuff({
                    type: 'iron_will',
                    damageReduction: this.heroData.passive.damageReduction,
                    duration: this.heroData.passive.duration,
                });
                this.passiveOnCooldown = true;
                setTimeout(() => {
                    this.passiveOnCooldown = false;
                }, this.heroData.passive.cooldown);
            }
        }
    }
    
    /**
     * Die
     */
    die(killer) {
            this.isAlive = false;
            this.isDead = true;
            this.deaths++;
            
            // Calculate respawn time
            const gameMinutes = Game.gameTime / 60000;
            this.respawnTimer = CONFIG.game.respawnBaseTime + gameMinutes * CONFIG.game.respawnTimePerMinute;
            
            // Calculate exp reward for hero kill
            const heroKillExp = 100 + this.level * 20;
            
            // Distribute experience using new system
            Combat.distributeExperience(this, killer, heroKillExp);
            
            // Give kill credit
            if (killer && killer.type === 'hero') {
                killer.kills++;
            }
            
            // Get and credit assists
            Combat.getAssists(this, killer);
            
            // Death effect
            EffectManager.createExplosion(this.x, this.y, 50, this.color);
            Camera.shake(10, 300);
            
            // Announcement
            UI.addKillFeed(killer, this, 'kill');
        }
    
    /**
     * Respawn
     */
    respawn() {
        this.isDead = false;
        this.isAlive = true;
        
        const spawnPoint = GameMap.getSpawnPoint(this.team);
        this.x = spawnPoint.x + Utils.random(-50, 50);
        this.y = spawnPoint.y + Utils.random(-50, 50);
        
        this.health = this.stats.maxHealth;
        this.mana = this.stats.maxMana;
        this.shield = 0;
        this.buffs = [];
        this.debuffs = [];
        this.invisible = false;
        this.untargetable = false;
    }
    
    /**
     * Gain experience
     */
    gainExp(amount) {
        this.exp += amount;
        
        while (this.exp >= this.expToNextLevel && this.level < CONFIG.leveling.maxLevel) {
            this.levelUp();
        }
    }
    
    /**
     * Level up
     */
    levelUp() {
        this.exp -= this.expToNextLevel;
        this.level++;
        this.abilityPoints++;
        
        // Get next level exp requirement
        if (this.level < CONFIG.leveling.maxLevel) {
            this.expToNextLevel = CONFIG.leveling.expPerLevel[this.level];
        } else {
            this.expToNextLevel = Infinity;
        }
        
        // Recalculate stats
        this.calculateStats();
        
        // Heal a bit on level up
        this.health = Math.min(this.health + 50, this.stats.maxHealth);
        this.mana = Math.min(this.mana + 30, this.stats.maxMana);
        
        // Effect
        EffectManager.createExplosion(this.x, this.y, 40, '#fbbf24');
    }
    
    /**
     * Level up ability
     */
    levelUpAbility(abilityKey) {
        if (this.abilityPoints <= 0) return false;
        
        const ability = this.heroData.abilities[abilityKey];
        if (!ability) return false;
        
        const currentLevel = this.abilityLevels[abilityKey];
        
        // Check max level
        if (currentLevel >= ability.maxLevel) return false;
        
        // Ultimate restrictions
        if (abilityKey === 't') {
            if (this.level < 4) return false;
            if (currentLevel >= 1 && this.level < 8) return false;
            if (currentLevel >= 2 && this.level < 12) return false;
        }
        
        this.abilityLevels[abilityKey] = currentLevel + 1;
        this.abilityPoints--;
        
        return true;
    }
    
    /**
     * Add buff
     */
    addBuff(buff) {
        if (!Array.isArray(this.buffs)) {
            this.buffs = [];
        }
        this.buffs.push(buff);
        this.calculateStats();
    }
    
    /**
     * Add debuff
     */
    addDebuff(debuff) {
        if (!Array.isArray(this.debuffs)) {
            this.debuffs = [];
        }
        this.debuffs.push(debuff);
    }
    
    /**
     * Remove debuff
     */
    removeDebuff(debuff) {
        if (!Array.isArray(this.debuffs)) return;
        const index = this.debuffs.indexOf(debuff);
        if (index !== -1) {
            this.debuffs.splice(index, 1);
        }
    }
    
    /**
     * Add shield
     */
    addShield(amount, duration) {
        this.shield += amount;
        
        // Shield expires
        setTimeout(() => {
            this.shield = Math.max(0, this.shield - amount);
        }, duration);
    }
    
    /**
     * Reduce cooldowns
     */
    reduceCooldowns(amount) {
        for (const key of Object.keys(this.abilityCooldowns)) {
            this.abilityCooldowns[key] = Math.max(0, this.abilityCooldowns[key] - amount);
        }
    }
    
    /**
     * Add passive stack
     */
    addPassiveStack() {
        this.passiveStacks = Math.min(
            (this.passiveStacks || 0) + 1,
            this.heroData.passive.maxStacks
        );
        this.passiveLastHit = Date.now();
    }
    
    /**
     * Break invisibility
     */
    breakInvisibility() {
        this.invisible = false;
        // Remove invisibility buff
        if (Array.isArray(this.buffs)) {
            this.buffs = this.buffs.filter(b => !b.invisible);
        }
        this.calculateStats();
    }
    
    /**
     * Is in brush
     */
    isInBrush() {
        return GameMap.isInBrush(this.x, this.y);
    }
    
    /**
     * Is visible to enemy
     */
    isVisibleTo(viewer) {
        if (viewer.team === this.team) return true;
        if (this.invisible && !viewer.isInBrush()) return false;
        if (this.isInBrush() && !viewer.isInBrush()) return false;
        return true;
    }
    
    /**
     * Render hero
     */
    render(ctx) {
        if (this.isDead) return;
        
        // Don't render invisible enemies
        if (this.invisible && !this.isPlayer && this.team !== HeroManager.player?.team) {
            return;
        }
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // In brush indicator
        if (this.isInBrush()) {
            ctx.globalAlpha = 0.6;
        }
        
        // Body
        const gradient = ctx.createRadialGradient(0, -5, 5, 0, 10, this.radius);
        gradient.addColorStop(0, this.heroData.color);
        gradient.addColorStop(1, this.color);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Role indicator
        ctx.fillStyle = '#1a1a2e';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.heroData.icon, 0, 0);
        
        // Direction indicator
        ctx.fillStyle = this.heroData.color;
        ctx.rotate(this.facingAngle);
        ctx.beginPath();
        ctx.moveTo(this.radius + 15, 0);
        ctx.lineTo(this.radius, -8);
        ctx.lineTo(this.radius, 8);
        ctx.closePath();
        ctx.fill();
        
        ctx.globalAlpha = 1;
        ctx.restore();
        
        // Health bar
        this.renderHealthBar(ctx);
        
        // Name
        this.renderName(ctx);
        
        // Shield indicator
        if (this.shield > 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // CC indicator
        if (Array.isArray(this.debuffs) && this.debuffs.some(d => d.type === 'stun' || d.type === 'knockup')) {
            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('💫', this.x, this.y - this.radius - 30);
        }
    }
    
    /**
     * Render health bar
     */
    renderHealthBar(ctx) {
        const barWidth = this.radius * 2.5;
        const barHeight = 8;
        const barY = this.y - this.radius - 20;
        
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(this.x - barWidth / 2 - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        // Health
        const healthPercent = this.health / this.stats.maxHealth;
        ctx.fillStyle = this.team === CONFIG.teams.BLUE ? '#22c55e' : '#ef4444';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        
        // Shield
        if (this.shield > 0) {
            const shieldPercent = Math.min(this.shield / this.stats.maxHealth, 1 - healthPercent);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
                this.x - barWidth / 2 + barWidth * healthPercent,
                barY,
                barWidth * shieldPercent,
                barHeight
            );
        }
        
        // Mana bar
        const manaY = barY + barHeight + 2;
        const manaHeight = 4;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(this.x - barWidth / 2, manaY, barWidth, manaHeight);
        
        const manaPercent = this.mana / this.stats.maxMana;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(this.x - barWidth / 2, manaY, barWidth * manaPercent, manaHeight);
    }
    
    /**
     * Render name
     */
    renderName(ctx) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y - this.radius - 35);
        
        // Level
        ctx.font = '10px Arial';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Lv.${this.level}`, this.x, this.y - this.radius - 48);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeroRegistry, HeroManager, Hero };
}
