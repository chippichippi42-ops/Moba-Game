/**
 * ========================================
 * HERO: Zephy - Đấu Sĩ (Fighter)
 * ========================================
 * Đấu sĩ cận chiến với khả năng combat và sustain cao
 */

const HeroZephy = {
    id: 'zephy',
    name: 'Zephy',
    role: 'fighter',
    attackType: 'melee',
    difficulty: 2,
    icon: '⚔️',
    color: '#ef4444',
    
    description: 'Đấu sĩ mạnh mẽ với khả năng lao vào trận chiến và gây sát thương lớn trong tầm gần.',

    // === BASE STATS ===
    baseStats: {
        health: 650,
        mana: 280,
        healthRegen: 8,
        manaRegen: 3,
        attackDamage: 55,
        abilityPower: 0,
        armor: 30,
        magicResist: 28,
        attackSpeed: 0.75,
        attackRange: 150,
        moveSpeed: 360,
        critChance: 0,
        critDamage: 150,
    },

    // === STAT GROWTH PER LEVEL ===
    statGrowth: {
        health: 95,
        mana: 30,
        healthRegen: 0.8,
        manaRegen: 0.2,
        attackDamage: 6,
        abilityPower: 0,
        armor: 4,
        magicResist: 2,
        attackSpeed: 0.03,
        critChance: 0,
    },

    // === PASSIVE ===
    passive: {
        name: 'Cuồng Chiến',
        description: 'Mỗi khi gây sát thương, nhận 1 điểm Cuồng Chiến. Mỗi điểm tăng 1% tốc đánh và 0.5% hút máu. Tối đa 20 điểm.',
        icon: '🔥',
        maxStacks: 20,
        attackSpeedPerStack: 0.01,
        lifeStealPerStack: 0.005,
        decayTime: 5000,
    },

    // === ABILITIES ===
    abilities: {
        // Q - Chém Xoáy
        q: {
            name: 'Chém Xoáy',
            description: 'Chém một vòng xung quanh, gây sát thương cho tất cả kẻ địch trong tầm.',
            icon: 'assets/icons/zephy_q.png',
            type: 'area',
            damageType: 'physical',
            baseDamage: [70, 110, 150, 190, 230],
            adRatio: 0.7,
            apRatio: 0,
            manaCost: [40, 45, 50, 55, 60],
            cooldown: [6000, 5500, 5000, 4500, 4000],
            radius: 280,
            maxLevel: 5,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'Burst',
            priority: 3,
            minDamage: 110,
            isEscape: false,
            isCC: false,
            canChain: true,
            isSustain: false,
            isEngage: false,

            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] + (hero.stats.attackDamage * this.adRatio);
                
                return {
                    type: 'instant_area',
                    x: hero.x,
                    y: hero.y,
                    radius: this.radius,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#ef4444',
                    animation: 'spin',
                };
            },
        },

        // E - Lao Đột
        e: {
            name: 'Lao Đột',
            description: 'Lao về phía trước một đoạn ngắn, mục tiêu đầu tiên chạm phải sẽ bị đánh bật lên và chịu sát thương.',
            icon: 'assets/icons/zephy_e.png',
            type: 'dash',
            damageType: 'physical',
            baseDamage: [60, 95, 130, 165, 200],
            adRatio: 0.6,
            apRatio: 0,
            manaCost: [50, 55, 60, 65, 70],
            cooldown: [12000, 11000, 10000, 9000, 8000],
            dashDistance: 450,
            knockupDuration: 500,
            maxLevel: 5,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'CC',
            priority: 2,
            minDamage: 90,
            isEscape: false,
            isCC: true,
            canChain: true,
            isSustain: false,
            isEngage: true,

            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] + (hero.stats.attackDamage * this.adRatio);
                const angle = Utils.angleBetweenPoints(hero.x, hero.y, targetX, targetY);
                
                return {
                    type: 'dash_collision',
                    dashX: hero.x + Math.cos(angle) * this.dashDistance,
                    dashY: hero.y + Math.sin(angle) * this.dashDistance,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#ef4444',
                    onHit: {
                        type: 'knockup',
                        duration: this.knockupDuration,
                    },
                    stopOnHit: true,
                };
            },
        },

        // R - Bão Kiếm
        r: {
            name: 'Bão Kiếm',
            description: 'Tạo ra một cơn bão kiếm xung quanh trong 3 giây, gây sát thương liên tục và hút máu.',
            icon: 'assets/icons/zephy_r.png',
            type: 'channel',
            damageType: 'physical',
            baseDamage: [40, 60, 80, 100, 120], // per tick
            adRatio: 0.25,
            apRatio: 0,
            manaCost: [60, 70, 80, 90, 100],
            cooldown: [16000, 15000, 14000, 13000, 12000],
            duration: 3000,
            tickRate: 250, // damage every 0.25s
            radius: 350,
            lifeSteal: 0.25, // 25% of damage dealt
            maxLevel: 5,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'Burst',
            priority: 2,
            minDamage: 50,
            isEscape: false,
            isCC: false,
            canChain: true,
            isSustain: true,
            isEngage: false,

            execute(hero, targetX, targetY, level) {
                const damagePerTick = this.baseDamage[level - 1] + (hero.stats.attackDamage * this.adRatio);
                
                return {
                    type: 'channel_area',
                    x: hero.x,
                    y: hero.y,
                    radius: this.radius,
                    duration: this.duration,
                    tickRate: this.tickRate,
                    damagePerTick: damagePerTick,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#dc2626',
                    lifeSteal: this.lifeSteal,
                    followOwner: true,
                };
            },
        },

        // T - Ultimate: Tử Thần Giáng Thế
        t: {
            name: 'Tử Thần Giáng Thế',
            description: 'Nhảy lên không trung và đập xuống vị trí chỉ định, gây sát thương lớn và làm chậm kẻ địch.',
            icon: 'assets/icons/zephy_t.png',
            type: 'leap',
            damageType: 'physical',
            baseDamage: [200, 350, 500],
            adRatio: 1.0,
            apRatio: 0,
            manaCost: [100, 120, 140],
            cooldown: [80000, 70000, 60000],
            range: 600,
            radius: 300,
            slowPercent: 50,
            slowDuration: 2000,
            maxLevel: 3,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'Engage',
            priority: 1,
            minDamage: 250,
            isEscape: false,
            isCC: true,
            canChain: true,
            isSustain: false,
            isEngage: true,

            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] + (hero.stats.attackDamage * this.adRatio);
                
                return {
                    type: 'leap_slam',
                    startX: hero.x,
                    startY: hero.y,
                    targetX: targetX,
                    targetY: targetY,
                    leapDuration: 500,
                    radius: this.radius,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#991b1b',
                    effects: [{
                        type: 'slow',
                        percent: this.slowPercent,
                        duration: this.slowDuration,
                    }],
                    untargetable: true,
                };
            },
        },
    },

    // === BASIC ATTACK ===
    basicAttack: {
        type: 'melee',
        
        execute(hero, target) {
            const damage = hero.stats.attackDamage;
            
            // Add passive stack
            hero.passiveStacks = Math.min((hero.passiveStacks || 0) + 1, hero.heroData.passive.maxStacks);
            hero.passiveLastHit = Date.now();
            
            return {
                type: 'melee_attack',
                target: target,
                damage: damage,
                damageType: 'physical',
                owner: hero,
                color: '#ef4444',
            };
        },
    },

    // === AI HINTS ===
    aiHints: {
        preferredLane: 'top',
        playstyle: 'aggressive',
        powerSpike: 'mid',
        teamfightRole: 'frontline_diver',
        
        priorities: {
            farming: 0.6,
            trading: 0.8,
            objectives: 0.7,
            teamfighting: 0.8,
        },
        
        combos: [
            { sequence: ['e', 'q', 'auto'], condition: 'engage' },
            { sequence: ['e', 'r', 'q'], condition: 'trade' },
            { sequence: ['t', 'e', 'r', 'q'], condition: 'all_in' },
        ],
        
        threatLevel: {
            assassin: 'medium',
            fighter: 'medium',
            mage: 'medium',
            marksman: 'low',
            tank: 'low',
            support: 'low',
        },
    },
};

// Register hero
if (typeof HeroRegistry !== 'undefined') {
    HeroRegistry.register(HeroZephy);
}
