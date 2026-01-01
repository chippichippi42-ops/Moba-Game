/**
 * ========================================
 * MOBA Arena - Game Configuration (Enhanced)
 * ========================================
 */

const CONFIG = {
    // === GAME SETTINGS ===
    game: {
        targetFPS: 60,
        fixedDeltaTime: 1000 / 60,
        minionSpawnInterval: 25000,
        respawnBaseTime: 5000,
        respawnTimePerMinute: 3000,
        defaultPlayerName: 'HDPE',
    },

    // === MAP SETTINGS ===
    map: {
        width: 8000,
        height: 8000,
        tileSize: 100,
        baseExtension: 500,
        riverWidth: 300,
        laneWidth: 350,
        wallThickness: 80,
        brushRadius: 120,
    },

    // === CAMERA SETTINGS ===
    camera: {
        defaultZoom: 0.5,
        minZoom: 0.3,
        maxZoom: 1.0,
        smoothing: 0.1,
        edgeScrollSpeed: 15,
        edgeScrollMargin: 50,
    },

    // === HERO BASE STATS ===
    hero: {
        baseSpeed: 350,
        maxSpeed: 800,
        baseAttackRange: 150,
        rangedAttackRange: 550,
        visionRange: 1000,
        baseRegen: 5,
        baseManaRegen: 3,
    },

    // === STAT CAPS ===
    caps: {
        maxSpeed: 800,
        maxAttackSpeed: 200,
        maxCDR: 40,
        maxCritChance: 100,
    },

    // === LEVEL SYSTEM ===
    leveling: {
        maxLevel: 15,
        expPerLevel: [0, 100, 220, 360, 520, 700, 900, 1120, 1360, 1620, 1900, 2200, 2520, 2860, 3220],
        lastHitBonus: 0.25,
        expShareRange: 1200,
        jungleExpBonus: 0.15,
    },

    // === TOWER SETTINGS - Full customizable ===
    tower: {
        // Main tower (Nexus)
        main: {
            health: 12000,
            damage: 1500,
            armor: 50,
            magicResist: 50,
            attackRange: 550,
            attackSpeed: 1.0,
            expReward: 500,
        },
        // Outer towers (T1)
        outer: {
            health: 5000,
            damage: 400,
            armor: 30,
            magicResist: 30,
            attackRange: 500,
            attackSpeed: 1.0,
            expReward: 150,
        },
        // Inner towers (T2)
        inner: {
            health: 6500,
            damage: 550,
            armor: 40,
            magicResist: 40,
            attackRange: 500,
            attackSpeed: 1.0,
            expReward: 200,
        },
        // Inhibitor towers (T3)
        inhibitor: {
            health: 8000,
            damage: 700,
            armor: 50,
            magicResist: 50,
            attackRange: 500,
            attackSpeed: 1.0,
            expReward: 250,
        },
        // Base fountain
        base: {
            damage: 8000,
            attackRange: 250,
            attackSpeed: 2.0,
        },
        // Damage stacking
        damageStackPercent: 0.5,
        maxDamageStacks: 4,
        // Legacy (for backward compatibility)
        mainHealth: 12000,
        outerHealth: 5000,
        innerHealth: 6500,
        inhibitorHealth: 8000,
        mainDamage: 1500,
        outerDamage: 400,
        innerDamage: 550,
        inhibitorDamage: 700,
        baseDamage: 8000,
        attackRange: 800,
        attackSpeed: 1,
    },

    // === MINION SETTINGS - Full customizable ===
    minion: {
        // Melee minion
        melee: {
            health: 450,
            damage: 22,
            armor: 18,
            magicResist: 0,
            attackRange: 100,
            attackSpeed: 1.0,
            speed: 300,
            exp: 28,
            visionRange: 700,
            radius: 22,
        },
        // Ranged minion (caster)
        ranged: {
            health: 280,
            damage: 35,
            armor: 0,
            magicResist: 0,
            attackRange: 450,
            attackSpeed: 0.8,
            speed: 300,
            exp: 28,
            visionRange: 700,
            radius: 18,
        },
        // Siege minion (cannon)
        siege: {
            health: 800,
            damage: 55,
            armor: 30,
            magicResist: 30,
            attackRange: 500,
            attackSpeed: 0.6,
            speed: 280,
            exp: 60,
            visionRange: 800,
            radius: 30,
        },
        // Super minion
        superMinion: {
            health: 1500,
            damage: 80,
            armor: 50,
            magicResist: 50,
            attackRange: 150,
            attackSpeed: 1.2,
            speed: 320,
            exp: 100,
            visionRange: 800,
            radius: 35,
        },
        // Spawn settings
        spawn: {
            meleeCount: 3,
            rangedCount: 2,
            siegeEveryNWaves: 3,
            spacing: 80, // Khoảng cách giữa các lính
        },
        // Legacy (backward compatibility)
        meleeHealth: 450,
        rangedHealth: 280,
        meleeDamage: 22,
        rangedDamage: 35,
        meleeArmor: 18,
        rangedArmor: 0,
        attackRange: { melee: 100, ranged: 450 },
        speed: 300,
        exp: 28,
        visionRange: 700,
    },



	// === WALL POSITIONS - Fully configurable ===
	wallPositions: [
		// Blue jungle walls
		{ x: 1400, y: 5600, width: 200, height: 120 },
		{ x: 1800, y: 5200, width: 150, height: 200 },
		{ x: 2200, y: 4800, width: 180, height: 150 },
		{ x: 1200, y: 4400, width: 250, height: 100 },
		{ x: 2600, y: 6200, width: 120, height: 180 },
		{ x: 2000, y: 6600, width: 200, height: 140 },
		
		// Red jungle walls
		{ x: 6400, y: 2200, width: 200, height: 120 },
		{ x: 6000, y: 2600, width: 150, height: 200 },
		{ x: 5600, y: 3000, width: 180, height: 150 },
		{ x: 6600, y: 3400, width: 250, height: 100 },
		{ x: 5200, y: 1600, width: 120, height: 180 },
		{ x: 5800, y: 1200, width: 200, height: 140 },
		
		// River walls
		{ x: 3400, y: 4200, width: 160, height: 160 },
		{ x: 4400, y: 3600, width: 160, height: 160 },
		
		// Mid jungle
		{ x: 2800, y: 3800, width: 140, height: 200 },
		{ x: 5000, y: 4000, width: 140, height: 200 },
		{ x: 3200, y: 3200, width: 200, height: 140 },
		{ x: 4600, y: 4600, width: 200, height: 140 },
		
		// Corner walls
		{ x: 1000, y: 6800, width: 300, height: 150 },
		{ x: 6800, y: 1000, width: 300, height: 150 },
	],

	// === BRUSH POSITIONS - Rectangular only ===
	brushPositions: [
		// Blue side brushes
		{ x: 1200, y: 5800, width: 200, height: 120 },
		{ x: 1600, y: 5400, width: 150, height: 180 },
		{ x: 2400, y: 6400, width: 180, height: 140 },
		{ x: 1800, y: 4600, width: 220, height: 100 },
		{ x: 2800, y: 5600, width: 160, height: 160 },
		
		// Red side brushes
		{ x: 6600, y: 2000, width: 200, height: 120 },
		{ x: 6200, y: 2400, width: 150, height: 180 },
		{ x: 5400, y: 1400, width: 180, height: 140 },
		{ x: 6000, y: 3200, width: 220, height: 100 },
		{ x: 5000, y: 2200, width: 160, height: 160 },
		
		// Lane brushes - Top
		{ x: 600, y: 3000, width: 120, height: 200 },
		{ x: 600, y: 4500, width: 120, height: 200 },
		{ x: 2000, y: 600, width: 200, height: 120 },
		{ x: 3500, y: 600, width: 200, height: 120 },
		
		// Lane brushes - Bot
		{ x: 7200, y: 4800, width: 120, height: 200 },
		{ x: 7200, y: 3300, width: 120, height: 200 },
		{ x: 5800, y: 7200, width: 200, height: 120 },
		{ x: 4300, y: 7200, width: 200, height: 120 },
		
		// River brushes
		{ x: 3200, y: 4400, width: 140, height: 180 },
		{ x: 4600, y: 3400, width: 140, height: 180 },
		
		// Mid lane brushes
		{ x: 3000, y: 4800, width: 160, height: 120 },
		{ x: 4800, y: 3000, width: 160, height: 120 },
	],

	// === CREATURE CAMP POSITIONS ===
	creatureCamps: [
		// Blue side camps
		{ x: 1800, y: 5400, type: 'crystal_golem', team: 'blue', name: 'Crystal Guardian' },
		{ x: 2400, y: 4800, type: 'shadow_wisps', team: 'blue', name: 'Shadow Wisps' },
		{ x: 1400, y: 4200, type: 'stone_beetle', team: 'blue', name: 'Stone Beetles' },
		{ x: 2800, y: 6000, type: 'ember_spirit', team: 'blue', name: 'Ember Spirit' },
		{ x: 1600, y: 6400, type: 'vine_crawler', team: 'blue', name: 'Vine Crawlers' },
		{ x: 2200, y: 5800, type: 'frost_elemental', team: 'blue', name: 'Frost Elemental' },
		
		// Red side camps
		{ x: 6000, y: 2400, type: 'crystal_golem', team: 'red', name: 'Crystal Guardian' },
		{ x: 5400, y: 3000, type: 'shadow_wisps', team: 'red', name: 'Shadow Wisps' },
		{ x: 6400, y: 3600, type: 'stone_beetle', team: 'red', name: 'Stone Beetles' },
		{ x: 5000, y: 1800, type: 'ember_spirit', team: 'red', name: 'Ember Spirit' },
		{ x: 6200, y: 1400, type: 'vine_crawler', team: 'red', name: 'Vine Crawlers' },
		{ x: 5600, y: 2000, type: 'frost_elemental', team: 'red', name: 'Frost Elemental' },
		
		// Neutral objectives
		{ x: 4400, y: 4800, type: 'ancient_titan', team: 'neutral', name: 'Ancient Titan' },
		{ x: 3400, y: 3000, type: 'void_herald', team: 'neutral', name: 'Void Herald' },
		
		// River camps
		{ x: 3800, y: 3800, type: 'river_spirit', team: 'neutral', name: 'River Spirit' },
		{ x: 4000, y: 4000, type: 'river_spirit', team: 'neutral', name: 'River Spirit' },
	],

	// === CREATURE TYPES - Original designs ===
	creatureTypes: {
		// Crystal Golem - Large tank creature with shield ability
		crystal_golem: {
			health: 1800,
			damage: 65,
			armor: 30,
			attackRange: 180,
			attackSpeed: 0.5,
			speed: 140,
			exp: 120,
			respawnTime: 90000,
			radius: 40,
			color: '#00ffff',
			icon: '💎',
			abilities: {
				crystalShield: {
					trigger: 'health_below_50',
					effect: 'damage_reduction',
					value: 0.3,
					duration: 3000,
				},
			},
			minions: [
				{ type: 'crystal_shard', count: 2 },
			],
		},
		
		// Shadow Wisps - Fast attackers that multiply
		shadow_wisps: {
			health: 400,
			damage: 35,
			armor: 5,
			attackRange: 200,
			attackSpeed: 1.2,
			speed: 280,
			exp: 45,
			respawnTime: 60000,
			radius: 18,
			color: '#4a0080',
			icon: '👻',
			count: 4,
			abilities: {
				phaseShift: {
					trigger: 'on_hit',
					chance: 0.15,
					effect: 'dodge',
				},
			},
		},
		
		// Stone Beetles - Armored creatures that burrow
		stone_beetle: {
			health: 600,
			damage: 45,
			armor: 40,
			attackRange: 120,
			attackSpeed: 0.7,
			speed: 180,
			exp: 55,
			respawnTime: 70000,
			radius: 25,
			color: '#8b4513',
			icon: '🪲',
			count: 3,
			abilities: {
				burrow: {
					trigger: 'combat_start',
					effect: 'armor_boost',
					value: 20,
					duration: 2000,
				},
			},
		},
		
		// Ember Spirit - Fire elemental with burn damage
		ember_spirit: {
			health: 1400,
			damage: 55,
			armor: 15,
			attackRange: 250,
			attackSpeed: 0.8,
			speed: 200,
			exp: 100,
			respawnTime: 85000,
			radius: 35,
			color: '#ff4500',
			icon: '🔥',
			abilities: {
				burnAura: {
					trigger: 'passive',
					effect: 'dot',
					damage: 15,
					tickRate: 1000,
					range: 200,
				},
			},
			buff: {
				name: 'Ember Blessing',
				effect: 'burn_on_hit',
				burnDamage: 25,
				duration: 90000,
			},
		},
		
		// Vine Crawlers - Root and trap enemies
		vine_crawler: {
			health: 500,
			damage: 30,
			armor: 10,
			attackRange: 180,
			attackSpeed: 0.9,
			speed: 220,
			exp: 50,
			respawnTime: 65000,
			radius: 22,
			color: '#228b22',
			icon: '🌿',
			count: 3,
			abilities: {
				entangle: {
					trigger: 'on_hit',
					chance: 0.2,
					effect: 'slow',
					value: 0.4,
					duration: 1500,
				},
			},
		},
		
		// Frost Elemental - Slows and chills
		frost_elemental: {
			health: 1600,
			damage: 50,
			armor: 20,
			attackRange: 220,
			attackSpeed: 0.6,
			speed: 160,
			exp: 110,
			respawnTime: 95000,
			radius: 38,
			color: '#87ceeb',
			icon: '❄️',
			abilities: {
				frostAura: {
					trigger: 'passive',
					effect: 'slow_aura',
					value: 0.2,
					range: 250,
				},
			},
			buff: {
				name: 'Frost Touch',
				effect: 'slow_on_hit',
				slowPercent: 15,
				duration: 90000,
			},
		},
		
		// Ancient Titan - Major objective (Dragon equivalent)
		ancient_titan: {
			health: 4500,
			damage: 140,
			armor: 50,
			attackRange: 280,
			attackSpeed: 0.4,
			speed: 0,
			exp: 300,
			respawnTime: 240000,
			radius: 60,
			color: '#ffd700',
			icon: '🗿',
			abilities: {
				titanSlam: {
					trigger: 'every_5_attacks',
					effect: 'aoe_damage',
					damage: 100,
					radius: 300,
					knockback: 150,
				},
				regeneration: {
					trigger: 'out_of_combat',
					effect: 'heal',
					value: 0.02,
					tickRate: 1000,
				},
			},
			buff: {
				name: 'Titan\'s Might',
				adBonus: 20,
				apBonus: 30,
				healthBonus: 200,
				duration: 180000,
			},
		},
		
		// Void Herald - Major objective (Baron equivalent)
		void_herald: {
			health: 7000,
			damage: 200,
			armor: 70,
			attackRange: 320,
			attackSpeed: 0.35,
			speed: 0,
			exp: 500,
			respawnTime: 360000,
			radius: 70,
			color: '#8b008b',
			icon: '🌀',
			abilities: {
				voidPulse: {
					trigger: 'every_3_attacks',
					effect: 'mana_burn',
					value: 50,
					damage: 80,
				},
				dimensionalRift: {
					trigger: 'health_below_30',
					effect: 'summon_voidlings',
					count: 3,
				},
			},
			buff: {
				name: 'Void Empowerment',
				adBonus: 50,
				apBonus: 70,
				regenBonus: 0.05,
				minionBuff: true,
				duration: 180000,
			},
		},
		
		// River Spirit - Peaceful creature that gives vision
		river_spirit: {
			health: 600,
			damage: 0,
			armor: 0,
			attackRange: 0,
			attackSpeed: 0,
			speed: 300,
			exp: 80,
			respawnTime: 90000,
			radius: 20,
			color: '#00bfff',
			icon: '💧',
			passive: true,
			flees: true,
			onKill: {
				effect: 'grant_vision',
				radius: 800,
				duration: 60000,
				speedBoost: 0.15,
				speedDuration: 5000,
			},
		},
		
		// Minion types for camps
		crystal_shard: {
			health: 300,
			damage: 20,
			armor: 15,
			attackRange: 150,
			attackSpeed: 0.8,
			speed: 200,
			exp: 25,
			radius: 15,
			color: '#00ffff',
			icon: '💠',
		},
	},

    // === SPELL SETTINGS ===
    spells: {
        heal: {
            name: 'Hồi Máu',
            healPercent: 0.15,
            cooldown: 50000,
            icon: '❤️',
        },
        flash: {
            name: 'Tốc Biến',
            distance: 450,
            cooldown: 65000,
            icon: '⚡',
        },
        haste: {
            name: 'Tốc Hành',
            speedBoost: 800,
            duration: 12000,
            cooldown: 45000,
            icon: '💨',
        },
    },

    // === AI DIFFICULTY SETTINGS ===
    aiDifficulty: {
        easy: {
            reactionTime: 600,
            accuracy: 0.45,
            skillUsage: 0.25,
            decisionInterval: 2500,
            dodgeChance: 0.08,
            comboExecution: 0.15,
            jungleRate: 0.2,
        },
        normal: {
            reactionTime: 350,
            accuracy: 0.65,
            skillUsage: 0.45,
            decisionInterval: 1800,
            dodgeChance: 0.25,
            comboExecution: 0.35,
            jungleRate: 0.4,
        },
        hard: {
            reactionTime: 180,
            accuracy: 0.82,
            skillUsage: 0.7,
            decisionInterval: 1200,
            dodgeChance: 0.45,
            comboExecution: 0.65,
            jungleRate: 0.6,
        },
        veryhard: {
            reactionTime: 100,
            accuracy: 0.92,
            skillUsage: 0.88,
            decisionInterval: 600,
            dodgeChance: 0.7,
            comboExecution: 0.85,
            jungleRate: 0.8,
        },
        nightmare: {
            reactionTime: 40,
            accuracy: 0.98,
            skillUsage: 0.98,
            decisionInterval: 150,
            dodgeChance: 0.92,
            comboExecution: 0.98,
            jungleRate: 0.95,
            perfectLastHit: true,
            perfectDodge: true,
            globalAwareness: true,
            optimalDecisions: true,
        },
    },

    // === COMBAT SETTINGS ===
    combat: {
        critDamageMultiplier: 1.5,
        armorPenetrationCap: 0.6,
        magicPenCap: 0.6,
    },

    // === GRAPHICS SETTINGS ===
    graphics: {
        low: { particles: false, shadows: false, smoothing: false, maxParticles: 50 },
        medium: { particles: true, shadows: false, smoothing: true, maxParticles: 150 },
        high: { particles: true, shadows: true, smoothing: true, maxParticles: 300 },
    },

    // === AUDIO SETTINGS ===
    audio: {
        masterVolume: 0.8,
        musicVolume: 0.5,
        sfxVolume: 0.7,
    },

    // === TEAM IDs ===
    teams: {
        BLUE: 0,
        RED: 1,
        NEUTRAL: 2,
    },

    // === COLORS ===
    colors: {
        blueTeam: '#00d4ff',
        redTeam: '#ef4444',
        neutral: '#fbbf24',
        grass: '#2d5a27',
        river: '#3498db',
        wall: '#4a4a4a',
        brush: '#1e5a1e',
        path: '#8B7355',
        fog: 'rgba(0, 0, 0, 0.7)',
    },

	// === UI SETTINGS - Add coordinates display ===
	ui: {
		healthBarWidth: 70,
		healthBarHeight: 10,
		healthBarOffset: 45,
		minimapSize: 220,
		killFeedDuration: 5000,
		showCoordinates: false, // New setting
	},
    
    // === AI NAMES ===
    aiNames: [
        'Shadow', 'Thunder', 'Phoenix', 'Dragon', 'Tiger', 
        'Falcon', 'Storm', 'Blaze', 'Frost', 'Venom',
        'Ghost', 'Raven', 'Wolf', 'Hawk', 'Cobra',
        'Nova', 'Blade', 'Reaper', 'Hunter', 'Striker',
        'Mystic', 'Savage', 'Phantom', 'Valor', 'Fury',
        'Echo', 'Viper', 'Onyx', 'Titan', 'Apex',
        'Zephyr', 'Demon', 'Angel', 'Spirit', 'Legend',
    ],
	
		// === TOWER PROJECTILE SETTINGS ===
	towerProjectile: {
		pierceWalls: true, // Đạn trụ xuyên tường
	},

	// === SCREEN BACKGROUNDS ===
	screenBackgrounds: {
		start: {
			type: 'gradient', // 'gradient', 'image', 'solid'
			gradient: {
				colors: ['#0d1b2a', '#1b263b', '#0d1b2a'],
				angle: 135,
			},
			// image: 'assets/bg_start.jpg', // nếu type = 'image'
			// solid: '#0d1b2a', // nếu type = 'solid'
		},
		pregame: {
			type: 'gradient',
			gradient: {
				colors: ['#0d1b2a', '#1b263b', '#0d1b2a'],
				angle: 135,
			},
		},
		settings: {
			type: 'gradient',
			gradient: {
				colors: ['#0d1b2a', '#1b263b', '#0d1b2a'],
				angle: 135,
			},
		},
		pause: {
			type: 'gradient',
			gradient: {
				colors: ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)'],
				angle: 180,
			},
		},
		gameover: {
			type: 'gradient',
			gradient: {
				colors: ['#0d1b2a', '#1b263b', '#0d1b2a'],
				angle: 135,
			},
		},
	},
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
