/**
 * ========================================
 * HERO: Balametany - Sát Thủ (Assassin)
 * ========================================
 * Sát thủ cơ động với khả năng tiêu diệt mục tiêu nhanh chóng
 */

const HeroBalametany = {
    id: 'balametany',
    name: 'Balametany',
    role: 'assassin',
    attackType: 'melee',
    difficulty: 4,
    icon: '🗡️',
    color: '#6366f1',
    
    description: 'Sát thủ cực kỳ cơ động với khả năng xâm nhập và tiêu diệt mục tiêu ưu tiên trong nháy mắt.',

    // === BASE STATS ===
    baseStats: {
        health: 520,
        mana: 280,
        healthRegen: 6,
        manaRegen: 5,
        attackDamage: 65,
        abilityPower: 0,
        armor: 22,
        magicResist: 26,
        attackSpeed: 0.8,
        attackRange: 150,
        moveSpeed: 370,
        critChance: 5,
        critDamage: 175,
    },

    // === STAT GROWTH PER LEVEL ===
    statGrowth: {
        health: 80,
        mana: 30,
        healthRegen: 0.6,
        manaRegen: 0.4,
        attackDamage: 7,
        abilityPower: 0,
        armor: 3,
        magicResist: 2,
        attackSpeed: 0.035,
        critChance: 2,
    },

    // === PASSIVE ===
    passive: {
        name: 'Bóng Tối',
        description: 'Tấn công từ phía sau gây thêm 15% sát thương. Mỗi lần hạ gục kẻ địch, reset hồi chiêu kỹ năng E.',
        icon: '🌑',
        backStabBonus: 0.15,
        backStabAngle: 90, // degrees
        resetOnKill: 'e',
    },

    // === ABILITIES ===
    abilities: {
        // Q - Phi Tiêu
        q: {
            name: 'Phi Tiêu',
            description: 'Ném một phi tiêu gây sát thương và đánh dấu mục tiêu. Đánh dấu làm tăng sát thương đòn đánh tiếp theo.',
            icon: 'assets/icons/balametany_q.png',
            type: 'skillshot',
            damageType: 'physical',
            baseDamage: [50, 85, 120, 155, 190],
            adRatio: 0.6,
            apRatio: 0,
            manaCost: [40, 45, 50, 55, 60],
            cooldown: [6000, 5500, 5000, 4500, 4000],
            range: 700,
            width: 50,
            speed: 1800,
            markDuration: 4000,
            markBonusDamage: 0.2, // 20% bonus damage
            maxLevel: 5,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'Burst',
            priority: 3,
            minDamage: 80,
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
                    x: hero.x,
                    y: hero.y,
                    angle: angle,
                    speed: this.speed,
                    range: this.range,
                    width: this.width,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#6366f1',
                    onHit: (target) => {
                        // Kiểm tra target có method addDebuff không
                        if (target && typeof target.addDebuff === 'function') {
                            target.addDebuff({
                                type: 'mark',
                                source: hero,
                                duration: this.markDuration,
                                bonusDamage: this.markBonusDamage,
                            });
                        }
                    },
                };
            },
        },

        // E - Lướt Bóng
        e: {
            name: 'Lướt Bóng',
            description: 'Lướt đến vị trí chỉ định, kẻ địch trên đường đi chịu sát thương.',
            icon: 'assets/icons/balametany_e.png',
            type: 'dash',
            damageType: 'physical',
            baseDamage: [40, 70, 100, 130, 160],
            adRatio: 0.5,
            apRatio: 0,
            manaCost: [35, 35, 35, 35, 35],
            cooldown: [10000, 9000, 8000, 7000, 6000],
            dashDistance: 450,
            maxLevel: 5,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'Mobility',
            priority: 2,
            minDamage: 70,
            isEscape: true,
            isCC: false,
            canChain: true,
            isSustain: false,
            isEngage: true,

            execute(hero, targetX, targetY, level) {
                const damage = this.baseDamage[level - 1] + (hero.stats.attackDamage * this.adRatio);
                const angle = Utils.angleBetweenPoints(hero.x, hero.y, targetX, targetY);
                const dist = Math.min(Utils.distance(hero.x, hero.y, targetX, targetY), this.dashDistance);
                
                return {
                    type: 'dash_through',
                    dashX: hero.x + Math.cos(angle) * dist,
                    dashY: hero.y + Math.sin(angle) * dist,
                    damage: damage,
                    damageType: this.damageType,
                    owner: hero,
                    color: '#6366f1',
                    width: 100,
                };
            },
        },

        // R - Tàng Hình
        r: {
            name: 'Tàng Hình',
            description: 'Trở nên tàng hình trong 3 giây và tăng tốc độ di chuyển. Tấn công hoặc dùng kỹ năng sẽ hủy tàng hình.',
            icon: 'assets/icons/balametany_r.png',
            type: 'self_buff',
            damageType: 'none',
            manaCost: [60, 60, 60, 60, 60],
            cooldown: [18000, 16000, 14000, 12000, 10000],
            duration: 3000,
            speedBoost: 0.3, // 30%
            maxLevel: 5,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'Escape',
            priority: 4,
            minDamage: 0,
            isEscape: true,
            isCC: false,
            canChain: true,
            isSustain: false,
            isEngage: true,

            execute(hero, targetX, targetY, level) {
                return {
                    type: 'self_buff',
                    owner: hero,
                    duration: this.duration,
                    effects: {
                        invisible: true,
                        speedBoost: this.speedBoost,
                    },
                    breakOnAction: true,
                    color: '#6366f1',
                };
            },
        },

        // T - Ultimate: Ám Sát
        t: {
            name: 'Ám Sát',
            description: 'Nhảy đến mục tiêu tướng địch và thực hiện một đòn đánh chí mạng. Nếu hạ gục mục tiêu, có thể sử dụng lại trong 5 giây.',
            icon: 'assets/icons/balametany_t.png',
            type: 'targeted',
            damageType: 'physical',
            baseDamage: [200, 300, 400],
            adRatio: 1.2,
            apRatio: 0,
            manaCost: [80, 100, 120],
            cooldown: [70000, 60000, 50000],
            range: 600,
            guaranteedCrit: true,
            resetWindow: 5000,
            maxLevel: 3,

            // NEW FIELDS FOR AI SYSTEM
            abilityType: 'Burst',
            priority: 1,
            minDamage: 250,
            isEscape: false,
            isCC: false,
            canChain: true,
            isSustain: false,
            isEngage: true,

            execute(hero, target, level) {
                if (!target || target.type !== 'hero' || target.team === hero.team) {
                    return null;
                }
                
                const damage = this.baseDamage[level - 1] + (hero.stats.attackDamage * this.adRatio);
                
                return {
                    type: 'targeted_dash',
                    target: target,
                    damage: damage * (hero.stats.critDamage / 100),
                    damageType: this.damageType,
                    owner: hero,
                    color: '#dc2626',
                    guaranteedCrit: true,
                    onKill: () => {
                        // Reset ultimate cooldown for recast
                        hero.abilities.t.remainingCooldown = 0;
                        hero.ultimateResetTimer = this.resetWindow;
                    },
                };
            },
        },
    },

    // === BASIC ATTACK ===
    basicAttack: {
        type: 'melee',

        execute(hero, target) {
            let damage = hero.stats.attackDamage;
            
            // Check backstab
            const angleToTarget = Utils.angleBetween(hero, target);
            const targetFacing = target.facingAngle || 0;
            const angleDiff = Math.abs(Utils.radToDeg(angleToTarget - targetFacing));
            
            if (angleDiff > 90 && angleDiff < 270) {
                damage *= (1 + hero.heroData.passive.backStabBonus);
            }
            
            // Check mark
            const mark = target.debuffs?.find(d => d.type === 'mark' && d.source === hero);
            if (mark) {
                damage *= (1 + mark.bonusDamage);
                target.removeDebuff(mark);
            }
            
            return {
                type: 'melee_attack',
                target: target,
                damage: damage,
                damageType: 'physical',
                owner: hero,
                color: '#6366f1',
            };
        },
    },

    // === AI HINTS ===
    aiHints: {
        preferredLane: 'jungle',
        playstyle: 'burst_assassin',
        powerSpike: 'mid',
        teamfightRole: 'flanker',
        
        priorities: {
            farming: 0.6,
            trading: 0.4,
            objectives: 0.5,
            teamfighting: 0.7,
            assassination: 0.95,
        },
        
        combos: [
            { sequence: ['q', 'e', 'auto'], condition: 'poke' },
            { sequence: ['r', 'e', 'q', 'auto'], condition: 'engage' },
            { sequence: ['e', 't', 'q', 'auto', 'e'], condition: 'all_in' },
        ],
        
        threatLevel: {
            assassin: 'medium',
            fighter: 'medium',
            mage: 'low',
            marksman: 'low',
            tank: 'high',
            support: 'medium',
        },
        
        targetPriority: ['marksman', 'mage', 'support', 'assassin', 'fighter', 'tank'],
    },
};

// Register hero
if (typeof HeroRegistry !== 'undefined') {
    HeroRegistry.register(HeroBalametany);
}
