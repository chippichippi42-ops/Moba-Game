/**
 * ========================================
 * HERO: LaLo - Pháp Sư (Mage)
 * ========================================
 * Pháp sư với sát thương phép thuật bùng nổ
 */

const HeroLaLo = {
    id: 'lalo',
    name: 'LaLo',
    role: 'mage',
    attackType: 'ranged',
    difficulty: 3,
    icon: '🔮',
    color: '#8b5cf6',
    
    description: 'Pháp sư bùng nổ với khả năng gây sát thương phép thuật lớn từ xa và kiểm soát chiến trường.',

    // === BASE STATS ===
    baseStats: {
        health: 500,
        mana: 400,
        healthRegen: 4,
        manaRegen: 6,
        attackDamage: 45,
        abilityPower: 70,
        armor: 15,
        magicResist: 30,
        attackSpeed: 0.65,
        attackRange: 500,
        moveSpeed: 330,
        critChance: 0,
        critDamage: 150,
    },

    // === STAT GROWTH PER LEVEL ===
    statGrowth: {
        health: 75,
        mana: 45,
        healthRegen: 0.4,
        manaRegen: 0.5,
        attackDamage: 3,
        abilityPower: 8,
        armor: 2,
        magicResist: 2,
        attackSpeed: 0.01,
        critChance: 0,
    },

    // === PASSIVE ===
    passive: {
        name: 'Tích Tụ Ma Lực',
        description: 'Mỗi kỹ năng trúng tướng địch tăng 8% sức mạnh phép thuật trong 5 giây. Tối đa 3 cộng dồn.',
        icon: '✨',
        maxStacks: 3,
        apBoostPerStack: 0.08,
        duration: 5000,
    },

    // === ABILITIES ===
    abilities: {
        // Q - Cầu Lửa
        q: {
            name: 'Cầu Lửa',
            description: 'Phóng một cầu lửa về phía trước, nổ khi chạm mục tiêu đầu tiên hoặc đạt tầm tối đa.',
            icon: '🔥',
            type: 'skillshot',
            damageType: 'magical',
            baseDamage: [90, 140, 190, 240, 290],
            adRatio: 0,
            apRatio: 0.75,
            manaCost: [60, 65, 70, 75, 80],
            cooldown: [7000, 6500, 6000, 5500, 5000],
            range: 800,
            width: 70,
            speed: 1200,
            explosionRadius: 150,
            maxLevel: 5,

            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] + (hero.stats.abilityPower * this.apRatio);
                const angle = Utils.angleBetweenPoints(hero.x, hero.y, targetX, targetY);
                
                return {
                    type: 'projectile',
                    projectileType: 'explosive',
                    x: hero.x,
                    y: hero.y,
                    angle: angle,
                    speed: this.speed,
                    range: this.range,
                    width: this.width,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#f97316',
                    explosionRadius: this.explosionRadius,
                    onHit: () => hero.addPassiveStack(),
                };
            },
        },

        // E - Vòng Băng
        e: {
            name: 'Vòng Băng',
            description: 'Tạo một vòng băng tại vị trí chỉ định, đóng băng kẻ địch bên trong sau 1 giây.',
            icon: '❄️',
            type: 'area',
            damageType: 'magical',
            baseDamage: [70, 110, 150, 190, 230],
            adRatio: 0,
            apRatio: 0.6,
            manaCost: [80, 85, 90, 95, 100],
            cooldown: [14000, 13000, 12000, 11000, 10000],
            range: 700,
            radius: 200,
            delay: 1000,
            freezeDuration: 1500,
            maxLevel: 5,

            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] + (hero.stats.abilityPower * this.apRatio);
                
                return {
                    type: 'delayed_area',
                    x: targetX,
                    y: targetY,
                    delay: this.delay,
                    radius: this.radius,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#60a5fa',
                    effects: [{
                        type: 'stun',
                        duration: this.freezeDuration,
                    }],
                    onHit: () => hero.addPassiveStack(),
                };
            },
        },

        // R - Dịch Chuyển
        r: {
            name: 'Dịch Chuyển',
            description: 'Dịch chuyển tức thời đến vị trí chỉ định trong tầm.',
            icon: '🌀',
            type: 'blink',
            damageType: 'none',
            baseDamage: [0],
            manaCost: [50, 50, 50, 50, 50],
            cooldown: [16000, 14000, 12000, 10000, 8000],
            range: 400,
            maxLevel: 5,

            execute(hero, targetX, targetY, level) {
                const angle = Utils.angleBetweenPoints(hero.x, hero.y, targetX, targetY);
                const dist = Math.min(Utils.distance(hero.x, hero.y, targetX, targetY), this.range);
                
                return {
                    type: 'blink',
                    targetX: hero.x + Math.cos(angle) * dist,
                    targetY: hero.y + Math.sin(angle) * dist,
                    owner: hero,
                    color: '#a855f7',
                };
            },
        },

        // T - Ultimate: Thiên Thạch
        t: {
            name: 'Thiên Thạch',
            description: 'Triệu hồi một thiên thạch khổng lồ rơi xuống sau 1.5 giây, gây sát thương cực lớn và làm choáng kẻ địch trong vùng.',
            icon: '☄️',
            type: 'area',
            damageType: 'magical',
            baseDamage: [300, 450, 600],
            adRatio: 0,
            apRatio: 1.0,
            manaCost: [120, 150, 180],
            cooldown: [100000, 85000, 70000],
            range: 900,
            radius: 350,
            delay: 1500,
            stunDuration: 1500,
            maxLevel: 3,

            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] + (hero.stats.abilityPower * this.apRatio);
                
                return {
                    type: 'delayed_area',
                    x: targetX,
                    y: targetY,
                    delay: this.delay,
                    radius: this.radius,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#dc2626',
                    effects: [{
                        type: 'stun',
                        duration: this.stunDuration,
                    }],
                    onHit: () => hero.addPassiveStack(),
                    showWarning: true,
                    animation: 'meteor',
                };
            },
        },
    },

    // === BASIC ATTACK ===
    basicAttack: {
        type: 'ranged',
        projectileSpeed: 1500,
        projectileColor: '#a855f7',

        execute(hero, target) {
            const damage = hero.stats.attackDamage + (hero.stats.abilityPower * 0.2);
            
            return {
                type: 'projectile',
                x: hero.x,
                y: hero.y,
                target: target,
                speed: this.projectileSpeed,
                damage: damage,
                damageType: 'magical',
                owner: hero,
                color: this.projectileColor,
            };
        },
    },

    // === AI HINTS ===
    aiHints: {
        preferredLane: 'mid',
        playstyle: 'burst',
        powerSpike: 'mid',
        teamfightRole: 'backline_burst',
        
        priorities: {
            farming: 0.7,
            trading: 0.7,
            objectives: 0.6,
            teamfighting: 0.9,
        },
        
        combos: [
            { sequence: ['q'], condition: 'poke' },
            { sequence: ['e', 'q'], condition: 'trade' },
            { sequence: ['r', 'e', 'q'], condition: 'engage' },
            { sequence: ['t', 'e', 'q', 'auto'], condition: 'all_in' },
        ],
        
        threatLevel: {
            assassin: 'high',
            fighter: 'medium',
            mage: 'medium',
            marksman: 'medium',
            tank: 'low',
            support: 'low',
        },
    },
};

// Register hero
if (typeof HeroRegistry !== 'undefined') {
    HeroRegistry.register(HeroLaLo);
}
