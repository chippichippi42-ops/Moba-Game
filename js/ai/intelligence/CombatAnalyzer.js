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
        this.abilityAnalyzer = new AIAbilityAnalyzer();
        this.lastAbilityUseTime = 0;
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
        
        // Base threat from stats with safe access
        const enemyAD = enemy.stats?.attackDamage || 50;
        const enemyAP = enemy.stats?.abilityPower || 0;
        const enemyMaxHealth = enemy.stats?.maxHealth || enemy.health || 100;
        
        threat += enemyAD * 0.5;
        threat += enemyAP * 0.3;
        threat += (1 - (enemy.health || 0) / enemyMaxHealth) * 20; // Lower health = less threat
        
        // Role-based threat
        switch (enemy.role) {
            case 'assassin': threat += 40; break;
            case 'mage': threat += 30; break;
            case 'marksman': threat += 25; break;
            case 'fighter': threat += 35; break;
            case 'tank': threat += 20; break;
        }
        
        // Level difference
        const levelDiff = (enemy.level || 1) - (this.controller.hero.level || 1);
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
                const memberMaxHealth = member.stats?.maxHealth || member.health || 100;
                const healthPercent = (member.health || 0) / memberMaxHealth;
                const memberAD = member.stats?.attackDamage || 50;
                const memberAP = member.stats?.abilityPower || 0;
                
                score += memberAD * healthPercent;
                score += memberAP * healthPercent * 0.7;
                
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
        const hero = this.controller.hero;
        const maxHealth = hero.stats?.maxHealth || hero.health || 100;
        const healthPercent = (hero.health || 0) / maxHealth;
        
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
        const hero = this.controller.hero;
        const maxHealth = hero.stats?.maxHealth || hero.health || 100;
        const healthPercent = (hero.health || 0) / maxHealth;
        
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
        const targetMaxHealth = target.stats?.maxHealth || target.health || 100;
        const healthPercent = (target.health || 0) / targetMaxHealth;
        if (healthPercent < 0.3) return true;

        // Focus high threat targets
        const threat = this.calculateEnemyThreat(target);
        if (threat > 150) return true;

        // Focus targets we can kill
        const damageOutput = this.calculateTotalDamageOutput(target);
        if (damageOutput > target.health * 1.2) return true;

        return false;
    }

    // ===== AI SKILL USAGE PATTERNS =====

    /**
     * Pattern 1: ESCAPE - When HP is low and being chased
     */
    analyzeEscapePattern(hero, enemies) {
        const difficulty = this.controller.difficulty;
        const mods = CONFIG.aiDifficultyMods[difficulty];
        if (!mods) return null;

        const heroMaxHealth = hero.stats?.maxHealth || hero.health || 100;
        const healthPercent = (hero.health || 0) / heroMaxHealth;

        // Check if HP is below threshold
        if (healthPercent < mods.escapeHPThreshold) {
            // Check if being chased (enemies close)
            const nearbyEnemies = enemies.filter(e => {
                const dist = Utils.distance(hero.x, hero.y, e.x, e.y);
                return dist < 800 && dist > 200; // Chasing distance
            });

            if (nearbyEnemies.length > 0) {
                // Find best escape skill
                const situation = {
                    hp: healthPercent,
                    maxHp: heroMaxHealth,
                    nearbyEnemies: nearbyEnemies.length,
                    distance: 400
                };

                const escapeSkill = this.abilityAnalyzer.findBestEscapeSkill(hero, situation);
                return { pattern: 'ESCAPE', skill: escapeSkill, priority: 5 };
            }
        }

        return null;
    }

    /**
     * Pattern 2: CC (Crowd Control) - When enemy close or running away
     */
    analyzeCCPattern(hero, enemies) {
        const difficulty = this.controller.difficulty;
        const mods = CONFIG.aiDifficultyMods[difficulty];
        if (!mods) return null;

        // Check if should use CC based on frequency
        if (Math.random() > mods.useCCFrequency) return null;

        // Find targets for CC
        for (const enemy of enemies) {
            const dist = Utils.distance(hero.x, hero.y, enemy.x, enemy.y);

            // CC when enemy is close or running away
            if (dist < 600 || (dist < 800 && this.isEnemyRunningAway(hero, enemy))) {
                const ccSkill = this.abilityAnalyzer.findBestCCSkill(hero, enemy);
                if (ccSkill) {
                    return { pattern: 'CC', skill: ccSkill, target: enemy, priority: 3 };
                }
            }
        }

        return null;
    }

    /**
     * Pattern 3: BURST - When target HP is low
     */
    analyzeBurstPattern(hero, enemies) {
        const difficulty = this.controller.difficulty;
        const mods = CONFIG.aiDifficultyMods[difficulty];
        if (!mods) return null;

        // Find vulnerable targets
        for (const enemy of enemies) {
            if (enemy.type !== 'hero') continue;

            const enemyMaxHealth = enemy.stats?.maxHealth || enemy.health || 100;
            const healthPercent = (enemy.health || 0) / enemyMaxHealth;

            // Check if enemy HP is below threshold
            if (healthPercent < mods.burstThreshold) {
                const dist = Utils.distance(hero.x, hero.y, enemy.x, enemy.y);
                if (dist < 800) {
                    const burstCombo = this.abilityAnalyzer.findBestBurstCombo(hero, enemy);
                    if (burstCombo && burstCombo.length > 0) {
                        return { pattern: 'BURST', skills: burstCombo, target: enemy, priority: 4 };
                    }
                }
            }
        }

        return null;
    }

    /**
     * Pattern 4: SUSTAIN - When hero HP drops below 60% in fight
     */
    analyzeSustainPattern(hero, enemies) {
        const difficulty = this.controller.difficulty;
        const mods = CONFIG.aiDifficultyMods[difficulty];
        if (!mods) return null;

        const heroMaxHealth = hero.stats?.maxHealth || hero.health || 100;
        const healthPercent = (hero.health || 0) / heroMaxHealth;

        // Check if in fight and HP is low
        const inCombat = enemies.filter(e => {
            const dist = Utils.distance(hero.x, hero.y, e.x, e.y);
            return dist < 600;
        }).length > 0;

        if (inCombat && healthPercent < mods.sustainThreshold) {
            // Use sustain abilities based on difficulty
            const sustainCheck = Math.random();
            const shouldUseSustain = {
                easy: sustainCheck < 0.3,
                normal: sustainCheck < 0.5,
                hard: sustainCheck < 0.7,
                nightmare: sustainCheck < 0.9
            };

            if (shouldUseSustain[difficulty]) {
                const sustainAbility = this.abilityAnalyzer.findSustainAbility(hero);
                if (sustainAbility) {
                    return { pattern: 'SUSTAIN', skill: sustainAbility, priority: 2 };
                }
            }
        }

        return null;
    }

    /**
     * Pattern 5: POSITIONING - Use mobility skills in teamfight
     */
    analyzePositioningPattern(hero, enemies, allies) {
        const difficulty = this.controller.difficulty;

        // Only Hard+ uses positioning
        if (difficulty !== 'hard' && difficulty !== 'veryhard' && difficulty !== 'nightmare') {
            return null;
        }

        // Check if in teamfight
        const nearbyEnemies = enemies.filter(e => {
            const dist = Utils.distance(hero.x, hero.y, e.x, e.y);
            return dist < 1200;
        });

        const nearbyAllies = allies.filter(a => {
            const dist = Utils.distance(hero.x, hero.y, a.x, a.y);
            return dist < 1200;
        });

        // Teamfight condition
        if (nearbyEnemies.length >= 3 && nearbyAllies.length >= 2) {
            // Check if not in ideal position (too far from allies or too close to enemies)
            const avgAllyDist = nearbyAllies.reduce((sum, ally) => {
                return sum + Utils.distance(hero.x, hero.y, ally.x, ally.y);
            }, 0) / nearbyAllies.length;

            const avgEnemyDist = nearbyEnemies.reduce((sum, enemy) => {
                return sum + Utils.distance(hero.x, hero.y, enemy.x, enemy.y);
            }, 0) / nearbyEnemies.length;

            // Not ideal: too close to enemies or too far from allies
            if (avgEnemyDist < 400 || avgAllyDist > 600) {
                // Use mobility skills to reposition
                const mobilitySkills = this.abilityAnalyzer.getAbilitiesByType(hero, 'Mobility');
                const mobilitySkillsEsc = this.abilityAnalyzer.getAbilitiesByType(hero, 'Escape');

                const allMobility = [...mobilitySkills, ...mobilitySkillsEsc];

                for (const skillObj of allMobility) {
                    if (this.abilityAnalyzer.isAbilityCooldownReady(hero, skillObj.key)) {
                        return { pattern: 'POSITIONING', skill: skillObj, priority: 3 };
                    }
                }
            }
        }

        return null;
    }

    /**
     * Pattern 6: ENGAGE - Use engage/dash abilities
     */
    analyzeEngagePattern(hero, enemies) {
        const difficulty = this.controller.difficulty;

        // Find engage targets
        for (const enemy of enemies) {
            const dist = Utils.distance(hero.x, hero.y, enemy.x, enemy.y);

            // Target in range but not engaged
            if (dist > 400 && dist < 900) {
                // Check if not already in combat
                if (!this.isAlreadyEngaged(hero, enemy)) {
                    // Use engage abilities
                    const engageSkills = this.abilityAnalyzer.getAbilitiesByType(hero, 'Engage');
                    for (const skillObj of engageSkills) {
                        if (this.abilityAnalyzer.isAbilityCooldownReady(hero, skillObj.key)) {
                            return { pattern: 'ENGAGE', skill: skillObj, target: enemy, priority: 2 };
                        }
                    }

                    // Also check dash abilities
                    const mobilitySkills = this.abilityAnalyzer.getAbilitiesByType(hero, 'Mobility');
                    for (const skillObj of mobilitySkills) {
                        const ability = skillObj.ability;
                        if (ability && (ability.type === 'dash' || ability.isDash)) {
                            if (this.abilityAnalyzer.isAbilityCooldownReady(hero, skillObj.key)) {
                                return { pattern: 'ENGAGE', skill: skillObj, target: enemy, priority: 2 };
                            }
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * Run all skill usage patterns and return best action
     */
    analyzeSkillUsagePatterns(hero, enemies, allies) {
        const patterns = [];

        // Analyze all patterns
        patterns.push(this.analyzeEscapePattern(hero, enemies));
        patterns.push(this.analyzeCCPattern(hero, enemies));
        patterns.push(this.analyzeBurstPattern(hero, enemies));
        patterns.push(this.analyzeSustainPattern(hero, enemies));
        patterns.push(this.analyzePositioningPattern(hero, enemies, allies));
        patterns.push(this.analyzeEngagePattern(hero, enemies));

        // Filter null patterns and sort by priority
        const validPatterns = patterns.filter(p => p !== null);
        validPatterns.sort((a, b) => (b.priority || 0) - (a.priority || 0));

        return validPatterns.length > 0 ? validPatterns[0] : null;
    }

    /**
     * Check if enemy is running away (moving away from hero)
     */
    isEnemyRunningAway(hero, enemy) {
        const dx = enemy.x - hero.x;
        const dy = enemy.y - hero.y;

        // Enemy velocity
        const enemyVx = enemy.vx || 0;
        const enemyVy = enemy.vy || 0;

        // Dot product to check if moving away
        const dotProduct = dx * enemyVx + dy * enemyVy;
        return dotProduct > 0;
    }

    /**
     * Check if already engaged with target
     */
    isAlreadyEngaged(hero, enemy) {
        const dist = Utils.distance(hero.x, hero.y, enemy.x, enemy.y);
        return dist < 400; // Already close
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatAnalyzer;
}