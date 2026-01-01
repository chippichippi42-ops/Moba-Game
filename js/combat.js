/**
 * ========================================
 * MOBA Arena - Combat System (Updated)
 * ========================================
 * Xử lý sát thương, hiệu ứng, và combat logic
 * CẬP NHẬT: Hệ thống kinh nghiệm mới
 */

const Combat = {
    // Damage log for assist tracking AND exp sharing
    damageLog: new Map(),
    
    /**
     * Deal damage from source to target
     */
    dealDamage(source, target, amount, damageType = 'physical') {
        if (!target || !target.isAlive) return 0;
        if (target.untargetable) return 0;
        
        // Same team check (except for some special cases)
        if (source && target.team === source.team) return 0;
        
        let finalDamage = amount;
        
        // Critical strike (only for heroes with physical damage)
        if (source && source.type === 'hero' && damageType === 'physical') {
            if (Math.random() * 100 < source.stats.critChance) {
                finalDamage *= (source.stats.critDamage / 100);
            }
        }
        
        // Deal damage based on target type
        let actualDamage = 0;
        
        if (typeof target.takeDamage === 'function') {
            actualDamage = target.takeDamage(finalDamage, source, damageType);
        }
        
        // Track damage for assists AND exp sharing
        if (source && (target.type === 'hero' || target.type === 'minion' || target.type === 'creature')) {
            this.trackDamage(source, target, actualDamage);
        }
        
        // Update source stats
        if (source && source.type === 'hero') {
            source.totalDamageDealt += actualDamage;
        }
        
        return actualDamage;
    },
    
    /**
     * Track damage for assist system AND exp sharing
     */
    trackDamage(source, target, amount) {
        const key = target.id;
        
        if (!this.damageLog.has(key)) {
            this.damageLog.set(key, new Map());
        }
        
        const targetLog = this.damageLog.get(key);
        const current = targetLog.get(source.id) || { amount: 0, timestamp: 0 };
        
        targetLog.set(source.id, {
            amount: current.amount + amount,
            timestamp: Date.now(),
            source: source,
        });
    },
    
    /**
     * Get heroes who participated in killing a target
     * Returns array of { hero, isLastHit }
     */
    getParticipatingHeroes(target, killer) {
        const key = target.id;
        const targetLog = this.damageLog.get(key);
        
        const participants = [];
        const now = Date.now();
        const participationWindow = 10000; // 10 seconds
        
        if (targetLog) {
            for (const [sourceId, data] of targetLog) {
                // Within participation window
                if (now - data.timestamp < participationWindow) {
                    // Only count heroes
                    if (data.source && data.source.type === 'hero') {
                        participants.push({
                            hero: data.source,
                            isLastHit: data.source === killer,
                        });
                    }
                }
            }
        }
        
        // If killer is a hero and not in participants, add them
        if (killer && killer.type === 'hero') {
            const killerInList = participants.find(p => p.hero === killer);
            if (!killerInList) {
                participants.push({
                    hero: killer,
                    isLastHit: true,
                });
            }
        }
        
        // Clear log
        this.damageLog.delete(key);
        
        return participants;
    },
    
    /**
     * Lấy tất cả tướng gây sát thương trong 5 giây cuối + kèm damage data
     * Trả về array of {hero, damageAmount, timestamp}
     */
    getHeroesInLastFiveSecondsWithDamage(target, killer) {
        const key = target.id;
        const targetLog = this.damageLog.get(key);
        
        const participantsData = [];
        const now = Date.now();
        const window = 5000; // 5 giây
        
        if (targetLog) {
            for (const [sourceId, data] of targetLog) {
                // Nếu source là tướng và trong 5 giây
                if (data.source && data.source.type === 'hero' && now - data.timestamp < window) {
                    participantsData.push({
                        hero: data.source,
                        damageAmount: data.amount,
                        timestamp: data.timestamp,
                    });
                }
            }
        }
        
        // Nếu killer là tướng nhưng không trong danh sách → thêm vào
        if (killer && killer.type === 'hero') {
            const killerExists = participantsData.find(p => p.hero === killer);
            if (!killerExists) {
                participantsData.push({
                    hero: killer,
                    damageAmount: 0,
                    timestamp: now,
                });
            }
        }
        
        return participantsData;
    },
    
    /**
     * Tìm tướng gây sát thương GẦN NHẤT (timestamp gần nhất)
     * Nếu cùng timestamp, lấy tướng đầu tiên
     */
    getMostRecentDamageHero(participantsData) {
        if (participantsData.length === 0) return null;
        if (participantsData.length === 1) return participantsData[0].hero;
        
        // Tìm tướng có timestamp cao nhất (gây sát thương gần nhất)
        let mostRecent = participantsData[0];
        for (const p of participantsData) {
            if (p.timestamp > mostRecent.timestamp) {
                mostRecent = p;
            }
        }
        
        return mostRecent.hero;
    },
    
    /**
     * Distribute experience to participating heroes
     * @param {Object} target - The killed entity
     * @param {Object} killer - Who dealt the killing blow (could be minion/tower/hero)
     * @param {number} baseExp - Base experience value
     */
    distributeExperience(target, killer, baseExp) {
        const participants = this.getParticipatingHeroes(target, killer);
        
        // Count only heroes for exp reduction
        const heroCount = participants.length;
        
        if (heroCount === 0) {
            // No heroes involved, no exp distributed
            return;
        }
        
        // Calculate exp reduction per hero based on number of heroes
        // Each additional hero reduces exp by 30%
        // 1 hero = 100%, 2 heroes = 70% each, 3 heroes = 49% each, etc.
        const expMultiplier = Math.pow(0.7, heroCount - 1);
        const expPerHero = baseExp * expMultiplier;
        
        // Check if killer is a hero (for last-hit bonus)
        const killerIsHero = killer && killer.type === 'hero';
        
        for (const participant of participants) {
            let finalExp = expPerHero;
            
            // Last-hit bonus (25%) only if a hero got the last hit
            if (killerIsHero && participant.isLastHit) {
                finalExp *= (1 + CONFIG.leveling.lastHitBonus);
            }
            
            participant.hero.gainExp(finalExp);
        }
    },
    
    /**
     * Get assists for a kill (for kill tracking, separate from exp)
     */
    getAssists(target, killer) {
        const participants = this.getParticipatingHeroes(target, killer);
        
        const assists = [];
        for (const participant of participants) {
            // Not the killer
            if (participant.hero !== killer) {
                assists.push(participant.hero);
                participant.hero.assists++;
            }
        }
        
        return assists;
    },
    
    /**
     * Heal target
     */
    heal(source, target, amount) {
        if (!target || !target.isAlive) return 0;
        
        const actualHeal = Math.min(amount, target.stats.maxHealth - target.health);
        target.health += actualHeal;
        
        // Show heal number
        EffectManager.createHealNumber(target.x, target.y, actualHeal);
        
        return actualHeal;
    },
    
    /**
     * Apply effect to target
     */
    applyEffect(target, effect, source) {
        if (!target || !target.isAlive) return;
        if (target.untargetable) return;
        if (typeof target.addDebuff !== 'function') return;
        
        switch (effect.type) {
            case 'slow':
                target.addDebuff({
                    type: 'slow',
                    percent: effect.percent,
                    duration: effect.duration,
                    source: source,
                });
                break;
                
            case 'stun':
                target.addDebuff({
                    type: 'stun',
                    duration: effect.duration,
                    source: source,
                });
                break;
                
            case 'knockup':
                target.addDebuff({
                    type: 'knockup',
                    duration: effect.duration,
                    source: source,
                });
                // Reset movement
                if (target.vx !== undefined) {
                    target.vx = 0;
                    target.vy = 0;
                }
                break;
                
            case 'taunt':
                target.addDebuff({
                    type: 'taunt',
                    duration: effect.duration,
                    source: effect.source,
                    tauntTarget: source,
                });
                break;
                
            case 'mark':
                target.addDebuff({
                    type: 'mark',
                    duration: effect.duration,
                    source: source,
                    bonusDamage: effect.bonusDamage || 0,
                });
                break;
                
            case 'silence':
                target.addDebuff({
                    type: 'silence',
                    duration: effect.duration,
                    source: source,
                });
                break;
                
            case 'dot': // Damage over time
                const dotEffect = {
                    type: 'dot',
                    damage: effect.damage,
                    damageType: effect.damageType || 'magical',
                    duration: effect.duration,
                    tickRate: effect.tickRate || 1000,
                    lastTick: 0,
                    source: source,
                };
                target.addDebuff(dotEffect);
                break;
        }
    },
    
    /**
     * Check if entity can attack target
     */
    canAttack(attacker, target) {
        if (!target || !target.isAlive) return false;
        if (target.untargetable) return false;
        if (attacker.team === target.team) return false;
        
        // CC check
        if (attacker.debuffs) {
            if (attacker.debuffs.some(d => d.type === 'stun' || d.type === 'disarm')) {
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Calculate effective damage after resistances
     */
    calculateDamage(baseDamage, damageType, target) {
        let damage = baseDamage;
        
        if (damageType === 'physical') {
            const armor = target.armor || target.stats?.armor || 0;
            const reduction = armor / (armor + 100);
            damage *= (1 - reduction);
        } else if (damageType === 'magical') {
            const mr = target.magicResist || target.stats?.magicResist || 0;
            const reduction = mr / (mr + 100);
            damage *= (1 - reduction);
        }
        // True damage bypasses all resistances
        
        return damage;
    },
    
    /**
     * Check line of sight
     */
    hasLineOfSight(x1, y1, x2, y2) {
        return Utils.hasLineOfSight(x1, y1, x2, y2, GameMap.walls);
    },
    
    /**
     * Get targets in area
     */
    getTargetsInArea(x, y, radius, teamFilter = null, typeFilter = null) {
        const targets = [];
        const entities = Game.getAllEntities();
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            if (entity.untargetable) continue;
            if (teamFilter !== null && entity.team !== teamFilter) continue;
            if (typeFilter !== null && entity.type !== typeFilter) continue;
            
            const dist = Utils.distance(x, y, entity.x, entity.y);
            if (dist <= radius + (entity.radius || 0)) {
                targets.push(entity);
            }
        }
        
        return targets;
    },
    
    /**
     * Get enemies in range
     */
    getEnemiesInRange(entity, range) {
        return this.getTargetsInArea(entity.x, entity.y, range)
            .filter(e => e.team !== entity.team);
    },
    
    /**
     * Get allies in range
     */
    getAlliesInRange(entity, range) {
        return this.getTargetsInArea(entity.x, entity.y, range)
            .filter(e => e.team === entity.team && e !== entity);
    },
    
    /**
     * Get closest enemy
     */
    getClosestEnemy(entity, maxRange = Infinity) {
        const enemies = this.getEnemiesInRange(entity, maxRange);
        
        if (enemies.length === 0) return null;
        
        let closest = null;
        let closestDist = Infinity;
        
        for (const enemy of enemies) {
            const dist = Utils.distance(entity.x, entity.y, enemy.x, enemy.y);
            if (dist < closestDist) {
                closestDist = dist;
                closest = enemy;
            }
        }
        
        return closest;
    },
    
    /**
     * Get priority target (for AI)
     */
    getPriorityTarget(entity, maxRange = Infinity) {
        const enemies = this.getEnemiesInRange(entity, maxRange);
        
        if (enemies.length === 0) return null;
        
        // Priority scoring
        let bestTarget = null;
        let bestScore = -Infinity;
        
        for (const enemy of enemies) {
            let score = 0;
            
            // Distance score (closer = better)
            const dist = Utils.distance(entity.x, entity.y, enemy.x, enemy.y);
            score -= dist / 100;
            
            // Low HP bonus
            if (enemy.health / enemy.maxHealth < 0.3) {
                score += 50;
            }
            
            // Type bonus
            if (enemy.type === 'hero') {
                score += 30;
                
                // Squishy targets
                if (enemy.role === 'marksman' || enemy.role === 'mage') {
                    score += 20;
                }
            } else if (enemy.type === 'tower') {
                score += 10;
            }
            
            // Can kill bonus
            const estimatedDamage = entity.stats?.attackDamage || entity.damage || 50;
            if (enemy.health < estimatedDamage * 2) {
                score += 40;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestTarget = enemy;
            }
        }
        
        return bestTarget;
    },
    
    /**
     * Update DoT effects
     */
    updateDoTs(entity, deltaTime) {
        if (!entity.debuffs) return;
        
        for (const debuff of entity.debuffs) {
            if (debuff.type === 'dot') {
                debuff.lastTick += deltaTime;
                
                if (debuff.lastTick >= debuff.tickRate) {
                    debuff.lastTick = 0;
                    this.dealDamage(debuff.source, entity, debuff.damage, debuff.damageType);
                }
            }
        }
    },
    
    /**
     * Clear combat data
     */
    clear() {
        this.damageLog.clear();
    },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Combat;
}
