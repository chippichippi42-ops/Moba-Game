/**
 * ========================================
 * MOBA Arena - Creature System (Enhanced)
 * ========================================
 * With complete Creature Abilities API
 */

const CreatureManager = {
    creatures: [],
    camps: [],
    
    init() {
        this.creatures = [];
        this.camps = [];
        this.createCampsFromConfig();
    },
    
    createCampsFromConfig() {
        if (!CONFIG.creatureCamps || !Array.isArray(CONFIG.creatureCamps)) {
            console.warn('No creature camps configured');
            return;
        }
        
        for (const campData of CONFIG.creatureCamps) {
            const camp = {
                id: Utils.generateId(),
                x: campData.x,
                y: campData.y,
                type: campData.type,
                team: campData.team,
                name: campData.name,
                creatures: [],
                respawnTimer: 0,
                isCleared: false,
                spawnDelayTimer: 0,
                hasSpawned: false,
            };
            
            // Don't spawn immediately - wait for spawn delay
            // this.spawnCamp(camp);
            this.camps.push(camp);
        }
    },
    
    spawnCamp(camp) {
        camp.isCleared = false;
        camp.creatures = [];
        
        const creatureType = CONFIG.creatureTypes[camp.type];
        if (!creatureType) {
            console.warn(`Unknown creature type: ${camp.type}`);
            return;
        }
        
        const safePos = GameMap.findSafeSpawnPosition(camp.x, camp.y, creatureType.radius || 30);
        camp.x = safePos.x;
        camp.y = safePos.y;
        
        const mainCreature = new Creature({
            x: camp.x,
            y: camp.y,
            type: camp.type,
            camp: camp,
            name: camp.name,
            isMain: true,
        });
        camp.creatures.push(mainCreature);
        this.creatures.push(mainCreature);
        
        if (creatureType.minions) {
            for (const minionDef of creatureType.minions) {
                const minionType = CONFIG.creatureTypes[minionDef.type];
                if (!minionType) continue;
                
                for (let i = 0; i < minionDef.count; i++) {
                    const angle = (i / minionDef.count) * Math.PI * 2;
                    const dist = 60 + Math.random() * 30;
                    const minionX = camp.x + Math.cos(angle) * dist;
                    const minionY = camp.y + Math.sin(angle) * dist;
                    
                    const safeMinionPos = GameMap.findSafeSpawnPosition(minionX, minionY, minionType.radius || 20);
                    
                    const minion = new Creature({
                        x: safeMinionPos.x,
                        y: safeMinionPos.y,
                        type: minionDef.type,
                        camp: camp,
                        name: minionDef.type.replace('_', ' '),
                        isMain: false,
                    });
                    camp.creatures.push(minion);
                    this.creatures.push(minion);
                }
            }
        }
        
        if (creatureType.count && creatureType.count > 1) {
            for (let i = 1; i < creatureType.count; i++) {
                const angle = (i / creatureType.count) * Math.PI * 2;
                const dist = 40 + Math.random() * 20;
                const extraX = camp.x + Math.cos(angle) * dist;
                const extraY = camp.y + Math.sin(angle) * dist;
                
                const safeExtraPos = GameMap.findSafeSpawnPosition(extraX, extraY, creatureType.radius || 20);
                
                const extra = new Creature({
                    x: safeExtraPos.x,
                    y: safeExtraPos.y,
                    type: camp.type,
                    camp: camp,
                    name: camp.name,
                    isMain: false,
                });
                camp.creatures.push(extra);
                this.creatures.push(extra);
            }
        }
    },
    
    update(deltaTime, entities) {
        for (const camp of this.camps) {
            // Handle initial spawn delay
            if (!camp.hasSpawned) {
                camp.spawnDelayTimer += deltaTime;
                const creatureType = CONFIG.creatureTypes[camp.type];
                const spawnDelay = creatureType?.spawnDelay || 0;
                
                if (camp.spawnDelayTimer >= spawnDelay) {
                    this.spawnCamp(camp);
                    camp.hasSpawned = true;
                }
            } else if (camp.isCleared) {
                // Handle respawn after camp is cleared
                camp.respawnTimer -= deltaTime;
                if (camp.respawnTimer <= 0) {
                    this.spawnCamp(camp);
                    camp.isCleared = false;
                    camp.hasSpawned = true;
                }
            } else {
                // Check if camp is cleared
                const alive = camp.creatures.filter(c => c.isAlive);
                if (alive.length === 0) {
                    camp.isCleared = true;
                    const creatureType = CONFIG.creatureTypes[camp.type];
                    camp.respawnTimer = creatureType?.respawnTime || 60000;
                    // Reset spawn delay for next respawn
                    camp.hasSpawned = false;
                    camp.spawnDelayTimer = 0;
                }
            }
        }
        
        for (let i = this.creatures.length - 1; i >= 0; i--) {
            const creature = this.creatures[i];
            creature.update(deltaTime, entities);
            
            if (!creature.isAlive) {
                this.creatures.splice(i, 1);
            }
        }
    },
    
    render(ctx) {
        for (const camp of this.camps) {
            this.renderCamp(ctx, camp);
        }
        
        for (const creature of this.creatures) {
            creature.render(ctx);
        }
    },
    
    renderCamp(ctx, camp) {
        const creatureType = CONFIG.creatureTypes[camp.type];
        if (!creatureType) return;
        
        const roamRadius = 350;
        
        ctx.strokeStyle = camp.team === 'neutral' ? CONFIG.colors.neutral :
                          camp.team === 'blue' ? CONFIG.colors.blueTeam : CONFIG.colors.redTeam;
        ctx.lineWidth = 2;
        ctx.globalAlpha = (!camp.hasSpawned || camp.isCleared) ? 0.2 : 0.3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(camp.x, camp.y, roamRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        
        // Show timer for initial spawn delay
        if (!camp.hasSpawned) {
            const spawnDelay = creatureType?.spawnDelay || 0;
            const remaining = Math.ceil((spawnDelay - camp.spawnDelayTimer) / 1000);
            ctx.font = '14px Arial';
            ctx.fillStyle = '#fbbf24';
            ctx.textAlign = 'center';
            ctx.fillText(
                remaining + 's',
                camp.x,
                camp.y + 5
            );
        } else if (camp.isCleared) {
            // Show respawn timer
            ctx.font = '14px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(
                Math.ceil(camp.respawnTimer / 1000) + 's',
                camp.x,
                camp.y + 5
            );
        }
    },
    
    getCreaturesInRange(x, y, range) {
        return this.creatures.filter(c => {
            if (!c.isAlive) return false;
            return Utils.distance(x, y, c.x, c.y) <= range;
        });
    },
    
    getAll() {
        return this.creatures;
    },
    
    clear() {
        this.creatures = [];
        this.camps = [];
    },
};

/**
 * ========================================
 * Creature Abilities API
 * ========================================
 */
const CreatureAbilityAPI = {
    /**
     * Execute ability by trigger type
     */
    execute(creature, trigger, context = {}) {
        const abilities = creature.abilities;
        if (!abilities) return;
        
        for (const [abilityName, ability] of Object.entries(abilities)) {
            if (ability.trigger === trigger) {
                this.executeAbility(creature, abilityName, ability, context);
            }
            
            // Handle conditional triggers
            if (trigger === 'on_damage_taken') {
                if (ability.trigger === 'health_below_50' && !creature.abilityTriggered[abilityName]) {
                    if (creature.health / creature.maxHealth <= 0.5) {
                        this.executeAbility(creature, abilityName, ability, context);
                        creature.abilityTriggered[abilityName] = true;
                    }
                }
                if (ability.trigger === 'health_below_30' && !creature.abilityTriggered[abilityName]) {
                    if (creature.health / creature.maxHealth <= 0.3) {
                        this.executeAbility(creature, abilityName, ability, context);
                        creature.abilityTriggered[abilityName] = true;
                    }
                }
            }
            
            // Handle attack count triggers
            if (trigger === 'on_attack' && ability.trigger) {
                const match = ability.trigger.match(/every_(\d+)_attacks/);
                if (match) {
                    const count = parseInt(match[1]);
                    if (creature.attackCount % count === 0) {
                        this.executeAbility(creature, abilityName, ability, context);
                    }
                }
            }
        }
    },
    
    /**
     * Execute a specific ability
     */
    executeAbility(creature, abilityName, ability, context) {
        const handler = this.abilityHandlers[ability.effect];
        if (handler) {
            handler(creature, ability, context);
        } else {
            console.warn(`No handler for ability effect: ${ability.effect}`);
        }
    },
    
    /**
     * Ability effect handlers
     */
    abilityHandlers: {
        // Damage reduction shield
        damage_reduction(creature, ability, context) {
            creature.damageReductionBuff = {
                value: ability.value || 0.3,
                duration: ability.duration || 3000,
                startTime: Date.now(),
            };
            EffectManager.createExplosion(creature.x, creature.y, 60, '#00ffff');
        },
        
        // Armor boost
        armor_boost(creature, ability, context) {
            creature.armorBuff = {
                value: ability.value || 20,
                duration: ability.duration || 2000,
                startTime: Date.now(),
            };
            EffectManager.createExplosion(creature.x, creature.y, 40, '#8b4513');
        },
        
        // Dodge chance
        dodge(creature, ability, context) {
            // Visual feedback only, dodge is checked in takeDamage
            EffectManager.createExplosion(creature.x, creature.y, 30, '#4a0080');
        },
        
        // Slow effect on hit
        slow(creature, ability, context) {
            const target = context.target;
            if (target && typeof target.addDebuff === 'function') {
                target.addDebuff({
                    type: 'slow',
                    percent: (ability.value || 0.3) * 100,
                    duration: ability.duration || 1500,
                    source: creature,
                });
            }
        },
        
        // DoT aura
        dot(creature, ability, context) {
            const entities = context.entities || Game.getAllEntities();
            const range = ability.range || 200;
            
            for (const entity of entities) {
                if (!entity.isAlive) continue;
                if (entity === creature) continue;
                if (entity.team === creature.team) continue;
                
                const dist = Utils.distance(creature.x, creature.y, entity.x, entity.y);
                if (dist <= range) {
                    Combat.dealDamage(creature, entity, ability.damage || 15, 'magical');
                }
            }
        },
        
        // Slow aura
        slow_aura(creature, ability, context) {
            const entities = context.entities || Game.getAllEntities();
            const range = ability.range || 250;
            
            for (const entity of entities) {
                if (!entity.isAlive) continue;
                if (entity === creature) continue;
                if (entity.team === creature.team) continue;
                
                const dist = Utils.distance(creature.x, creature.y, entity.x, entity.y);
                if (dist <= range && typeof entity.addDebuff === 'function') {
                    entity.addDebuff({
                        type: 'slow',
                        percent: (ability.value || 0.2) * 100,
                        duration: 500,
                        source: creature,
                    });
                }
            }
        },
        
        // AOE damage slam
        aoe_damage(creature, ability, context) {
            const entities = context.entities || Game.getAllEntities();
            const radius = ability.radius || 300;
            
            for (const entity of entities) {
                if (!entity.isAlive) continue;
                if (entity === creature) continue;
                if (entity.team === creature.team) continue;
                
                const dist = Utils.distance(creature.x, creature.y, entity.x, entity.y);
                if (dist <= radius) {
                    Combat.dealDamage(creature, entity, ability.damage || 100, 'physical');
                    
                    // Knockback
                    if (ability.knockback && entity.vx !== undefined) {
                        const angle = Utils.angleBetween(creature, entity);
                        entity.vx += Math.cos(angle) * ability.knockback;
                        entity.vy += Math.sin(angle) * ability.knockback;
                    }
                }
            }
            EffectManager.createExplosion(creature.x, creature.y, radius, creature.color);
        },
        
        // Mana burn
        mana_burn(creature, ability, context) {
            const target = context.target;
            if (target && target.mana !== undefined) {
                const burnAmount = ability.value || 50;
                target.mana = Math.max(0, target.mana - burnAmount);
                Combat.dealDamage(creature, target, ability.damage || 80, 'magical');
                EffectManager.createExplosion(target.x, target.y, 40, '#8b008b');
            }
        },
        
        // Summon voidlings
        summon_voidlings(creature, ability, context) {
            const count = ability.count || 3;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const dist = 80;
                const x = creature.x + Math.cos(angle) * dist;
                const y = creature.y + Math.sin(angle) * dist;
                
                // Create temporary minion effect
                EffectManager.createExplosion(x, y, 30, '#8b008b');
            }
        },
        
        // Heal when out of combat
        heal(creature, ability, context) {
            if (!creature.inCombat) {
                const healAmount = creature.maxHealth * (ability.value || 0.02);
                creature.health = Math.min(creature.maxHealth, creature.health + healAmount);
            }
        },
    },
    
    /**
     * Check if creature should dodge (for shadow wisps)
     */
    shouldDodge(creature) {
        const ability = creature.abilities?.phaseShift;
        if (!ability) return false;
        return Math.random() < (ability.chance || 0.15);
    },
    
    /**
     * Update passive abilities (called every frame)
     */
    updatePassives(creature, deltaTime, entities) {
        if (!creature.abilities) return;
        
        // Update buff durations
        if (creature.damageReductionBuff) {
            if (Date.now() - creature.damageReductionBuff.startTime > creature.damageReductionBuff.duration) {
                creature.damageReductionBuff = null;
            }
        }
        
        if (creature.armorBuff) {
            if (Date.now() - creature.armorBuff.startTime > creature.armorBuff.duration) {
                creature.armorBuff = null;
            }
        }
        
        // Process passive abilities
        for (const [abilityName, ability] of Object.entries(creature.abilities)) {
            if (ability.trigger === 'passive') {
                // Tick-based passives
                if (!creature.abilityTimers) creature.abilityTimers = {};
                if (!creature.abilityTimers[abilityName]) creature.abilityTimers[abilityName] = 0;
                
                creature.abilityTimers[abilityName] += deltaTime;
                
                const tickRate = ability.tickRate || 1000;
                if (creature.abilityTimers[abilityName] >= tickRate) {
                    creature.abilityTimers[abilityName] = 0;
                    this.executeAbility(creature, abilityName, ability, { entities });
                }
            }
            
            if (ability.trigger === 'out_of_combat') {
                if (!creature.inCombat) {
                    if (!creature.abilityTimers) creature.abilityTimers = {};
                    if (!creature.abilityTimers[abilityName]) creature.abilityTimers[abilityName] = 0;
                    
                    creature.abilityTimers[abilityName] += deltaTime;
                    
                    const tickRate = ability.tickRate || 1000;
                    if (creature.abilityTimers[abilityName] >= tickRate) {
                        creature.abilityTimers[abilityName] = 0;
                        this.executeAbility(creature, abilityName, ability, { entities });
                    }
                }
            }
        }
    },
};

/**
 * Creature Class - Enhanced with Ability API
 */
class Creature {
    constructor(config) {
        this.id = Utils.generateId();
        this.type = 'creature';
        this.creatureType = config.type;
        this.camp = config.camp;
        this.name = config.name;
        this.isMain = config.isMain || false;
        
        this.x = config.x;
        this.y = config.y;
        this.homeX = config.x;
        this.homeY = config.y;
        
        this.team = CONFIG.teams.NEUTRAL;
        
        const typeData = CONFIG.creatureTypes[this.creatureType];
        if (typeData) {
            this.maxHealth = typeData.health;
            this.health = typeData.health;
            this.damage = typeData.damage;
            this.armor = typeData.armor || 0;
            this.attackRange = typeData.attackRange || 150;
            this.attackSpeed = typeData.attackSpeed || 0.8;
            this.speed = typeData.speed || 200;
            this.exp = typeData.exp || 50;
            this.radius = typeData.radius || 25;
            this.color = typeData.color || '#94a3b8';
            this.icon = typeData.icon || '';
            this.abilities = typeData.abilities ? Utils.deepClone(typeData.abilities) : {};
            this.buff = typeData.buff || null;
            this.passive = typeData.passive || false;
            this.flees = typeData.flees || false;
            this.onKill = typeData.onKill || null;
        } else {
            this.maxHealth = 500;
            this.health = 500;
            this.damage = 30;
            this.armor = 10;
            this.attackRange = 150;
            this.attackSpeed = 0.8;
            this.speed = 200;
            this.exp = 50;
            this.radius = 25;
            this.color = '#94a3b8';
            this.icon = '';
            this.abilities = {};
        }
        
        this.roamRadius = 350;
        this.leashRange = 500;
        
        this.isAlive = true;
        this.state = 'idle';
        this.target = null;
        this.attackCooldown = 0;
        this.aggroList = new Map();
        
        this.roamTimer = Utils.random(2000, 5000);
        this.roamTarget = null;
        
        this.vx = 0;
        this.vy = 0;
        this.facingAngle = 0;
        
        this.abilityState = {};
        this.attackCount = 0;
        this.abilityTriggered = {};
        this.abilityTimers = {};
        
        this.inCombat = false;
        this.lastCombatTime = 0;
        this.combatTimeout = 5000;
        
        // Buffs from abilities
        this.damageReductionBuff = null;
        this.armorBuff = null;
    }
    
    update(deltaTime, entities) {
        if (!this.isAlive) return;
        
        if (GameMap.checkWallCollision(this.x, this.y, this.radius)) {
            const safePos = GameMap.findSafeSpawnPosition(this.homeX, this.homeY, this.radius);
            this.x = safePos.x;
            this.y = safePos.y;
        }
        
        // Update combat state
        if (Date.now() - this.lastCombatTime > this.combatTimeout) {
            this.inCombat = false;
        }
        
        this.attackCooldown -= deltaTime;
        this.updateAI(deltaTime, entities);
        this.updateMovement(deltaTime);
        
        // Update abilities via API
        CreatureAbilityAPI.updatePassives(this, deltaTime, entities);
    }
    
    updateAI(deltaTime, entities) {
        if (this.passive && this.flees) {
            this.updateFleeingBehavior(deltaTime, entities);
            return;
        }
        
        switch (this.state) {
            case 'idle':
                this.updateIdle(deltaTime);
                break;
            case 'roaming':
                this.updateRoaming(deltaTime);
                break;
            case 'attacking':
                this.updateAttacking(deltaTime, entities);
                break;
            case 'returning':
                this.updateReturning(deltaTime);
                break;
        }
        
        if (this.state !== 'attacking' && this.aggroList.size > 0) {
            let closestDist = Infinity;
            let closestTarget = null;
            
            for (const [entityId, timestamp] of this.aggroList) {
                if (Date.now() - timestamp > 5000) {
                    this.aggroList.delete(entityId);
                    continue;
                }
                
                const entity = entities.find(e => e.id === entityId);
                if (entity && entity.isAlive) {
                    const dist = Utils.distance(this.x, this.y, entity.x, entity.y);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestTarget = entity;
                    }
                }
            }
            
            if (closestTarget) {
                this.target = closestTarget;
                this.state = 'attacking';
                this.inCombat = true;
                this.lastCombatTime = Date.now();
                
                // Trigger combat_start abilities
                CreatureAbilityAPI.execute(this, 'combat_start', { target: closestTarget, entities });
            }
        }
    }
    
    updateFleeingBehavior(deltaTime, entities) {
        let nearestThreat = null;
        let nearestDist = 400;
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            if (entity.type !== 'hero') continue;
            
            const dist = Utils.distance(this.x, this.y, entity.x, entity.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestThreat = entity;
            }
        }
        
        if (nearestThreat) {
            const angle = Utils.angleBetweenPoints(nearestThreat.x, nearestThreat.y, this.x, this.y);
            this.facingAngle = angle;
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        } else {
            this.updateIdle(deltaTime);
        }
    }
    
    updateIdle(deltaTime) {
        this.vx = 0;
        this.vy = 0;
        
        this.roamTimer -= deltaTime;
        if (this.roamTimer <= 0) {
            this.roamTimer = Utils.random(3000, 6000);
            const angle = Math.random() * Math.PI * 2;
            const dist = Utils.random(50, this.roamRadius);
            this.roamTarget = {
                x: this.homeX + Math.cos(angle) * dist,
                y: this.homeY + Math.sin(angle) * dist,
            };
            this.state = 'roaming';
        }
    }
    
    updateRoaming(deltaTime) {
        if (!this.roamTarget) {
            this.state = 'idle';
            return;
        }
        
        const dist = Utils.distance(this.x, this.y, this.roamTarget.x, this.roamTarget.y);
        if (dist < 20) {
            this.state = 'idle';
            this.roamTarget = null;
            return;
        }
        
        this.moveTowards(this.roamTarget.x, this.roamTarget.y);
    }
    
    updateAttacking(deltaTime, entities) {
        if (!this.target || !this.target.isAlive) {
            this.target = null;
            this.state = 'returning';
            return;
        }
        
        const distFromHome = Utils.distance(this.x, this.y, this.homeX, this.homeY);
        if (distFromHome > this.leashRange) {
            this.aggroList.clear();
            this.target = null;
            this.state = 'returning';
            this.inCombat = false;
            return;
        }
        
        const dist = Utils.distance(this.x, this.y, this.target.x, this.target.y);
        
        if (dist <= this.attackRange) {
            this.vx = 0;
            this.vy = 0;
            
            if (this.attackCooldown <= 0) {
                this.attack(this.target, entities);
            }
        } else {
            this.moveTowards(this.target.x, this.target.y);
        }
    }
    
    updateReturning(deltaTime) {
        const dist = Utils.distance(this.x, this.y, this.homeX, this.homeY);
        
        if (dist < 20) {
            this.state = 'idle';
            this.vx = 0;
            this.vy = 0;
            this.health = this.maxHealth;
            this.abilityTriggered = {};
            return;
        }
        
        this.moveTowards(this.homeX, this.homeY);
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
            } else if (!GameMap.checkWallCollision(this.x, newY, this.radius)) {
                this.y = newY;
            }
        }
        
        this.x = Utils.clamp(this.x, this.radius, CONFIG.map.width - this.radius);
        this.y = Utils.clamp(this.y, this.radius, CONFIG.map.height - this.radius);
    }
    
    attack(target, entities) {
        if (this.passive) return;
        
        this.inCombat = true;
        this.lastCombatTime = Date.now();
        
        Combat.dealDamage(this, target, this.damage, 'physical');
        this.attackCooldown = 1000 / this.attackSpeed;
        this.attackCount++;
        
        // Trigger on_hit abilities via API
        CreatureAbilityAPI.execute(this, 'on_hit', { target, entities });
        
        // Trigger on_attack abilities via API
        CreatureAbilityAPI.execute(this, 'on_attack', { target, entities });
    }
    
    takeDamage(amount, attacker, damageType) {
        if (!this.isAlive) return 0;
        
        // Check dodge (shadow wisps)
        if (CreatureAbilityAPI.shouldDodge(this)) {
            EffectManager.createExplosion(this.x, this.y, 20, '#4a0080');
            return 0;
        }
        
        let actualDamage = amount;
        
        // Apply damage reduction buff
        if (this.damageReductionBuff) {
            actualDamage *= (1 - this.damageReductionBuff.value);
        }
        
        // Apply armor (including buff)
        if (damageType === 'physical') {
            let totalArmor = this.armor;
            if (this.armorBuff) {
                totalArmor += this.armorBuff.value;
            }
            const reduction = totalArmor / (totalArmor + 100);
            actualDamage = actualDamage * (1 - reduction);
        }
        
        actualDamage = Math.min(this.health, actualDamage);
        this.health -= actualDamage;
        
        if (attacker) {
            this.aggroList.set(attacker.id, Date.now());
            this.inCombat = true;
            this.lastCombatTime = Date.now();
        }
        
        // Trigger on_damage_taken abilities via API
        CreatureAbilityAPI.execute(this, 'on_damage_taken', { attacker, damage: actualDamage });
        
        EffectManager.createDamageNumber(this.x, this.y, actualDamage, damageType);
        
        if (this.health <= 0) {
            this.die(attacker);
        }
        
        return actualDamage;
    }
    
    die(killer) {
        this.isAlive = false;
        this.health = 0;
        
        Combat.distributeExperience(this, killer, this.exp);
        
        if (this.buff && killer && killer.type === 'hero') {
            killer.addBuff({
                type: this.buff.name,
                ...this.buff,
            });
            UI.addKillFeed(killer, this.name + ' (Buff)', 'buff');
        }
        
        if (this.onKill && killer && killer.type === 'hero') {
            if (this.onKill.effect === 'grant_vision') {
                killer.addBuff({
                    type: 'vision_boost',
                    duration: this.onKill.duration,
                });
            }
            if (this.onKill.speedBoost) {
                killer.addBuff({
                    type: 'speed_boost',
                    speedBoost: this.onKill.speedBoost,
                    duration: this.onKill.speedDuration,
                });
            }
        }
        
        EffectManager.createExplosion(this.x, this.y, this.radius * 1.5, this.color);
    }
    
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(3, 5, this.radius * 0.8, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Render based on creature type
        this.renderCreatureBody(ctx);
        
        ctx.restore();
        
        this.renderHealthBar(ctx);
        this.renderBuffIndicators(ctx);
        
        ctx.font = '11px Arial';
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y - this.radius - 18);
    }
    
    renderCreatureBody(ctx) {
        const time = Date.now() / 1000;
        
        // Outer glow based on type
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 1.3);
        glowGradient.addColorStop(0, this.color + '60');
        glowGradient.addColorStop(0.5, this.color + '30');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Main body with gradient
        const bodyGradient = ctx.createRadialGradient(-this.radius * 0.3, -this.radius * 0.3, 0, 0, 0, this.radius);
        bodyGradient.addColorStop(0, this.lightenColor(this.color, 40));
        bodyGradient.addColorStop(0.7, this.color);
        bodyGradient.addColorStop(1, this.darkenColor(this.color, 40));
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner pattern based on type
        this.renderCreaturePattern(ctx, time);
        
        // Eyes
        const eyeOffset = this.radius * 0.3;
        const eyeSize = this.radius * 0.15;
        const pupilSize = eyeSize * 0.6;
        
        // Eye glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-eyeOffset, -this.radius * 0.2, eyeSize, 0, Math.PI * 2);
        ctx.arc(eyeOffset, -this.radius * 0.2, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils (look at target or facing direction)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1a1a2e';
        const lookX = Math.cos(this.facingAngle) * pupilSize * 0.3;
        const lookY = Math.sin(this.facingAngle) * pupilSize * 0.3;
        ctx.beginPath();
        ctx.arc(-eyeOffset + lookX, -this.radius * 0.2 + lookY, pupilSize, 0, Math.PI * 2);
        ctx.arc(eyeOffset + lookX, -this.radius * 0.2 + lookY, pupilSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon
        if (this.icon) {
            ctx.font = `${this.radius * 0.8}px Arial`;
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.icon, 0, this.radius * 0.3);
        }
        
        // Attacking indicator
        if (this.state === 'attacking') {
            ctx.fillStyle = '#ef4444';
            ctx.rotate(this.facingAngle);
            ctx.beginPath();
            ctx.moveTo(this.radius + 12, 0);
            ctx.lineTo(this.radius + 2, -6);
            ctx.lineTo(this.radius + 2, 6);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    renderCreaturePattern(ctx, time) {
        ctx.globalAlpha = 0.3;
        
        switch (this.creatureType) {
            case 'crystal_golem':
                // Crystal facets
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + time * 0.5;
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(angle) * this.radius * 0.8, Math.sin(angle) * this.radius * 0.8);
                    ctx.stroke();
                }
                break;
                
            case 'shadow_wisps':
                // Swirling shadows
                for (let i = 0; i < 3; i++) {
                    const angle = (i / 3) * Math.PI * 2 + time * 2;
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(
                        Math.cos(angle) * this.radius * 0.5,
                        Math.sin(angle) * this.radius * 0.5,
                        this.radius * 0.2,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                }
                break;
                
            case 'ember_spirit':
            case 'frost_elemental':
                // Elemental core
                const coreColor = this.creatureType === 'ember_spirit' ? '#ff6600' : '#00ccff';
                ctx.fillStyle = coreColor;
                ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.2;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'ancient_titan':
            case 'void_herald':
                // Runic circles
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
        
        ctx.globalAlpha = 1;
    }
    
    renderHealthBar(ctx) {
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent >= 1) return;
        
        const barWidth = this.radius * 2.2;
        const barHeight = 6;
        const barY = this.y - this.radius - 12;
        
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : 
                        healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
    }
    
    renderBuffIndicators(ctx) {
        let indicatorY = this.y - this.radius - 25;
        
        if (this.damageReductionBuff) {
            ctx.fillStyle = '#00ffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🛡️', this.x - 10, indicatorY);
        }
        
        if (this.armorBuff) {
            ctx.fillStyle = '#8b4513';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🪨', this.x + 10, indicatorY);
        }
    }
    
    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CreatureManager, CreatureAbilityAPI, Creature };
}
