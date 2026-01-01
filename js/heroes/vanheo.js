/**
 * ========================================
 * HERO: Vanheo - Xạ Thủ (Marksman)
 * ========================================
 * Xạ thủ tầm xa với sát thương vật lý cao
 */

const HeroVanheo = {
    id: 'vanheo',
    name: 'Vanheo',
    role: 'marksman',
    attackType: 'ranged',
    difficulty: 2,
    icon: '🏹',
    color: '#f59e0b',
    
    description: 'Xạ thủ tầm xa với khả năng gây sát thương vật lý khủng khiếp từ khoảng cách an toàn.',

    // === BASE STATS ===
    baseStats: {
        health: 550,
        mana: 300,
        healthRegen: 5,
        manaRegen: 4,
        attackDamage: 60,
        abilityPower: 0,
        armor: 18,
        magicResist: 25,
        attackSpeed: 0.9, // attacks per second
        attackRange: 550,
        moveSpeed: 340,
        critChance: 10,
        critDamage: 150,
    },

    // === STAT GROWTH PER LEVEL ===
    statGrowth: {
        health: 85,
        mana: 35,
        healthRegen: 0.5,
        manaRegen: 0.3,
        attackDamage: 8,
        abilityPower: 0,
        armor: 3,
        magicResist: 1.5,
        attackSpeed: 0.04,
        critChance: 1,
    },

    // === PASSIVE ===
    passive: {
        name: 'Tầm Nhìn Diều Hâu',
        description: 'Mỗi đòn đánh thường liên tiếp lên cùng mục tiêu tăng 5% sát thương, tối đa 5 lần. Reset sau 3 giây không đánh.',
        icon: '👁️',
        maxStacks: 5,
        damagePerStack: 0.05,
        resetTime: 3000,
    },

    // === ABILITIES ===
    abilities: {
        // Q - Mũi Tên Xuyên
        q: {
            name: 'Mũi Tên Xuyên',
            description: 'Bắn một mũi tên xuyên qua kẻ địch, gây sát thương cho tất cả mục tiêu trên đường đi.',
            icon: '➡️',
            type: 'skillshot',
            damageType: 'physical',
            baseDamage: [80, 120, 160, 200, 240],
            adRatio: 0.8,
            apRatio: 0,
            manaCost: [50, 55, 60, 65, 70],
            cooldown: [8000, 7500, 7000, 6500, 6000],
            range: 900,
            width: 60,
            speed: 1500,
            maxLevel: 5,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'Burst',
            priority: 3,
            minDamage: 120,
            isEscape: false,
            isCC: false,
            canChain: true,
            isSustain: false,
            isEngage: false,
            
            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] + (hero.stats.attackDamage * this.adRatio);
                const angle = Utils.angleBetweenPoints(hero.x, hero.y, targetX, targetY);
                
                return {
                    type: 'projectile',
                    projectileType: 'piercing',
                    x: hero.x,
                    y: hero.y,
                    angle: angle,
                    speed: this.speed,
                    range: this.range,
                    width: this.width,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#f59e0b',
                    piercing: true,
                };
            },
        },

        // E - Mưa Tên
        e: {
            name: 'Mưa Tên',
            description: 'Bắn một loạt tên lên trời, tên rơi xuống vùng chỉ định sau 0.5 giây, gây sát thương và làm chậm.',
            icon: '🌧️',
            type: 'area',
            damageType: 'physical',
            baseDamage: [100, 150, 200, 250, 300],
            adRatio: 0.6,
            apRatio: 0,
            manaCost: [70, 75, 80, 85, 90],
            cooldown: [12000, 11000, 10000, 9000, 8000],
            range: 800,
            radius: 200,
            delay: 500,
            slowPercent: 30,
            slowDuration: 2000,
            maxLevel: 5,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'CC',
            priority: 2,
            minDamage: 130,
            isEscape: false,
            isCC: true,
            canChain: true,
            isSustain: false,
            isEngage: false,

            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] + (hero.stats.attackDamage * this.adRatio);
                
                return {
                    type: 'delayed_area',
                    x: targetX,
                    y: targetY,
                    delay: this.delay,
                    radius: this.radius,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#fbbf24',
                    effects: [{
                        type: 'slow',
                        percent: this.slowPercent,
                        duration: this.slowDuration,
                    }],
                };
            },
        },

        // R - Lùi Bước
        r: {
            name: 'Lùi Bước',
            description: 'Nhảy lùi về phía sau và bắn một phát đạn gây sát thương. Nếu trúng tướng địch, giảm 2 giây hồi chiêu cho tất cả kỹ năng.',
            icon: '↩️',
            type: 'dash',
            damageType: 'physical',
            baseDamage: [60, 90, 120, 150, 180],
            adRatio: 0.5,
            apRatio: 0,
            manaCost: [40, 45, 50, 55, 60],
            cooldown: [14000, 13000, 12000, 11000, 10000],
            dashDistance: 350,
            projectileRange: 600,
            cdrOnHit: 2000,
            maxLevel: 5,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'Escape',
            priority: 4,
            minDamage: 90,
            isEscape: true,
            isCC: false,
            canChain: true,
            isSustain: false,
            isEngage: false,

            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] + (hero.stats.attackDamage * this.adRatio);
                const angle = Utils.angleBetweenPoints(hero.x, hero.y, targetX, targetY);
                const backAngle = angle + Math.PI;
                
                return {
                    type: 'dash_and_shoot',
                    dashX: hero.x + Math.cos(backAngle) * this.dashDistance,
                    dashY: hero.y + Math.sin(backAngle) * this.dashDistance,
                    projectile: {
                        type: 'projectile',
                        angle: angle,
                        speed: 1800,
                        range: this.projectileRange,
                        damage: damage,
                        damageType: this.damageType,
                        owner: hero,
                        color: '#f59e0b',
                        onHitHero: () => {
                            // Reduce all cooldowns by 2 seconds
                            hero.reduceCooldowns(this.cdrOnHit);
                        },
                    },
                };
            },
        },

        // T - Ultimate: Tên Trời Phạt
        t: {
            name: 'Tên Trời Phạt',
            description: 'Sau 1 giây tích lũy, bắn một mũi tên khổng lồ xuyên toàn bản đồ, gây sát thương cực lớn cho mục tiêu đầu tiên và giảm dần cho các mục tiêu sau.',
            icon: '💥',
            type: 'global_skillshot',
            damageType: 'physical',
            baseDamage: [350, 500, 650],
            adRatio: 1.2,
            apRatio: 0,
            manaCost: [100, 120, 140],
            cooldown: [90000, 75000, 60000],
            chargeTime: 1000,
            width: 120,
            speed: 2500,
            damageFalloff: 0.15, // -15% mỗi mục tiêu
            minDamagePercent: 0.4,
            maxLevel: 3,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'Burst',
            priority: 1,
            minDamage: 400,
            isEscape: false,
            isCC: false,
            canChain: true,
            isSustain: false,
            isEngage: false,

            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] + (hero.stats.attackDamage * this.adRatio);
                const angle = Utils.angleBetweenPoints(hero.x, hero.y, targetX, targetY);
                
                return {
                    type: 'charged_global_projectile',
                    chargeTime: this.chargeTime,
                    x: hero.x,
                    y: hero.y,
                    angle: angle,
                    speed: this.speed,
                    width: this.width,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#ef4444',
                    damageFalloff: this.damageFalloff,
                    minDamagePercent: this.minDamagePercent,
                    global: true,
                };
            },
        },
    },

    // === BASIC ATTACK ===
    basicAttack: {
        type: 'ranged',
        projectileSpeed: 2000,
        projectileColor: '#f59e0b',

        execute(hero, target) {
            const damage = hero.stats.attackDamage;
            // Apply passive stacks
            let bonusDamage = 0;
            if (hero.passiveTarget === target.id) {
                hero.passiveStacks = Math.min(hero.passiveStacks + 1, hero.heroData.passive.maxStacks);
                bonusDamage = damage * (hero.passiveStacks * hero.heroData.passive.damagePerStack);
            } else {
                hero.passiveTarget = target.id;
                hero.passiveStacks = 1;
            }
            hero.passiveLastHit = Date.now();

            return {
                type: 'projectile',
                x: hero.x,
                y: hero.y,
                target: target,
                speed: this.projectileSpeed,
                damage: damage + bonusDamage,
                damageType: 'physical',
                owner: hero,
                color: this.projectileColor,
            };
        },
    },

    // === AI HINTS ===
    aiHints: {
        preferredLane: 'bot',
        playstyle: 'poke',
        powerSpike: 'late',
        teamfightRole: 'backline_dps',
        
        // Priorities
        priorities: {
            farming: 0.8,
            trading: 0.5,
            objectives: 0.7,
            teamfighting: 0.9,
        },
        
        // Combo sequence
        combos: [
            { sequence: ['q', 'auto'], condition: 'poke' },
            { sequence: ['e', 'q', 'auto'], condition: 'trade' },
            { sequence: ['r', 'auto', 'q'], condition: 'kite' },
            { sequence: ['e', 't', 'q', 'auto'], condition: 'burst' },
        ],
        
        // Threat assessment
        threatLevel: {
            assassin: 'high',
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
    HeroRegistry.register(HeroVanheo);
}
