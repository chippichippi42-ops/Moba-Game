/**
 * ========================================
 * HERO: Nemo - Trợ Thủ (Tank/Support)
 * ========================================
 * Tank với khả năng bảo vệ đồng đội và khống chế
 */

const HeroNemo = {
    id: 'nemo',
    name: 'Nemo',
    role: 'tank',
    attackType: 'melee',
    difficulty: 1,
    icon: '🛡️',
    color: '#3b82f6',
    
    description: 'Trợ thủ bền bỉ với khả năng bảo vệ đồng đội và khống chế kẻ địch hiệu quả.',

    // === BASE STATS ===
    baseStats: {
        health: 750,
        mana: 320,
        healthRegen: 10,
        manaRegen: 4,
        attackDamage: 50,
        abilityPower: 30,
        armor: 40,
        magicResist: 35,
        attackSpeed: 0.6,
        attackRange: 150,
        moveSpeed: 340,
        critChance: 0,
        critDamage: 150,
    },

    // === STAT GROWTH PER LEVEL ===
    statGrowth: {
        health: 110,
        mana: 35,
        healthRegen: 1.0,
        manaRegen: 0.3,
        attackDamage: 4,
        abilityPower: 2,
        armor: 5,
        magicResist: 3,
        attackSpeed: 0.01,
        critChance: 0,
    },

    // === PASSIVE ===
    passive: {
        name: 'Ý Chí Thép',
        description: 'Khi máu dưới 30%, nhận 30% giảm sát thương trong 5 giây. Hồi chiêu 60 giây.',
        icon: '💪',
        hpThreshold: 0.3,
        damageReduction: 0.3,
        duration: 5000,
        cooldown: 60000,
    },

    // === ABILITIES ===
    abilities: {
        // Q - Húc Mạnh
        q: {
            name: 'Húc Mạnh',
            description: 'Lao về phía trước và húc kẻ địch đầu tiên, gây sát thương và làm choáng.',
            icon: '🦬',
            type: 'dash',
            damageType: 'physical',
            baseDamage: [60, 100, 140, 180, 220],
            adRatio: 0.5,
            apRatio: 0,
            bonusHealthRatio: 0.05,
            manaCost: [50, 55, 60, 65, 70],
            cooldown: [10000, 9500, 9000, 8500, 8000],
            dashDistance: 400,
            stunDuration: 1000,
            maxLevel: 5,

            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] 
                    + (hero.stats.attackDamage * this.adRatio)
                    + (hero.stats.maxHealth * this.bonusHealthRatio);
                const angle = Utils.angleBetweenPoints(hero.x, hero.y, targetX, targetY);
                
                return {
                    type: 'dash_collision',
                    dashX: hero.x + Math.cos(angle) * this.dashDistance,
                    dashY: hero.y + Math.sin(angle) * this.dashDistance,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#3b82f6',
                    onHit: {
                        type: 'stun',
                        duration: this.stunDuration,
                    },
                    stopOnHit: true,
                };
            },
        },

        // E - Khiên Bảo Hộ
        e: {
            name: 'Khiên Bảo Hộ',
            description: 'Tạo khiên cho bản thân hoặc đồng đội trong tầm, hấp thụ sát thương.',
            icon: '🔰',
            type: 'shield',
            damageType: 'none',
            baseShield: [80, 130, 180, 230, 280],
            apRatio: 0.4,
            bonusHealthRatio: 0.08,
            manaCost: [60, 65, 70, 75, 80],
            cooldown: [12000, 11000, 10000, 9000, 8000],
            range: 600,
            duration: 4000,
            maxLevel: 5,

            execute(hero, targetX, targetY, level) {
                const shieldAmount = this.baseShield[level - 1] 
                    + (hero.stats.abilityPower * this.apRatio)
                    + (hero.stats.maxHealth * this.bonusHealthRatio);
                
                return {
                    type: 'targeted_shield',
                    targetX: targetX,
                    targetY: targetY,
                    range: this.range,
                    shieldAmount: shieldAmount,
                    duration: this.duration,
                    owner: hero,
                    color: '#60a5fa',
                    canTargetSelf: true,
                    canTargetAlly: true,
                };
            },
        },

        // R - Khiêu Khích
        r: {
            name: 'Khiêu Khích',
            description: 'Khiêu khích tất cả kẻ địch xung quanh, buộc họ tấn công bạn trong 2 giây.',
            icon: '😤',
            type: 'area',
            damageType: 'none',
            manaCost: [50, 55, 60, 65, 70],
            cooldown: [14000, 13000, 12000, 11000, 10000],
            radius: 350,
            tauntDuration: 2000,
            maxLevel: 5,

            execute(hero, targetX, targetY, level) {
                return {
                    type: 'instant_area',
                    x: hero.x,
                    y: hero.y,
                    radius: this.radius,
                    damage: 0,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#f59e0b',
                    effects: [{
                        type: 'taunt',
                        duration: this.tauntDuration,
                        source: hero,
                    }],
                };
            },
        },

        // T - Ultimate: Pháo Đài Bất Diệt
        t: {
            name: 'Pháo Đài Bất Diệt',
            description: 'Tạo một vùng pháo đài trong 5 giây. Đồng đội trong vùng nhận giảm 30% sát thương và hồi máu mỗi giây.',
            icon: '🏰',
            type: 'zone',
            damageType: 'none',
            baseHeal: [20, 35, 50],
            apRatio: 0.15,
            damageReduction: 0.3,
            manaCost: [100, 120, 140],
            cooldown: [100000, 90000, 80000],
            radius: 400,
            duration: 5000,
            tickRate: 1000,
            maxLevel: 3,

            execute(hero, targetX, targetY, level) {
                const healPerTick = this.baseHeal[level - 1] + (hero.stats.abilityPower * this.apRatio);
                
                return {
                    type: 'zone',
                    x: hero.x,
                    y: hero.y,
                    radius: this.radius,
                    duration: this.duration,
                    tickRate: this.tickRate,
                    owner: hero,
                    color: '#22c55e',
                    allyEffects: {
                        damageReduction: this.damageReduction,
                        healPerTick: healPerTick,
                    },
                };
            },
        },
    },

    // === BASIC ATTACK ===
    basicAttack: {
        type: 'melee',

        execute(hero, target) {
            const damage = hero.stats.attackDamage;
            
            return {
                type: 'melee_attack',
                target: target,
                damage: damage,
                damageType: 'physical',
                owner: hero,
                color: '#3b82f6',
            };
        },
    },

    // === AI HINTS ===
    aiHints: {
        preferredLane: 'bot',
        playstyle: 'protective',
        powerSpike: 'mid',
        teamfightRole: 'frontline_peeler',
        
        priorities: {
            farming: 0.4,
            trading: 0.5,
            objectives: 0.8,
            teamfighting: 0.9,
            protecting: 0.95,
        },
        
        combos: [
            { sequence: ['q'], condition: 'engage' },
            { sequence: ['e'], condition: 'protect' },
            { sequence: ['q', 'r'], condition: 'peel' },
            { sequence: ['t', 'r', 'q'], condition: 'teamfight' },
        ],
        
        threatLevel: {
            assassin: 'low',
            fighter: 'low',
            mage: 'low',
            marksman: 'low',
            tank: 'low',
            support: 'low',
        },
    },
};

// Register hero
if (typeof HeroRegistry !== 'undefined') {
    HeroRegistry.register(HeroNemo);
}
