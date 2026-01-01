/**
 * ========================================
 * Target Selector
 * ========================================
 * Handles intelligent target selection
 */

class TargetSelector {
    constructor() {
        this.lastSelectionTime = 0;
        this.selectionCooldown = 500; // 500ms between target selections
        this.currentTarget = null;
    }
    
    initialize() {
        // Initialization if needed
    }
    
    selectBestTarget(enemies, hero) {
        const now = Date.now();
        if (now - this.lastSelectionTime < this.selectionCooldown && this.currentTarget && this.currentTarget.isAlive) {
            return this.currentTarget;
        }
        
        if (enemies.length === 0) {
            this.currentTarget = null;
            return null;
        }
        
        // Filter valid targets
        const validTargets = enemies.filter(e => e.isAlive && e.type === 'hero');
        
        if (validTargets.length === 0) {
            this.currentTarget = null;
            return null;
        }
        
        // Select best target based on multiple criteria
        const bestTarget = this.evaluateTargets(validTargets, hero);
        
        this.currentTarget = bestTarget;
        this.lastSelectionTime = now;
        
        return bestTarget;
    }
    
    evaluateTargets(targets, hero) {
        const weights = CONFIG.aiTargeting.priorityWeights;
        
        let bestTarget = null;
        let bestScore = -Infinity;
        
        for (const target of targets) {
            const score = this.calculateTargetScore(target, hero, weights);
            
            if (score > bestScore) {
                bestScore = score;
                bestTarget = target;
            }
        }
        
        return bestTarget;
    }
    
    calculateTargetScore(target, hero, weights) {
        let score = 0;

        // Low HP factor
        const healthPercent = target.stats?.maxHealth > 0
            ? target.health / target.stats.maxHealth
            : 1.0;
        score += (1 - healthPercent) * weights.lowHP * 100;

        // Threat factor
        const threat = this.calculateThreatLevel(target, hero);
        score += threat * weights.threat;

        // Distance factor (prefer closer targets)
        const distance = Utils.distance(hero.x, hero.y, target.x, target.y);
        const maxRange = (hero.stats?.attackRange || 100) * 2;
        const distanceScore = 1 - Math.min(distance / maxRange, 1);
        score += distanceScore * weights.distance * 100;

        // Combo synergy factor
        const comboSynergy = this.calculateComboSynergy(target, hero);
        score += comboSynergy * weights.comboSynergy * 100;

        // Last hit factor (if target is low and we can kill)
        const canKill = this.canKillTarget(target, hero);
        score += (canKill ? 1 : 0) * weights.lastHit * 100;

        return score;
    }
    
    calculateThreatLevel(target, hero) {
        const threatFactors = CONFIG.aiTargeting?.threatFactors || {
            damageOutput: 1.0,
            cooldowns: 1.0,
            position: 1.0,
            itemization: 1.0
        };
        let threat = 0;

        // Damage output
        const damageOutput = (target.stats?.attackDamage || 0) + (target.stats?.abilityPower || 0) * 0.5;
        threat += damageOutput * threatFactors.damageOutput;

        // Cooldowns (simplified - check if abilities are ready)
        let cooldownScore = 0;
        for (const key of ['q', 'e', 'r', 't']) {
            const cooldown = target.abilityCooldowns?.[key] || 0;
            const level = target.abilityLevels?.[key] || 0;
            if (cooldown <= 0 && level > 0) {
                cooldownScore += 1;
            }
        }
        threat += cooldownScore * threatFactors.cooldowns * 10;

        // Position (distance to our allies)
        const allies = Combat?.getAlliesInRange?.(hero, 1000) || [];
        const distanceToAllies = allies.length > 0 ?
            Math.min(...allies.map(ally => Utils.distance(target.x, target.y, ally.x, ally.y))) : 1000;
        const positionScore = 1 - Math.min(distanceToAllies / 1000, 1);
        threat += positionScore * threatFactors.position * 100;

        // Itemization (simplified - just use level for now)
        const itemizationScore = (target.level || 1) / 15;
        threat += itemizationScore * threatFactors.itemization * 100;

        return threat;
    }
    
    calculateComboSynergy(target, hero) {
        // Check if our abilities work well against this target
        let synergy = 0;

        // Check if target is low health and we have execute abilities
        const healthPercent = target.stats?.maxHealth > 0
            ? target.health / target.stats.maxHealth
            : 1.0;
        if (healthPercent < 0.3) {
            for (const key of ['q', 'e', 'r', 't']) {
                const ability = hero.heroData?.abilities?.[key];
                const level = hero.abilityLevels?.[key] || 0;
                if (ability && ability.type === 'execute' && level > 0) {
                    synergy += 0.5;
                }
            }
        }

        // Check if target has high armor and we have armor penetration
        if ((target.stats?.armor || 0) > 50) {
            for (const key of ['q', 'e', 'r', 't']) {
                const ability = hero.heroData?.abilities?.[key];
                if (ability && ability.effects && ability.effects.includes('armor_penetration')) {
                    synergy += 0.3;
                }
            }
        }

        // Check if target is magic resistant and we have magic penetration
        if ((target.stats?.magicResist || 0) > 50) {
            for (const key of ['q', 'e', 'r', 't']) {
                const ability = hero.heroData?.abilities?.[key];
                if (ability && ability.effects && ability.effects.includes('magic_penetration')) {
                    synergy += 0.3;
                }
            }
        }

        return Math.min(synergy, 1.0);
    }
    
    canKillTarget(target, hero) {
        // Calculate total damage output
        let totalDamage = (hero.stats?.attackDamage || 0) * 3; // 3 auto attacks

        // Add ability damage
        for (const key of ['q', 'e', 'r', 't']) {
            const cooldown = hero.abilityCooldowns?.[key] || 0;
            const level = hero.abilityLevels?.[key] || 0;
            if (cooldown <= 0 && level > 0) {
                const ability = hero.heroData?.abilities?.[key];
                if (ability) {
                    let damage = ability.baseDamage?.[level - 1] || 0;
                    damage += (ability.adRatio || 0) * (hero.stats?.attackDamage || 0);
                    damage += (ability.apRatio || 0) * (hero.stats?.abilityPower || 0);
                    totalDamage += damage;
                }
            }
        }

        // Check if we can kill (with 20% buffer)
        return totalDamage > (target.health || 0) * 1.2;
    }
    
    // Get current target
    getCurrentTarget() {
        return this.currentTarget;
    }
    
    // Clear current target
    clearTarget() {
        this.currentTarget = null;
    }
    
    // Force set target
    setTarget(target) {
        this.currentTarget = target;
        this.lastSelectionTime = Date.now();
    }
    
    // Update target selection
    update(deltaTime) {
        // Clear target if it's no longer valid
        if (this.currentTarget && (!this.currentTarget.isAlive || this.currentTarget.health <= 0)) {
            this.currentTarget = null;
        }
    }
    
    // Select target based on LLM suggestion
    selectLLMTarget(enemies, hero, llmEngine) {
        // Use LLM to suggest optimal target
        const llmTarget = llmEngine.suggestOptimalTarget(enemies);
        
        if (llmTarget) {
            this.currentTarget = llmTarget;
            this.lastSelectionTime = Date.now();
            return llmTarget;
        }
        
        // Fallback to regular selection
        return this.selectBestTarget(enemies, hero);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TargetSelector;
}