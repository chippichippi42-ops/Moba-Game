/**
 * ========================================
 * MOBA Arena - AI Ability Analyzer
 * ========================================
 * Analyzes hero abilities for smart AI decision making
 */

class AIAbilityAnalyzer {
    constructor() {
        this.abilityCache = new Map();
    }
    
    /**
     * Categorize abilities by type
     */
    categorizeAbilities(hero) {
        if (!hero || !hero.heroData || !hero.heroData.abilities) {
            return new Map();
        }
        
        const cacheKey = hero.heroData.id;
        if (this.abilityCache.has(cacheKey)) {
            return this.abilityCache.get(cacheKey);
        }
        
        const categories = new Map();
        categories.set('CC', []);
        categories.set('Engage', []);
        categories.set('Escape', []);
        categories.set('Burst', []);
        categories.set('Sustain', []);
        categories.set('Mobility', []);
        
        const abilities = hero.heroData.abilities;
        for (const key in abilities) {
            const ability = abilities[key];
            if (ability && ability.abilityType) {
                const type = ability.abilityType;
                if (categories.has(type)) {
                    categories.get(type).push({ key, ability });
                }
            }
        }
        
        this.abilityCache.set(cacheKey, categories);
        return categories;
    }
    
    /**
     * Find best escape skill
     */
    findBestEscapeSkill(hero, situation = {}) {
        if (!hero || !hero.heroData || !hero.heroData.abilities) return null;
        
        const abilities = hero.heroData.abilities;
        let bestSkill = null;
        let bestPriority = 999;
        
        for (const key in abilities) {
            const ability = abilities[key];
            if (!ability) continue;
            
            // Check if it's an escape ability
            if (ability.isEscape || ability.abilityType === 'Escape' || ability.type === 'dash') {
                // Check if ability is available
                if (this.isAbilityCooldownReady(hero, key) && this.hasManaCost(hero, key)) {
                    const priority = ability.abilitypriority || 3;
                    if (priority < bestPriority) {
                        bestPriority = priority;
                        bestSkill = { key, ability };
                    }
                }
            }
        }
        
        return bestSkill;
    }
    
    /**
     * Find best CC skill
     */
    findBestCCSkill(hero, target = null) {
        if (!hero || !hero.heroData || !hero.heroData.abilities) return null;
        
        const abilities = hero.heroData.abilities;
        let bestSkill = null;
        let bestPriority = 999;
        
        for (const key in abilities) {
            const ability = abilities[key];
            if (!ability) continue;
            
            // Check if it's a CC ability
            if (ability.isCC || ability.abilityType === 'CC') {
                // Check if ability is available
                if (this.isAbilityCooldownReady(hero, key) && this.hasManaCost(hero, key)) {
                    const priority = ability.abilitypriority || 3;
                    if (priority < bestPriority) {
                        bestPriority = priority;
                        bestSkill = { key, ability };
                    }
                }
            }
        }
        
        return bestSkill;
    }
    
    /**
     * Find best burst combo
     */
    findBestBurstCombo(hero, target = null) {
        if (!hero || !hero.heroData || !hero.heroData.abilities) return null;
        
        const abilities = hero.heroData.abilities;
        const burstAbilities = [];
        
        for (const key in abilities) {
            const ability = abilities[key];
            if (!ability) continue;
            
            // Check if it's a burst damage ability
            if (ability.abilityType === 'Burst' || (ability.minDamage && ability.minDamage > 50)) {
                // Check if ability is available
                if (this.isAbilityCooldownReady(hero, key) && this.hasManaCost(hero, key)) {
                    const priority = ability.abilitypriority || 3;
                    burstAbilities.push({ key, ability, priority });
                }
            }
        }
        
        // Sort by priority (lower is better)
        burstAbilities.sort((a, b) => a.priority - b.priority);
        
        return burstAbilities.length > 0 ? burstAbilities : null;
    }
    
    /**
     * Find sustain ability
     */
    findSustainAbility(hero) {
        if (!hero || !hero.heroData || !hero.heroData.abilities) return null;
        
        const abilities = hero.heroData.abilities;
        
        for (const key in abilities) {
            const ability = abilities[key];
            if (!ability) continue;
            
            // Check if it's a sustain/heal ability
            if (ability.abilityType === 'Sustain' || ability.isSustain) {
                // Check if ability is available
                if (this.isAbilityCooldownReady(hero, key) && this.hasManaCost(hero, key)) {
                    return { key, ability };
                }
            }
        }
        
        return null;
    }
    
    /**
     * Get abilities by type
     */
    getAbilitiesByType(hero, type) {
        if (!hero || !hero.heroData || !hero.heroData.abilities) return [];
        
        const abilities = hero.heroData.abilities;
        const result = [];
        
        for (const key in abilities) {
            const ability = abilities[key];
            if (ability && ability.abilityType === type) {
                result.push({ key, ability });
            }
        }
        
        return result;
    }
    
    /**
     * Check if abilities can chain
     */
    canChainAbilities(hero, ability1Key, ability2Key) {
        if (!hero || !hero.heroData || !hero.heroData.abilities) return false;
        
        const ability1 = hero.heroData.abilities[ability1Key];
        const ability2 = hero.heroData.abilities[ability2Key];
        
        if (!ability1 || !ability2) return false;
        
        // Check if ability1 has canChain flag
        return ability1.canChain === true || ability2.canChain === true;
    }
    
    /**
     * Check if ability cooldown is ready
     */
    isAbilityCooldownReady(hero, abilityKey) {
        if (!hero) return false;
        
        // Check if hero has ability unlocked
        if (hero.abilityLevels && hero.abilityLevels[abilityKey] <= 0) {
            return false;
        }
        
        // Check cooldown
        if (hero.abilityCooldowns && hero.abilityCooldowns[abilityKey] > 0) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if hero has enough mana for ability
     */
    hasManaCost(hero, abilityKey) {
        if (!hero || !hero.heroData || !hero.heroData.abilities) return false;
        
        const ability = hero.heroData.abilities[abilityKey];
        if (!ability) return false;
        
        const level = hero.abilityLevels ? hero.abilityLevels[abilityKey] : 0;
        if (level <= 0) return false;
        
        const manaCost = ability.manaCost ? ability.manaCost[level - 1] : 0;
        return hero.mana >= manaCost;
    }
    
    /**
     * Get ability priority
     */
    getAbilityPriority(hero, abilityKey) {
        if (!hero || !hero.heroData || !hero.heroData.abilities) return 5;
        
        const ability = hero.heroData.abilities[abilityKey];
        return ability ? (ability.abilitypriority || 3) : 5;
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.abilityCache.clear();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAbilityAnalyzer;
}
