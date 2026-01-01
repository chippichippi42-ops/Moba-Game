/**
 * ========================================
 * Combo Executor
 * ========================================
 * Handles combo execution and ability sequencing
 */

class ComboExecutor {
    constructor() {
        this.lastComboTime = 0;
        this.comboCooldown = 1000; // 1 second between combos
        this.currentCombo = null;
        this.comboStep = 0;
        this.comboTimer = 0;
    }
    
    initialize() {
        // Initialization if needed
    }
    
    executeBestCombo(hero, target, condition) {
        const now = Date.now();
        if (now - this.lastComboTime < this.comboCooldown) return false;

        if (!hero || !hero.heroData) return false;

        // Get available combos from hero data
        const combos = hero.heroData.aiHints?.combos || [];
        
        if (combos.length === 0) {
            // No predefined combos, use basic combo logic
            return this.executeBasicCombo(hero, target);
        }
        
        // Find combo for current condition
        const combo = combos.find(c => c.condition === condition) || combos[0];
        
        if (!combo) return false;
        
        // Check if combo can be executed
        if (this.canExecuteCombo(hero, combo)) {
            this.currentCombo = combo;
            this.comboStep = 0;
            this.comboTimer = now;
            this.lastComboTime = now;
            
            this.executeNextComboStep(hero, target);
            return true;
        }
        
        return false;
    }
    
    canExecuteCombo(hero, combo) {
        // Check mana requirements
        let totalMana = 0;
        
        for (const action of combo.sequence) {
            if (['q', 'e', 'r', 't'].includes(action)) {
                const ability = hero.heroData.abilities[action];
                if (ability && hero.abilityLevels[action] > 0) {
                    const manaCost = ability.manaCost[hero.abilityLevels[action] - 1] || 0;
                    totalMana += manaCost;
                }
            }
        }
        
        if (hero.mana < totalMana) return false;
        
        // Check cooldowns
        for (const action of combo.sequence) {
            if (['q', 'e', 'r', 't'].includes(action)) {
                if (hero.abilityCooldowns[action] > 0) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    executeNextComboStep(hero, target) {
        if (!this.currentCombo || this.comboStep >= this.currentCombo.sequence.length) {
            this.currentCombo = null;
            return false;
        }
        
        const action = this.currentCombo.sequence[this.comboStep];
        
        switch (action) {
            case 'auto':
                hero.basicAttack(target);
                break;
            case 'q':
            case 'e':
            case 'r':
            case 't':
                if (hero.abilityCooldowns[action] <= 0 && hero.abilityLevels[action] > 0) {
                    hero.useAbility(action, target.x, target.y, target);
                }
                break;
        }
        
        this.comboStep++;
        
        // Schedule next step
        if (this.comboStep < this.currentCombo.sequence.length) {
            const delay = CONFIG.aiCombo.comboSequenceDelay;
            setTimeout(() => {
                this.executeNextComboStep(hero, target);
            }, delay);
        } else {
            this.currentCombo = null;
        }
        
        return true;
    }
    
    executeBasicCombo(hero, target) {
        // Simple combo logic: use abilities in priority order
        const priority = CONFIG.aiCombo.skillPriority;
        const abilityKeys = Object.keys(priority).sort((a, b) => priority[b] - priority[a]);
        
        for (const key of abilityKeys) {
            if (hero.abilityCooldowns[key] <= 0 && hero.abilityLevels[key] > 0) {
                const ability = hero.heroData.abilities[key];
                if (ability) {
                    // Check mana
                    const manaCost = ability.manaCost[hero.abilityLevels[key] - 1] || 0;
                    if (hero.mana >= manaCost) {
                        hero.useAbility(key, target.x, target.y, target);
                        this.lastComboTime = Date.now();
                        return true;
                    }
                }
            }
        }
        
        // If no abilities available, just auto attack
        hero.basicAttack(target);
        return true;
    }
    
    // Calculate combo damage
    calculateComboDamage(hero, target, combo) {
        let totalDamage = 0;
        
        for (const action of combo.sequence) {
            if (action === 'auto') {
                totalDamage += hero.stats.attackDamage;
            } else if (['q', 'e', 'r', 't'].includes(action)) {
                const ability = hero.heroData.abilities[action];
                if (ability && hero.abilityLevels[action] > 0) {
                    const level = hero.abilityLevels[action];
                    let damage = ability.baseDamage[level - 1] || 0;
                    damage += (ability.adRatio || 0) * hero.stats.attackDamage;
                    damage += (ability.apRatio || 0) * hero.stats.abilityPower;
                    totalDamage += damage;
                }
            }
        }
        
        return totalDamage;
    }
    
    // Check if combo can kill target
    canComboKillTarget(hero, target, combo) {
        const damage = this.calculateComboDamage(hero, target, combo);
        return damage > target.health * 1.1; // 10% overkill buffer
    }
    
    // Get optimal combo for current situation
    getOptimalCombo(hero, target, situation) {
        const combos = hero.heroData.aiHints?.combos || [];
        
        if (combos.length === 0) return null;
        
        // Find best combo based on situation
        let bestCombo = null;
        let bestScore = -Infinity;
        
        for (const combo of combos) {
            let score = 0;
            
            // Score based on condition match
            if (combo.condition === situation) {
                score += 50;
            }
            
            // Score based on kill potential
            if (this.canComboKillTarget(hero, target, combo)) {
                score += 30;
            }
            
            // Score based on mana efficiency
            const manaCost = this.calculateComboManaCost(hero, combo);
            const manaEfficiency = manaCost > 0 ? this.calculateComboDamage(hero, target, combo) / manaCost : 0;
            score += manaEfficiency * 10;
            
            if (score > bestScore) {
                bestScore = score;
                bestCombo = combo;
            }
        }
        
        return bestCombo;
    }
    
    calculateComboManaCost(hero, combo) {
        let totalMana = 0;
        
        for (const action of combo.sequence) {
            if (['q', 'e', 'r', 't'].includes(action)) {
                const ability = hero.heroData.abilities[action];
                if (ability && hero.abilityLevels[action] > 0) {
                    const manaCost = ability.manaCost[hero.abilityLevels[action] - 1] || 0;
                    totalMana += manaCost;
                }
            }
        }
        
        return totalMana;
    }
    
    // Update combo execution
    update(deltaTime) {
        // Check if we're in the middle of a combo
        if (this.currentCombo) {
            const now = Date.now();
            const comboDuration = now - this.comboTimer;
            
            // Timeout combo if taking too long
            if (comboDuration > 3000) { // 3 second timeout
                this.currentCombo = null;
            }
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComboExecutor;
}