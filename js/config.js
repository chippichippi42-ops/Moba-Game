/**
 * ========================================
 * MOBA Arena - Game Configuration (Enhanced)
 * ========================================
 */

const AI_CONFIG = {
    external_ai: {
        enabled: true,
        provider: 'ollama',
        
        ollama: {
            host: 'localhost',
            port: 11434,
            model: 'mistral',
            timeout_ms: 300,
            retry_attempts: 2
        },
        
        evaluator: {
            extreme_urgent_threshold: 85,
            urgent_threshold: 70,
            planning_threshold: 40,
            cache_enabled: true,
            cache_duration_ms: 5000,
            cache_max_size: 50
        },
        
        request_pool: {
            max_concurrent: 3,
            batch_size: 3,
            priority_queue: true
        },
        
        debug: false,
        log_decisions: false
    }
};

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
        // Tower range indicator distance
        rangeIndicatorDistance: 150,

        // === TOWER DISTANCES BY LANE ===
        // Independent spacing for each lane to allow balance tweaking
        towerLaneDistances: {
            top: 1800,
            mid: 900,
            bot: 1800,
        },
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
            spawnDelay: 120000,
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
            spawnDelay: 60000,
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
            spawnDelay: 60000,
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
            spawnDelay: 60000,
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
            spawnDelay: 60000,
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
            spawnDelay: 60000,
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
            spawnDelay: 120000,
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
            spawnDelay: 120000,
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
            spawnDelay: 30000,
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
            spawnDelay: 30000,
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

    // === AI COMPREHENSIVE CONFIGURATION ===
    aiDifficulty: {
        easy: {
            // === DECISION MAKING ===
            decisionInterval: 2500,        // Thời gian giữa các quyết định (ms)
            reactionTime: 600,             // Phản ứng chậm
            
            // === ACCURACY & SKILL USAGE ===
            accuracy: 0.45,                // Hit rate 45%
            skillUsage: 0.25,              // Sử dụng kỹ năng 25%
            comboHitRate: 0.20,            // Skillshot hit 20%
            comboExecution: 0.15,          // Combo success 15%
            
            // === DODGE & AVOIDANCE ===
            dodgeChance: 0.08,             // Dodge general 8%
            dodgeProjectile: 0.10,         // Dodge projectile 10%
            dodgeObstacle: 0.15,           // Dodge obstacle 15%
            dodgeAbilityCC: 0.05,          // Dodge CC ability 5%
            
            // === TARGETING ===
            targetSelectionLogic: 'random',
            targetingAccuracy: 0.20,       // 20% accurate targeting
            
            // === MOVEMENT ===
            movementSpeed: 0.80,           // -20% speed
            pathfindingQuality: 'poor',    // Poor pathfinding
            movementSmoothing: 0.3,        // Low smoothing
            unstuckThreshold: 2000,        // Get unstuck after 2s
            
            // === FARMING & ROAMING ===
            farmEfficiency: 0.50,          // 50% CS
            lastHitAccuracy: 0.40,         // 40% last hit accuracy
            jungleRate: 0.2,               // Jungle 20%
            roamingFrequency: 0.1,         // Roam rarely
            
            // === AWARENESS ===
            visionAwareness: 0.10,         // 10% map knowledge
            threatAssessment: 0.15,        // Poor threat eval
            
            // === FEATURES ===
            hasLLM: false,
            predictEnemies: false,
            hasComboSystem: true,          // But execute poorly
            hasSmartPathing: true,         // But quality is poor
        },
        
        normal: {
            decisionInterval: 2000,
            reactionTime: 400,
            
            accuracy: 0.57,
            skillUsage: 0.38,
            comboHitRate: 0.60,
            comboExecution: 0.35,
            
            dodgeChance: 0.18,
            dodgeProjectile: 0.25,
            dodgeObstacle: 0.35,
            dodgeAbilityCC: 0.15,
            
            targetSelectionLogic: 'basic_threat',
            targetingAccuracy: 0.50,
            
            movementSpeed: 0.90,
            pathfindingQuality: 'basic',
            movementSmoothing: 0.6,
            unstuckThreshold: 1500,
            
            farmEfficiency: 0.70,
            lastHitAccuracy: 0.65,
            jungleRate: 0.4,
            roamingFrequency: 0.25,
            
            visionAwareness: 0.30,
            threatAssessment: 0.40,
            
            hasLLM: false,
            predictEnemies: false,
            hasComboSystem: true,
            hasSmartPathing: true,
        },
        
        hard: {
            decisionInterval: 1400,
            reactionTime: 240,
            
            accuracy: 0.72,
            skillUsage: 0.58,
            comboHitRate: 0.75,
            comboExecution: 0.62,
            
            dodgeChance: 0.38,
            dodgeProjectile: 0.50,
            dodgeObstacle: 0.60,
            dodgeAbilityCC: 0.45,
            
            targetSelectionLogic: 'threat_analysis',
            targetingAccuracy: 0.75,
            
            movementSpeed: 1.0,
            pathfindingQuality: 'good',
            movementSmoothing: 0.85,
            unstuckThreshold: 1000,
            
            farmEfficiency: 0.90,
            lastHitAccuracy: 0.85,
            jungleRate: 0.6,
            roamingFrequency: 0.50,
            
            visionAwareness: 0.55,
            threatAssessment: 0.65,
            
            // ✨ BASIC LLM/PREDICTION
            hasLLM: true,
            llmQuality: 0.30,
            llmAccuracy: 0.50,
            llmUsageFrequency: 0.50,
            
            predictEnemies: true,
            predictionRange: 1.0,
            predictionAccuracy: 0.40,
            
            hasComboSystem: true,
            hasSmartPathing: true,
        },
        
        veryhard: {
            decisionInterval: 800,
            reactionTime: 140,
            
            accuracy: 0.85,
            skillUsage: 0.78,
            comboHitRate: 0.93,
            comboExecution: 0.82,
            
            dodgeChance: 0.58,
            dodgeProjectile: 0.75,
            dodgeObstacle: 0.80,
            dodgeAbilityCC: 0.75,
            
            targetSelectionLogic: 'optimal_selection',
            targetingAccuracy: 0.90,
            
            movementSpeed: 1.0,
            pathfindingQuality: 'excellent',
            movementSmoothing: 0.95,
            unstuckThreshold: 500,
            
            farmEfficiency: 0.98,
            lastHitAccuracy: 0.95,
            jungleRate: 0.8,
            roamingFrequency: 0.80,
            
            visionAwareness: 0.85,
            threatAssessment: 0.90,
            
            // ✨ GOOD LLM/PREDICTION
            hasLLM: true,
            llmQuality: 0.65,
            llmAccuracy: 0.75,
            llmUsageFrequency: 0.85,
            
            predictEnemies: true,
            predictionRange: 2.0,
            predictionAccuracy: 0.70,
            
            hasComboSystem: true,
            hasSmartPathing: true,
        },
        
        nightmare: {
            decisionInterval: 150,
            reactionTime: 50,
            
            accuracy: 0.98,
            skillUsage: 0.98,
            comboHitRate: 1.0,
            comboExecution: 0.98,
            
            dodgeChance: 0.92,
            dodgeProjectile: 0.95,
            dodgeObstacle: 0.95,
            dodgeAbilityCC: 0.95,
            
            targetSelectionLogic: 'llm_optimal',
            targetingAccuracy: 1.0,
            
            movementSpeed: 1.0,
            pathfindingQuality: 'perfect',
            movementSmoothing: 1.0,
            unstuckThreshold: 200,
            
            farmEfficiency: 1.0,
            lastHitAccuracy: 1.0,
            jungleRate: 0.95,
            roamingFrequency: 1.0,
            
            visionAwareness: 1.0,
            threatAssessment: 1.0,
            
            // ✨ PERFECT LLM/PREDICTION
            hasLLM: true,
            llmQuality: 1.0,
            llmAccuracy: 1.0,
            llmUsageFrequency: 1.0,
            
            predictEnemies: true,
            predictionRange: 3.0,
            predictionAccuracy: 0.95,
            
            adaptiveAccuracy: true,
            optimalDecisions: true,
            perfectLastHit: true,
            perfectDodge: true,
            globalAwareness: true,
            
            hasComboSystem: true,
            hasSmartPathing: true,
        },
    },

    // === AI DIFFICULTY MODIFIERS (Ability Usage Patterns) ===
    aiDifficultyMods: {
        easy: {
            escapeHPThreshold: 0.20,
            useCCFrequency: 0.30,
            burstThreshold: 0.20,
            sustainThreshold: 0.50,
            decisionDelay: 500,
            abilityReuseCooldown: 3000,
        },
        normal: {
            escapeHPThreshold: 0.30,
            useCCFrequency: 0.60,
            burstThreshold: 0.40,
            sustainThreshold: 0.60,
            decisionDelay: 300,
            abilityReuseCooldown: 2000,
        },
        hard: {
            escapeHPThreshold: 0.35,
            useCCFrequency: 0.75,
            burstThreshold: 0.50,
            sustainThreshold: 0.65,
            decisionDelay: 150,
            abilityReuseCooldown: 1000,
        },
        nightmare: {
            escapeHPThreshold: 0.40,
            useCCFrequency: 0.90,
            burstThreshold: 0.60,
            sustainThreshold: 0.70,
            decisionDelay: 50,
            abilityReuseCooldown: 500,
        }
    },

    // === MINION & CREATURE SCALING ===
    gameScaling: {
        minion: {
            healthPerMinute: 1.05,  // 5% per minute
            damagePerMinute: 1.06,  // 6% per minute
            scaleInterval: 60000,   // Every 60 seconds
        },
        creature: {
            healthPerMinute: 1.04,  // 4% per minute
            damagePerMinute: 1.05,  // 5% per minute
            scaleInterval: 60000,   // Every 60 seconds
        },
    },

    // === MOVEMENT BEHAVIOR CONFIG ===
    aiMovement: {
        // Waypoint system
        waypointMode: 'dynamic',           // dynamic, static, hybrid
        waypointDistance: 150,             // Distance to waypoint before next
        waypointSmoothing: 0.7,            // 0-1: smoothness of movement
        
        // Stuck detection & recovery
        stuckDetectionInterval: 500,       // Check stuck every 500ms
        stuckDistanceThreshold: 30,        // Less than 30 pixel moved = stuck
        stuckRecoverySteps: 3,             // Try 3 recovery steps before pathfinding
        
        // Deadlock prevention
        deadlockDetectionTime: 3000,       // Detect deadlock after 3s
        deadlockRecoveryMode: 'jump',      // jump, retreat, dodge
        
        // Pathing
        pathUpdateInterval: 1000,          // Recalculate path every 1s
        pathSmoothness: 0.8,               // Path smoothing
        pathVisualization: false,          // Debug: show paths
    },

    // === DODGE SYSTEM CONFIG ===
    aiDodge: {
        // Projectile dodge
        projectilePredictionMs: 500,       // Predict 500ms ahead
        dodgeReactionTime: 150,            // React in 150ms
        dodgeSideMargin: 100,              // Dodge distance
        
        // Obstacle dodge (walls, towers, pillars)
        obstacleScanRange: 300,            // Scan obstacles 300px away
        obstacleMargin: 80,                // Keep 80px away from obstacles
        
        // CC ability dodge
        ccAbilityTypes: ['stun', 'root', 'knockup', 'pull', 'silence'],
        ccDodgeAccuracy: { easy: 0.05, normal: 0.15, hard: 0.45, veryhard: 0.75, nightmare: 0.95 },
        
        // Positioning
        idealRangeMargin: 0.9,             // Stay at 90% of max range
    },

    // === COMBO SYSTEM CONFIG ===
    aiCombo: {
        // Combo execution
        comboSequenceDelay: 100,           // Delay between abilities in combo
        comboDamageCalculation: true,      // Calculate damage before combo
        comboManaCheck: true,              // Check mana before casting
        
        // Ability priority
        ultimatePriority: 0.8,             // 80% chance to use ultimate if available
        skillPriority: { q: 0.6, e: 0.7, r: 0.9, t: 0.85 }, // Per ability priority
        
        // Conditions
        executeComboOnLowHP: true,
        executeComboOnKillable: true,
        executeComboOnKite: true,
    },

    // === TARGET SELECTION CONFIG ===
    aiTargeting: {
        // Priority factors
        priorityWeights: {
            lowHP: 0.30,                   // 30% weight on low HP
            threat: 0.25,                  // 25% weight on threat level
            distance: 0.20,                // 20% weight on distance
            comboSynergy: 0.15,            // 15% weight on combo synergy
            lastHit: 0.10,                 // 10% weight on last hit opportunity
        },
        
        // Threat calculation
        threatFactors: {
            damageOutput: 0.4,
            cooldowns: 0.3,
            position: 0.2,
            itemization: 0.1,
        },
        
        // Range preferences
        preferredRangePercentage: 0.85,    // Stay at 85% of max range
        minRangeToTarget: 100,             // Minimum distance to target
    },

    // === VISION & AWARENESS CONFIG ===
    aiVision: {
        // Map knowledge
        mapAwarenessRefreshRate: 500,      // Update map awareness every 500ms
        lastSeenTimeout: 5000,             // Forget enemy after 5s not seen
        
        // Ward knowledge
        wardPlacementImportance: {
            defensive: 0.7,
            offensive: 0.5,
            river: 0.8,
        },
        
        // Brush awareness
        brushScanRange: 800,
        brushPriority: 0.6,
    },

    // === FARMING CONFIG ===
    aiFarming: {
        // Last hit mechanics
        lastHitWindow: 200,                // 200ms window to last hit
        lastHitPrediction: true,
        lastHitMinDamage: 1.1,             // Need 110% damage to last hit
        
        // Minion priority
        minionPriority: {
            cannon: 0.9,                   // High priority
            melee: 0.5,
            ranged: 0.7,
            super: 0.95,
        },
        
        // Safety
        farmUnderTower: { easy: false, normal: false, hard: true, veryhard: true, nightmare: true },
        farmWithEnemyNear: { easy: false, normal: true, hard: true, veryhard: true, nightmare: true },
    },

    // === ROAMING CONFIG ===
    aiRoaming: {
        // Roaming triggers
        minAgeForRoam: 120000,             // Start roaming after 2min
        roamTravelTime: 5000,              // Travel to roam location in 5s
        roamObjPriority: { gank: 0.7, ward: 0.3, objective: 0.9 },
        
        // Roam locations
        preferredRoamLanes: { top: 0.3, mid: 0.7, bot: 0.5 },
    },

    // === PARAMETER SCALING ===
    aiParameters: {
        healthThresholdRetreat: {
            easy: 0.35, normal: 0.30, hard: 0.25, veryhard: 0.20, nightmare: 0.15,
        },
        aggressionLevel: {
            easy: 0.25, normal: 0.45, hard: 0.60, veryhard: 0.78, nightmare: 0.90,
        },
        riskTolerance: {
            easy: 0.10, normal: 0.25, hard: 0.45, veryhard: 0.70, nightmare: 0.95,
        },
        roamingMultiplier: {
            easy: 0.3, normal: 0.6, hard: 0.9, veryhard: 1.2, nightmare: 1.5,
        },
        mapKnowledge: {
            easy: 0.2, normal: 0.4, hard: 0.65, veryhard: 0.9, nightmare: 1.0,
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
    aiNames:
        [
          // --- EDGY & CLASSIC GAMER STYLE (English/Global) ---
          'xX_Shadow_Hunter_Xx',
          'Noob_Slayer_v2.0',
          'Captain.Price.141',
          'Sniper_Elite_99',
          'Dont_Kill_Me_Pls',
          'Lag_Is_Real_!!!',
          'Tactical_Feeder',
          'Just_A_Glitch',
          'Get.Rekt.Son.=_=',
          'Cyber_Punk_2077',
          'Dr4g0n_W4rri0r',
          'Silent.Assassin.',
          'Pro_Gamer_1337',
          'Coffee_Addict_xD',
          'Keyboard_Warrior',
          'Error_404_Found',
          'Toxic_Player_007',
          'Ping_999_ms',
          'Loading_..._99%',
          'Rush_B_Dont_Stop',
          'One_Shot_One_Kill',
          'Ghost_In_The_Shell',
          'Zero_Cool_Hacker',
          'KilleR_InstincT',
          'Deadly-Viper-X',
          'The.Last.Jedi',
          'Iron_Man_Fanboy',
          'Batman_No_Parents',
          'Walter_White_Meth',
          'Squid_Game_001',
          'Winter_Is_Coming_',
          'Rick_And_Morty_C137',
          'God_Mode_Enabled',
          'Aim_Bot_Activated',
          'Wall_Hack_User?',
          'Report_Me_Plz',
          'Sweaty_Tryhard',
          'Casual_Gamer_Dad',
          'Mom_Get_The_Camera',
          'Xx_Sephiroth_xX',
          'Cloud_Strife_FF7',
          'Link_Zelda_Hyrule',
          'Mario_Luigi_Bros',
          'Sonic.The.Hedgehog',
          'Master_Chief_117',
          'Kratos_God_Of_War',
          'Doom_Slayer_BFG',
          'Geralt_Of_Rivia',
          'Yennefer_Vengerberg',
          'Tracer_Overwatch',
          'Jinx_Arcane_LoL',
          'Teemo_Mushroom',
          'Yasuo_0_10_Power',
          'Faker_Senpai_KR',
          'Shroud_Aim_God',
          'Ninja_Fortnite_OG',
          'PewDiePie_BroFist',
          'MrBeast_Giveaway',

          // --- VIETNAMESE (Real User Style) ---
          'Huy_Dep_Trai_9x',
          'Thich_An_Pho_Bo',
          'Gamer_Viet_Nam_Vo_Dich',
          'Chua_Te_Bong_Dem',
          'Sat_Thu_Tinh_Truong',
          'Co_Be_Ban_Diêm',
          'Chi_Pheo_Thoi_4.0',
          'Lao_Hac_Nuoi_Cho',
          'Ha_Noi_Mua_Thu',
          'Sai_Gon_Cafe_Sua',
          'Banh_Mi_Pate_Trung',
          'Tra_Da_Via_He_VN',
          'Dung_Hoi_Em_La_Ai',
          'Yeu_Em_Tron_Doi',
          'Mai_Mai_Mot_Tinh_Yeu',
          'Doi_Thay_Huyen_Thoai',
          'Top_1_Sever_Viet',
          'Anh_Hung_Ban_Phim',
          'Tre_Trau_Chua_Dat_Ten',
          'Huyen_Thoai_Rong_Vang',
          'Sieu_Nhan_Gao_Do',

          // --- CHINESE / JAPANESE (Romanized & Characters) ---
          'W0_Bu_Zhi_Dao_???', // "I don't know"
          'Tian_Xia_Di_Yi_CN', // "Number 1 under heaven"
          'Ni_Hao_Ma_Friend',
          'Lao_Gan_Ma_Lover',
          'Genshin_Impact_Whale',
          'Anime_Waifu_Lover',
          'Otaku_For_Life_UwU',
          'Neko_Chan_Kawaii',
          'Yamete_Kudasai_>.<',
          'Omae_Wa_Mou_Shindeiru',
          'Nani_the_Fck_xD',
          'Kage_Bunshin_No_Jutsu',
          'Bankai_Ichigo_K',
          'Luffy_Pirate_King',
          'Naruto_Hokage_7th',
          'Goku_Super_Saiyan',
          'Vegeta_Prince_SSJ',
          'Saitama_One_Punch',
          'Attack_On_Titan_Levi',
          'Tokyo_Ghoul_Kaneki',
          'Demon_Slayer_Tanjiro',
          'Nezuko_In_Box',
          'Zenitsu_Thunder',
          'Inosuke_Boar_Head',
          'Rengoku_Donut_:)',
          'Go_Jo_Sa_To_Ru',
          'Sukuna_Finger_Yummy',
          'Anya_Forger_Peanut',
          'Yor_Briar_Assassin',
          'Loid_Forger_Spy',
          'Makima_Woof_Woof',
          'Denji_Chainsaw_Man',
          'Power_Blood_Fiend',
          'Aki_Hayakawa_Gun',
          'Kobeni_Car_Owner',
          'Reze_Bomb_Girl',
          'Quanxi_Crossbow',
          'Kishibe_Alcoholic',
          'Himeno_Ghost_Eye',
          'Pochita_Best_Boy',
          'Katana_Man_Samurai',
          'Sawatar_Snake_Girl',
          'Beam_Shark_Fiend',
          'Violenc_Fiend_Galgal',
          'Ange_Devil_Lazy',
          'Prinz_Spider_Devil',
          'Zomb_Devil_Trash',
          'Bat_Devil_Blood',
          'Typhoo_Devil_Rain',
          'Leec_Devil_Dream',
          'Fox_Devil_Kon_!!',
          'Ghos_Devil_Hand',
          'Curs_Devil_Nail',
          'Snake_Devil_Tail',
          'Futu_Devil_Dance',
          'Darknes_Devil_Void',
          'Doll_Devil_Santa',
          'Hel_Devil_Portal',
          'G_u_n_Devil_Bullet',
          'Contro_Devil_Nayuta',
          'Wa_Devil_Yoru',
          'Famin_Devil_Fami',
          'Deat_Devil_End',
          'Nuclear_Weapon_War',
          'Blood_Devil_Powy',
          'Falling_Devil_Chef',
          'Justice_Devil_Class',
          'Eternity_Devil_8F',
          'Cosmo_Halloween',
          'Long_Sword_Hybrid',
          'Flamethrower_Hybrid',
          'Spear_Hybrid_Miar',
          'Whip_Hybrid_Sado',
          'Barem_Bridge_Fire',
          'Miri_Sugo_Sword',
          'Haruka_Iseumi_Fan',
          'Seigi_Akoku_Fight',
          'Higashiyama_Family',
          'Kusakal_Bodyguard',
          'Tendo_Subaru_Kyoto',
          'Kurose_Kyoto_Pupil',
          'Nomo_Doctor_Hand',
          'Arai_Hirokazu_Pal',
          'Fushi_Devil_Hunter',
          'Madoka_Survivor',
          'Okonogi_Partner',
          'Tolka_Master_Doll',
          'Santa_Claus_Old',
          'Pingtsi_Fiend_Int',
          'Long_Fiend_Dragon',
          'Tsugihagi_Stitch',
          'Kusabe_Stone_Dev',
          'Tamaoki_Shadow_Dev',
          'Nakamura_Fox_Dev',
          'Kato_Mold_Devil',
          'Tanaka_Spine_Swrd',
          'Sato_Skin_Devil',
          'Suzuki_Ear_Devil',
          'Takahashi_Eye_Dev',
          'Watanabe_Nose_Dev',
          'Ito_Mouth_Devil',
          'Yamamoto_Teeth_Dev',
          'Nakamura_Hair_Dev',
          'Kobayashi_Bone_Dev',
          'Kato_Blood_Devil',
          'Yoshida_Octopus',
          'Fumiko_Mifune_Sec',
          'Asa_Mitaka_War_V2',
          'Yuko_Justice_Dev',
          'Crambon_Cat_Sad',
          'Meowy_Cat_Happy',
          'Nutella_Devil_Sweet',
          'Coffee_Devil_Bitter',
          'Pizza_Devil_Cheesy',
          'Burger_Devil_Juicy',
          'Fries_Devil_Salty',
          'Soda_Devil_Fizzy',
          'IceCream_Devil_Cold',
          'Cake_Devil_Soft',
          'Cookie_Devil_Crumby',
          'Donut_Devil_Holey',
          'Bagel_Devil_Round',
          'Toast_Devil_Burnt',
          'Pancake_Devil_Flat',
          'Waffle_Devil_Grid',
          'Bacon_Devil_Crispy',
          'Egg_Devil_Yolky',
          'Cheese_Devil_Melt',
          'Butter_Devil_Slip',
          'Bread_Devil_Loaf',
          'Rice_Devil_Grain',
          'Noodle_Devil_Long',
          'Pasta_Devil_Saucy',
          'Sushi_Devil_Raw',
          'Sashimi_Devil_Fish',
          'Tempura_Devil_Fry',
          'Ramen_Devil_Soup',
          'Udon_Devil_Thick',
          'Soba_Devil_Thin',
          'Miso_Devil_Paste',
          'Tofu_Devil_Soft',
          'Curry_Devil_Spice',
          'Stew_Devil_Hot',
          'Salad_Devil_Green',
          'Fruit_Devil_Sweet',
          'Veggie_Devil_Health',
          'Meat_Devil_Flesh',
          'Fish_Devil_Swim',
          'Bird_Devil_Fly',
          'Cow_Devil_Moo',
          'Pig_Devil_Oink',
          'Sheep_Devil_Baa',
          'Goat_Devil_Bleat',
          'Horse_Devil_Neigh',
          'Dog_Devil_Bark',
          'Cat_Devil_Meow',
          'Mouse_Devil_Squeak',
          'Rat_Devil_Gnaw',
          'Rabbit_Devil_Hop',
          'Fox_Devil_Sly',
          'Bear_Devil_Roar',
          'Wolf_Devil_Howl',
          'Tiger_Devil_Stripe',
          'Lion_Devil_Mane',
          'Elephant_Devil_Trunk',
          'Giraffe_Devil_Neck',
          'Zebra_Devil_B&W',
          'Monkey_Devil_Tree',
          'Ape_Devil_Strong',
          'Gorilla_Devil_Big',
          'Chimp_Devil_Smart',
          'Snake_Devil_Hiss',
          'Lizard_Devil_Scale',
          'Turtle_Devil_Shell',
          'Frog_Devil_Croak',
          'Toad_Devil_Wart',
          'Fish_Devil_Gill',
          'Shark_Devil_Fin',
          'Whale_Devil_Blow',
          'Dolphin_Devil_Click',
          'Seal_Devil_Clap',
          'Penguin_Devil_Slide',
          'Bird_Devil_Wing',
          'Eagle_Devil_Soar',
          'Hawk_Devil_Dive',
          'Owl_Devil_Hoot',
          'Crow_Devil_Caw',
          'Raven_Devil_Black',
          'Parrot_Devil_Talk',
          'Pigeon_Devil_Coo',
          'Duck_Devil_Quack',
          'Goose_Devil_Honk',
          'Swan_Devil_Grace',
          'Chicken_Devil_Egg',
          'Rooster_Devil_Wake',
          'Turkey_Devil_Gobble',
          'Bee_Devil_Sting',
          'Wasp_Devil_Pain',
          'Ant_Devil_March',
          'Bug_Devil_Crawl',
          'Fly_Devil_Buzz',
          'Moth_Devil_Lamp',
          'Spider_Devil_Web',
          'Scorpion_Devil_Tail',
          'Crab_Devil_Pinch',
          'Lobster_Devil_Red',
          'Shrimp_Devil_Small',
          'Clam_Devil_Shut',
          'Snail_Devil_Slow',
          'Slug_Devil_Slime',
          'Worm_Devil_Dig',

          // --- UNICODE & SYMBOLS (Decorated) ---
          '★_Super_Star_★',
          '>>>Speed_Demon<<<',
          '꧁༺LeGeNd༻꧂',
          '¯\_(ツ)_/¯_Shrug',
          '[AFK]_But_Winning',
          '=+=_Medic_=+=',
          'x_X_Sniper_X_x',
          '-->_Insert_Coin_<--',
          '$$$_Rich_Kid_$$$',
          '♥_Love_Is_War_♥',
          '⚠_Danger_Zone_⚠',
          '†_The_Undertaker_†',
          '♪_Music_Lover_♪',
          '∞_Infinity_Loop_∞',
          '✪_Official_Bot_✪',
          'Alpha_&_Omega_Ω',
          'Pie_Is_3.14159...',

          // --- NONSENSE / KEYBOARD MASH (Very Real) ---
          'asdfghjkl_123',
          'qwerty_uiop_xD',
          'zxcvbnm_!!!',
          'User_192837465',
          'Player_No_Name',
          'Guest_9999999',
          '1234567890_Pass',
          'Admin_Root_Sys',
          'Test_Account_01',
          'Bot_Or_Not???',
          'Why_So_Serious?',
          'Hello_World_js',
          'System.Out.Print',
          'Sudo_Rm_Rf_Root',
          'Cmd_Ctrl_Alt_Del'

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
