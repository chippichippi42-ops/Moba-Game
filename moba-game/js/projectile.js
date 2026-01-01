/**
 * ========================================
 * MOBA Arena - Projectile System
 * ========================================
 * Quản lý đạn, skill shots, và effects
 */

const ProjectileManager = {
    projectiles: [],
    delayedEffects: [],
    zones: [],
    
    // Object pool for performance
    projectilePool: null,
    
    /**
     * Khởi tạo
     */
    init() {
        this.projectiles = [];
        this.delayedEffects = [];
        this.zones = [];
        
        this.projectilePool = Utils.createPool(() => ({
            id: null,
            type: '',
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            angle: 0,
            speed: 0,
            range: 0,
            width: 0,
            damage: 0,
            damageType: '',
            owner: null,
            team: 0,
            color: '#fff',
            traveled: 0,
            active: false,
            piercing: false,
            hitTargets: null,
            target: null,
        }), 50);
    },
    
	/**
	 * Tạo projectile mới
	 */
	create(data) {
		const proj = {
			id: Utils.generateId(),
			type: data.type || 'projectile',
			projectileType: data.projectileType || 'normal',
			x: data.x,
			y: data.y,
			startX: data.x,
			startY: data.y,
			angle: data.angle || 0,
			speed: data.speed || 1000,
			range: data.range || 1000,
			width: data.width || 30,
			damage: data.damage || 0,
			damageType: data.damageType || 'physical',
			owner: data.owner,
			team: data.owner ? data.owner.team : CONFIG.teams.NEUTRAL,
			color: data.color || '#ffffff',
			traveled: 0,
			active: true,
			piercing: data.piercing || false,
			pierceWalls: data.pierceWalls || false, // NEW: xuyên tường
			hitTargets: new Set(),
			target: data.target || null,
			effects: data.effects || [],
			explosionRadius: data.explosionRadius || 0,
			damageFalloff: data.damageFalloff || 0,
			minDamagePercent: data.minDamagePercent || 1,
			global: data.global || false,
			onHit: data.onHit || null,
			onHitHero: data.onHitHero || null,
		};
		
		// Calculate velocity
		if (data.target) {
			proj.homing = true;
		} else {
			proj.vx = Math.cos(proj.angle) * proj.speed;
			proj.vy = Math.sin(proj.angle) * proj.speed;
		}
		
		this.projectiles.push(proj);
		return proj;
	},
    
    /**
     * Tạo delayed area effect
     */
    createDelayedArea(data) {
        const effect = {
            id: Utils.generateId(),
            type: 'delayed_area',
            x: data.x,
            y: data.y,
            radius: data.radius || 200,
            delay: data.delay || 1000,
            remainingDelay: data.delay || 1000,
            damage: data.damage || 0,
            damageType: data.damageType || 'magical',
            owner: data.owner,
            team: data.owner ? data.owner.team : CONFIG.teams.NEUTRAL,
            color: data.color || '#ffffff',
            effects: data.effects || [],
            showWarning: data.showWarning !== false,
            animation: data.animation || null,
            onHit: data.onHit || null,
            active: true,
        };
        
        this.delayedEffects.push(effect);
        return effect;
    },
    
    /**
     * Tạo zone effect (kéo dài)
     */
    createZone(data) {
        const zone = {
            id: Utils.generateId(),
            type: 'zone',
            x: data.x,
            y: data.y,
            radius: data.radius || 300,
            duration: data.duration || 5000,
            remainingDuration: data.duration || 5000,
            tickRate: data.tickRate || 1000,
            lastTick: 0,
            damagePerTick: data.damagePerTick || 0,
            damageType: data.damageType || 'magical',
            owner: data.owner,
            team: data.owner ? data.owner.team : CONFIG.teams.NEUTRAL,
            color: data.color || '#ffffff',
            allyEffects: data.allyEffects || null,
            enemyEffects: data.enemyEffects || null,
            followOwner: data.followOwner || false,
            lifeSteal: data.lifeSteal || 0,
            active: true,
        };
        
        this.zones.push(zone);
        return zone;
    },
    
    /**
     * Update tất cả projectiles
     */
    update(deltaTime, entities) {
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            if (!proj.active) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            this.updateProjectile(proj, deltaTime, entities);
            
            if (!proj.active) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Update delayed effects
        for (let i = this.delayedEffects.length - 1; i >= 0; i--) {
            const effect = this.delayedEffects[i];
            if (!effect.active) {
                this.delayedEffects.splice(i, 1);
                continue;
            }
            
            this.updateDelayedEffect(effect, deltaTime, entities);
            
            if (!effect.active) {
                this.delayedEffects.splice(i, 1);
            }
        }
        
        // Update zones
        for (let i = this.zones.length - 1; i >= 0; i--) {
            const zone = this.zones[i];
            if (!zone.active) {
                this.zones.splice(i, 1);
                continue;
            }
            
            this.updateZone(zone, deltaTime, entities);
            
            if (!zone.active) {
                this.zones.splice(i, 1);
            }
        }
    },
    
	/**
	 * Update single projectile
	 */
	updateProjectile(proj, deltaTime, entities) {
		const dt = deltaTime / 1000;
		
		// Homing projectile
		if (proj.homing && proj.target && proj.target.isAlive) {
			const angle = Utils.angleBetween(proj, proj.target);
			proj.vx = Math.cos(angle) * proj.speed;
			proj.vy = Math.sin(angle) * proj.speed;
			proj.angle = angle;
		}
		
		// Move projectile
		const moveX = proj.vx * dt;
		const moveY = proj.vy * dt;
		
		proj.x += moveX;
		proj.y += moveY;
		proj.traveled += Math.sqrt(moveX * moveX + moveY * moveY);
		
		// Check range (unless global)
		if (!proj.global && proj.traveled >= proj.range) {
			if (proj.explosionRadius > 0) {
				this.triggerExplosion(proj, entities);
			}
			proj.active = false;
			return;
		}
		
		// Check wall collision - ONLY if pierceWalls is false
		if (!proj.pierceWalls && GameMap.checkWallCollision(proj.x, proj.y, proj.width / 2)) {
			if (proj.explosionRadius > 0) {
				this.triggerExplosion(proj, entities);
			}
			proj.active = false;
			return;
		}
        
		// Check entity collision
		for (const entity of entities) {
			if (!entity.isAlive) continue;
			if (entity === proj.owner) continue;
			if (entity.team === proj.team) continue;
			if (proj.hitTargets.has(entity.id)) continue;
			if (entity.untargetable) continue;
			
			const dist = Utils.distance(proj.x, proj.y, entity.x, entity.y);
			const hitRadius = (proj.width / 2) + (entity.radius || 30);
			
			if (dist <= hitRadius) {
				proj.hitTargets.add(entity.id);
				
				let damage = proj.damage;
				
				if (proj.damageFalloff > 0 && proj.hitTargets.size > 1) {
					const falloffMultiplier = Math.max(
						proj.minDamagePercent,
						1 - (proj.hitTargets.size - 1) * proj.damageFalloff
					);
					damage *= falloffMultiplier;
				}
				
				Combat.dealDamage(proj.owner, entity, damage, proj.damageType);
				
				if (proj.effects && proj.effects.length > 0) {
					for (const effect of proj.effects) {
						Combat.applyEffect(entity, effect, proj.owner);
					}
				}
				
				if (proj.onHit) {
					proj.onHit(entity);
				}
				if (proj.onHitHero && entity.type === 'hero') {
					proj.onHitHero(entity);
				}
				
				if (proj.explosionRadius > 0) {
					this.triggerExplosion(proj, entities);
					proj.active = false;
					return;
				}
				
				if (!proj.piercing) {
					proj.active = false;
					return;
				}
			}
		}
		
		// Check if out of map bounds
		if (proj.x < -500 || proj.x > CONFIG.map.width + 500 ||
			proj.y < -500 || proj.y > CONFIG.map.height + 500) {
			proj.active = false;
		}
	},
    
    /**
     * Trigger explosion
     */
    triggerExplosion(proj, entities) {
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            if (entity === proj.owner) continue;
            if (entity.team === proj.team) continue;
            if (entity.untargetable) continue;
            
            const dist = Utils.distance(proj.x, proj.y, entity.x, entity.y);
            if (dist <= proj.explosionRadius) {
                Combat.dealDamage(proj.owner, entity, proj.damage, proj.damageType);
                
                if (proj.effects) {
                    for (const effect of proj.effects) {
                        Combat.applyEffect(entity, effect, proj.owner);
                    }
                }
                
                if (proj.onHit) {
                    proj.onHit(entity);
                }
            }
        }
        
        // Visual effect
        EffectManager.createExplosion(proj.x, proj.y, proj.explosionRadius, proj.color);
    },
    
    /**
     * Update delayed effect
     */
    updateDelayedEffect(effect, deltaTime, entities) {
        effect.remainingDelay -= deltaTime;
        
        if (effect.remainingDelay <= 0) {
            // Trigger effect
            for (const entity of entities) {
                if (!entity.isAlive) continue;
                if (entity === effect.owner) continue;
                if (entity.team === effect.team) continue;
                if (entity.untargetable) continue;
                
                const dist = Utils.distance(effect.x, effect.y, entity.x, entity.y);
                if (dist <= effect.radius) {
                    Combat.dealDamage(effect.owner, entity, effect.damage, effect.damageType);
                    
                    if (effect.effects) {
                        for (const eff of effect.effects) {
                            Combat.applyEffect(entity, eff, effect.owner);
                        }
                    }
                    
                    if (effect.onHit) {
                        effect.onHit(entity);
                    }
                }
            }
            
            effect.active = false;
        }
    },
    
    /**
     * Update zone
     */
    updateZone(zone, deltaTime, entities) {
        // Follow owner
        if (zone.followOwner && zone.owner) {
            zone.x = zone.owner.x;
            zone.y = zone.owner.y;
        }
        
        zone.remainingDuration -= deltaTime;
        zone.lastTick += deltaTime;
        
        // Tick effects
        if (zone.lastTick >= zone.tickRate) {
            zone.lastTick = 0;
            
            for (const entity of entities) {
                if (!entity.isAlive) continue;
                if (entity.untargetable) continue;
                
                const dist = Utils.distance(zone.x, zone.y, entity.x, entity.y);
                if (dist > zone.radius) continue;
                
                const isAlly = entity.team === zone.team;
                
                if (isAlly && zone.allyEffects) {
                    // Apply ally effects
                    if (zone.allyEffects.healPerTick) {
                        Combat.heal(zone.owner, entity, zone.allyEffects.healPerTick);
                    }
                    if (zone.allyEffects.damageReduction) {
                        entity.addBuff({
                            type: 'damageReduction',
                            value: zone.allyEffects.damageReduction,
                            duration: zone.tickRate + 100,
                            source: zone.owner,
                        });
                    }
                } else if (!isAlly && entity !== zone.owner) {
                    // Damage enemies
                    if (zone.damagePerTick > 0) {
                        const dealt = Combat.dealDamage(zone.owner, entity, zone.damagePerTick, zone.damageType);
                        
                        // Life steal
                        if (zone.lifeSteal > 0 && zone.owner) {
                            Combat.heal(null, zone.owner, dealt * zone.lifeSteal);
                        }
                    }
                    
                    if (zone.enemyEffects) {
                        for (const eff of zone.enemyEffects) {
                            Combat.applyEffect(entity, eff, zone.owner);
                        }
                    }
                }
            }
        }
        
        // Check duration
        if (zone.remainingDuration <= 0) {
            zone.active = false;
        }
    },
    
    /**
     * Render projectiles
     */
    render(ctx) {
        // Render zones first (below everything)
        for (const zone of this.zones) {
            this.renderZone(ctx, zone);
        }
        
        // Render delayed effect warnings
        for (const effect of this.delayedEffects) {
            this.renderDelayedEffect(ctx, effect);
        }
        
        // Render projectiles
        for (const proj of this.projectiles) {
            this.renderProjectile(ctx, proj);
        }
    },
    
    /**
     * Render single projectile
     */
	renderProjectile(ctx, proj) {
		ctx.save();
		ctx.translate(proj.x, proj.y);
		ctx.rotate(proj.angle);
		
		// Trail effect
		const trailLength = 40;
		const trailGradient = ctx.createLinearGradient(-trailLength, 0, 0, 0);
		trailGradient.addColorStop(0, 'rgba(255,255,255,0)');
		trailGradient.addColorStop(1, proj.color);
		
		ctx.fillStyle = trailGradient;
		ctx.beginPath();
		ctx.moveTo(-trailLength, 0);
		ctx.lineTo(-trailLength, -proj.width / 4);
		ctx.lineTo(0, 0);
		ctx.lineTo(-trailLength, proj.width / 4);
		ctx.closePath();
		ctx.fill();
		
		// Main projectile body with glow
		ctx.shadowColor = proj.color;
		ctx.shadowBlur = 15;
		
		// Outer glow
		ctx.fillStyle = proj.color;
		ctx.globalAlpha = 0.5;
		ctx.beginPath();
		ctx.ellipse(0, 0, proj.width / 2 + 5, proj.width / 4 + 3, 0, 0, Math.PI * 2);
		ctx.fill();
		
		// Inner bright core
		ctx.globalAlpha = 1;
		const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, proj.width / 2);
		coreGradient.addColorStop(0, '#ffffff');
		coreGradient.addColorStop(0.3, proj.color);
		coreGradient.addColorStop(1, proj.color);
		
		ctx.fillStyle = coreGradient;
		ctx.beginPath();
		ctx.ellipse(0, 0, proj.width / 2, proj.width / 4, 0, 0, Math.PI * 2);
		ctx.fill();
		
		// Sparkle effect
		ctx.fillStyle = '#ffffff';
		ctx.globalAlpha = 0.8 + Math.sin(Date.now() / 50) * 0.2;
		ctx.beginPath();
		ctx.arc(proj.width / 4, 0, 3, 0, Math.PI * 2);
		ctx.fill();
		
		ctx.shadowBlur = 0;
		ctx.globalAlpha = 1;
		ctx.restore();
	},
    
    /**
     * Render delayed effect
     */
    renderDelayedEffect(ctx, effect) {
        const progress = 1 - (effect.remainingDelay / effect.delay);
        
        // Warning circle
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.3 + progress * 0.4;
        
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Fill with progress
        ctx.fillStyle = effect.color;
        ctx.globalAlpha = 0.1 + progress * 0.2;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * progress, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner warning
        if (effect.showWarning) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius * 0.3, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    },
    
    /**
     * Render zone
     */
    renderZone(ctx, zone) {
        const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
        
        // Zone fill
        ctx.fillStyle = zone.color;
        ctx.globalAlpha = 0.15 * pulse;
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Zone border
        ctx.strokeStyle = zone.color;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.globalAlpha = 1;
    },
    
    /**
     * Clear all
     */
    clear() {
        this.projectiles = [];
        this.delayedEffects = [];
        this.zones = [];
    },
    
    /**
     * Get projectiles count
     */
    getCount() {
        return {
            projectiles: this.projectiles.length,
            delayedEffects: this.delayedEffects.length,
            zones: this.zones.length,
        };
    },
};

/**
 * Effect Manager - Visual effects
 */
const EffectManager = {
    effects: [],
    
    init() {
        this.effects = [];
    },
    
    createExplosion(x, y, radius, color) {
        this.effects.push({
            type: 'explosion',
            x: x,
            y: y,
            radius: 0,
            maxRadius: radius,
            color: color,
            duration: 300,
            elapsed: 0,
        });
    },
    
    createDamageNumber(x, y, damage, type) {
        this.effects.push({
            type: 'damage_number',
            x: x + (Math.random() - 0.5) * 30,
            y: y,
            vy: -2,
            text: Math.round(damage).toString(),
            color: type === 'physical' ? '#ef4444' : 
                   type === 'magical' ? '#8b5cf6' : 
                   type === 'true' ? '#ffffff' : '#22c55e',
            duration: 1000,
            elapsed: 0,
        });
    },
    
    createHealNumber(x, y, amount) {
        this.effects.push({
            type: 'damage_number',
            x: x + (Math.random() - 0.5) * 30,
            y: y,
            vy: -2,
            text: '+' + Math.round(amount).toString(),
            color: '#22c55e',
            duration: 1000,
            elapsed: 0,
        });
    },
    
    update(deltaTime) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.elapsed += deltaTime;
            
            if (effect.elapsed >= effect.duration) {
                this.effects.splice(i, 1);
                continue;
            }
            
            if (effect.type === 'explosion') {
                effect.radius = effect.maxRadius * (effect.elapsed / effect.duration);
            } else if (effect.type === 'damage_number') {
                effect.y += effect.vy;
            }
        }
    },
    
    render(ctx) {
        for (const effect of this.effects) {
            const progress = effect.elapsed / effect.duration;
            
            if (effect.type === 'explosion') {
                ctx.strokeStyle = effect.color;
                ctx.lineWidth = 3;
                ctx.globalAlpha = 1 - progress;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                ctx.stroke();
            } else if (effect.type === 'damage_number') {
                ctx.font = 'bold 18px Arial';
                ctx.fillStyle = effect.color;
                ctx.globalAlpha = 1 - progress;
                ctx.textAlign = 'center';
                ctx.fillText(effect.text, effect.x, effect.y);
            }
        }
        ctx.globalAlpha = 1;
    },
    
    clear() {
        this.effects = [];
    },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProjectileManager, EffectManager };
}