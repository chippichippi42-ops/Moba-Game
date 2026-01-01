/**
 * ========================================
 * Combat Analyzer
 * ========================================
 * Analyzes combat situations and potential outcomes
 */

class CombatAnalyzer {
    constructor(controller) {
        this.controller = controller;
        this.combatData = {};
        this.lastCombatAnalysis = 0;
        this.analysisCooldown = 1000; // 1 second cooldown
    }
    
    initialize() {
        // Initialization if needed
    }
    
    update(deltaTime, entities) {
        const now = Date.now();
        if (now - this.lastCombatAnalysis >= this.analysisCooldown) {
            this.analyzeCurrentCombat(entities);
            this.lastCombatAnalysis = now;
        }
    }
    
    analyzeCurrentCombat(entities) {
        const hero = this.controller.hero;
        const enemies = Combat.getEnemiesInRange(hero, 1200);
        const allies = Combat.getAlliesInRange(hero, 1200);
        
        this.combatData = {
            enemies: this.analyzeEnemies(enemies),
            allies: this.analyzeAllies(allies),
            combatScore: this.calculateCombatScore(enemies, allies),
            shouldEngage: this.shouldEngage(enemies, allies),
            shouldRetreat: this.shouldRetreat(enemies, allies),
            killPotential: this.calculateKillPotential(enemies)
        };
    }
    
    analyzeEnemies(enemies) {
        const analysis = {
            count: enemies.length,
            totalDamage: 0,
            totalHealth: 0,
            threatLevel: 0,
            ccCount: 0,
            burstPotential: 0,
            sustainedDamage: 0
        };
        
        for (const enemy of enemies) {
            if (enemy.type === 'hero') {
                analysis.totalDamage += enemy.stats.attackDamage;
                analysis.totalHealth += enemy.health;
                
                // Analyze abilities for CC and burst
                for (const key of ['q', 'e', 'r', 't']) {
                    const ability = enemy.heroData.abilities[key];
                    if (ability && enemy.abilityLevels[key] > 0) {
                        if (ability.effects && ability.effects.includes('stun')) {
                            analysis.ccCount++;
                        }
                        if (ability.baseDamage && ability.baseDamage[0] > 200) {
                            analysis.burstPotential += ability.baseDamage[0];
                        }
                    }
                }
                
                // Calculate threat level
                const threat = this.calculateEnemyThreat(enemy);
                analysis.threatLevel += threat;
                analysis.sustainedDamage += enemy.stats.attackDamage * enemy.stats.attackSpeed;
            }
        }
        
        analysis.averageDamage = analysis.count > 0 ? analysis.totalDamage / analysis.count : 0;
        analysis.averageHealth = analysis.count > 0 ? analysis.totalHealth / analysis.count : 0;
        analysis.averageThreat = analysis.count > 0 ? analysis.threatLevel / analysis.count : 0;
        
        return analysis;
    }
    
    analyzeAllies(allies) {
        const analysis = {
            count: allies.length,
            totalDamage: 0,
            totalHealth: 0,
            healPotential: 0,
            ccPotential: 0,
            burstPotential: 0
        };
        
        for (const ally of allies) {
            if (ally.type === 'hero') {
                analysis.totalDamage += ally.stats.attackDamage;
                analysis.totalHealth += ally.health;
                
                // Analyze abilities
                for (const key of ['q', 'e', 'r', 't']) {
                    const ability = ally.heroData.abilities[key];
                    if (ability && ally.abilityLevels[key] > 0) {
                        if (ability.effects && ability.effects.includes('heal')) {
                            analysis.healPotential += ability.baseDamage[0] || 0;
                        }
                        if (ability.effects && ability.effects.includes('stun')) {
                            analysis.ccPotential++;
                        }
                        if (ability.baseDamage && ability.baseDamage[0] > 200) {
                            analysis.burstPotential += ability.baseDamage[0];
                        }
                    }
                }
            }
        }
        
        analysis.averageDamage = analysis.count > 0 ? analysis.totalDamage / analysis.count : 0;
        analysis.averageHealth = analysis.count > 0 ? analysis.totalHealth / analysis.count : 0;
        
        return analysis;
    }
    
    calculateEnemyThreat(enemy) {
        let threat = 0;
        
        // Base threat from stats
        threat += enemy.stats.attackDamage * 0.5;
        threat += enemy.stats.abilityPower * 0.3;
        threat += (1 - enemy.health / enemy.stats.maxHealth) * 20; // Lower health = less threat
        
        // Role-based threat
        switch (enemy.role) {
            case 'assassin': threat += 40; break;
            case 'mage': threat += 30; break;
            case 'marksman': threat += 25; break;
            case 'fighter': threat += 35; break;
            case 'tank': threat += 20; break;
        }
        
        // Level difference
        const levelDiff = enemy.level - this.controller.hero.level;
        threat += levelDiff * 10;
        
        return threat;
    }
    
    calculateCombatScore(enemies, allies) {
        const enemyScore = this.calculateTeamScore(enemies);
        const allyScore = this.calculateTeamScore(allies);
        
        return allyScore - enemyScore;
    }
    
    calculateTeamScore(team) {
        let score = 0;
        
        for (const member of team) {
            if (member.type === 'hero') {
                // Health and damage contribution
                const healthPercent = member.health / member.stats.maxHealth;
                score += member.stats.attackDamage * healthPercent;
                score += member.stats.abilityPower * healthPercent * 0.7;
                
                // Level contribution
                score += member.level * 50;
                
                // Role bonus
                switch (member.role) {
                    case 'tank': score += 100 * healthPercent; break;
                    case 'assassin': score += 80; break;
                    case 'mage': score += 70; break;
                    case 'marksman': score += 60; break;
                    case 'fighter': score += 90; break;
                }
            }
        }
        
        return score;
    }
    
    shouldEngage(enemies, allies) {
        const combatScore = this.combatData.combatScore;
        const healthPercent = this.controller.hero.health / this.controller.hero.stats.maxHealth;
        
        // Don't engage if we're at a disadvantage or low health
        if (combatScore < -50 || healthPercent < 0.3) {
            return false;
        }
        
        // Engage if we have advantage or can secure a kill
        if (combatScore > 50 || this.combatData.killPotential > 0) {
            return true;
        }
        
        // Random factor based on aggression level
        const aggression = this.controller.getAIParameter('aggressionLevel');
        return Math.random() < aggression;
    }
    
    shouldRetreat(enemies, allies) {
        const combatScore = this.combatData.combatScore;
        const healthPercent = this.controller.hero.health / this.controller.hero.stats.maxHealth;
        
        // Retreat if we're at a significant disadvantage
        if (combatScore < -100) {
            return true;
        }
        
        // Retreat if low health and outnumbered
        if (healthPercent < 0.3 && enemies.length > allies.length) {
            return true;
        }
        
        // Random factor based on risk tolerance
        const riskTolerance = 1 - this.controller.getAIParameter('riskTolerance');
        return Math.random() < riskTolerance;
    }
    
    calculateKillPotential(enemies) {
        const hero = this.controller.hero;
        let potentialKills = 0;
        
        for (const enemy of enemies) {
            if (enemy.type === 'hero') {
                const damageOutput = this.calculateTotalDamageOutput(enemy);
                const enemyHealth = enemy.health;
                
                // Can kill if we can output 120% of their health
                if (damageOutput > enemyHealth * 1.2) {
                    potentialKills++;
                }
            }
        }
        
        return potentialKills;
    }
    
    calculateTotalDamageOutput(target) {
        const hero = this.controller.hero;
        let totalDamage = 0;
        
        // Auto attacks (3 hits)
        totalDamage += hero.stats.attackDamage * 3;
        
        // Abilities
        for (const key of ['q', 'e', 'r', 't']) {
            if (hero.abilityLevels[key] > 0 && hero.abilityCooldowns[key] <= 0) {
                const ability = hero.heroData.abilities[key];
                const level = hero.abilityLevels[key];
                
                let damage = ability.baseDamage[level - 1] || 0;
                damage += (ability.adRatio || 0) * hero.stats.attackDamage;
                damage += (ability.apRatio || 0) * hero.stats.abilityPower;
                
                totalDamage += damage;
            }
        }
        
        return totalDamage;
    }
    
    getCombatData() {
        return this.combatData;
    }
    
    getCombatScore() {
        return this.combatData.combatScore || 0;
    }
    
    shouldFocusTarget(target) {
        if (!target || target.type !== 'hero') return false;
        
        // Focus low health targets
        const healthPercent = target.health / target.stats.maxHealth;
        if (healthPercent < 0.3) return true;
        
        // Focus high threat targets
        const threat = this.calculateEnemyThreat(target);
        if (threat > 150) return true;
        
        // Focus targets we can kill
        const damageOutput = this.calculateTotalDamageOutput(target);
        if (damageOutput > target.health * 1.2) return true;
        
        return false;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatAnalyzer;
}