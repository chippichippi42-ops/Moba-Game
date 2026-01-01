/**
 * ========================================
 * Advanced Smart Evaluator
 * ========================================
 * Multi-layered evaluation system for MOBA AI decision-making.
 */

class AdvancedSmartEvaluator {
    constructor(controller) {
        this.controller = controller;
        this.baseWeights = {
            survival: 0.30,
            combat: 0.25,
            resource: 0.15,
            objective: 0.12,
            position: 0.12,
            team: 0.10,
            skills: 0.08,
            rotation: 0.10,
            momentum: 0.08,
            predictive: 0.10
        };
    }

    /**
     * Main analysis method
     * Integrates all 10 layers with dynamic weighting and confidence scoring.
     * @param {Object} heroState - Current state of the hero
     * @param {Object} gameState - Global game state information
     * @param {Object} teamState - Allied team state summary
     * @param {Object} context - Optional additional context
     * @returns {Object} Full evaluation results
     */
    analyze(heroState, gameState, teamState, context = {}) {
        // Log start of evaluation if debug is enabled
        if (typeof AI_CONFIG !== 'undefined' && AI_CONFIG.external_ai.debug) {
            console.log(`[AdvancedSmartEvaluator] Analyzing state for ${heroState.name}`);
        }

        const scores = {
            survival: this.survivalLayer(heroState, gameState),
            combat: this.combatPressureLayer(heroState, gameState),
            resource: this.resourceManagementLayer(heroState, gameState),
            objective: this.objectiveControlLayer(heroState, gameState),
            position: this.positionAdvantageLayer(heroState, gameState),
            team: this.teamCoordinationLayer(heroState, gameState, teamState),
            skills: this.skillComboReadinessLayer(heroState, gameState),
            rotation: this.rotationTimingLayer(heroState, gameState),
            momentum: this.momentumSentimentLayer(heroState, gameState),
            predictive: this.predictiveAnalysisLayer(heroState, gameState)
        };

        const weights = this.calculateDynamicWeights(scores, heroState, gameState);
        
        let totalScore = 0;
        let totalWeight = 0;
        for (const layer in scores) {
            totalScore += scores[layer] * weights[layer];
            totalWeight += weights[layer];
        }

        const finalScore = Math.min(100, (totalScore / totalWeight));
        const mode = this.determineDecisionMode(finalScore, heroState);
        const confidence = this.calculateConfidence(scores);
        const rationale = this.generateRationale(scores);

        const evaluation = {
            score: finalScore,
            mode: mode,
            scores: scores,
            weights: weights,
            confidence: confidence,
            rationale: rationale,
            timestamp: Date.now(),
            heroId: heroState.id
        };

        // Post-processing and sanity checks
        return this.postProcessEvaluation(evaluation, heroState, gameState);
    }

    /**
     * Additional processing after primary evaluation
     */
    postProcessEvaluation(evaluation, heroState, gameState) {
        // Enforce EXTREME_URGENT if death is imminent regardless of score
        if (heroState.deathProbability > 0.9 || (heroState.healthPercent < 10 && (gameState.nearbyEnemies || []).length > 0)) {
            evaluation.mode = 'EXTREME_URGENT';
            evaluation.score = Math.max(evaluation.score, 90);
        }

        return evaluation;
    }

    /**
     * Layer 1: SURVIVAL ANALYSIS (30% weight)
     * Evaluates immediate risk to hero life.
     */
    survivalLayer(heroState, gameState) {
        let score = 0;
        const hpPercent = heroState.healthPercent;

        // Health state scoring based on critical thresholds
        if (hpPercent < 15) {
            score += 45; // Critical state
        } else if (hpPercent < 25) {
            score += 30; // Danger state
        } else if (hpPercent < 40) {
            score += 15; // Warning state
        }

        // Incoming damage prediction
        // Simulates expected damage over the next 2 seconds
        const nearbyEnemies = gameState.nearbyEnemies || [];
        let predictedDamage = 0;
        nearbyEnemies.forEach(enemy => {
            if (enemy.distance < 500) {
                // Approximate damage from enemies within range
                predictedDamage += (enemy.attackDamage || 50) * 2;
            }
        });
        
        if (predictedDamage > heroState.health) {
            score += 30; // Lethal damage incoming
        }

        // Escape route analysis
        // Checks if movement is restricted or no allies are nearby
        if (!heroState.hasEscapeRoute) {
            score += 25;
        }

        // CC vulnerability check
        // Checks if the hero can be easily disabled
        if (heroState.isCCVulnerable) {
            score += 20;
        }

        return Math.min(100, score);
    }

    /**
     * Layer 2: COMBAT PRESSURE (25% weight)
     * Evaluates the intensity of current or potential engagement.
     */
    combatPressureLayer(heroState, gameState) {
        let score = 0;
        const nearbyEnemies = gameState.nearbyEnemies || [];
        const nearbyAllies = gameState.nearbyAllies || [];

        // Enemy density calculation - more enemies = higher pressure
        if (nearbyEnemies.length >= 4) {
            score += 40;
        } else if (nearbyEnemies.length >= 3) {
            score += 30;
        } else if (nearbyEnemies.length >= 2) {
            score += 15;
        }

        // Ally support assessment
        // Higher pressure if outnumbered
        if (nearbyEnemies.length > nearbyAllies.length + 1) {
            score += 25;
        }
        if (nearbyAllies.length === 0 && nearbyEnemies.length > 0) {
            score += 20;
        }

        // CC threat count
        // Counts enemies with potential crowd control abilities
        let ccThreats = nearbyEnemies.filter(e => e.hasCC).length;
        score += ccThreats * 10;

        // Cooldown vulnerability
        // Higher pressure if primary skills are on cooldown
        if (heroState.abilities.q && !heroState.abilities.q.ready && 
            heroState.abilities.e && !heroState.abilities.e.ready) {
            score += 20;
        }

        return Math.min(100, score);
    }

    /**
     * Layer 3: RESOURCE MANAGEMENT (15% weight)
     */
    resourceManagementLayer(heroState, gameState) {
        let score = 0;
        const manaPercent = (heroState.mana / heroState.maxMana) * 100;

        // Mana percentage critical check
        if (manaPercent < 15 && (gameState.nearbyEnemies || []).length > 0) score += 20;
        else if (manaPercent < 30) score += 10;

        // Item cooldown status
        if (heroState.importantItemsOnCooldown) score += 15;

        // Gold threshold for backing
        if (heroState.gold > 1500 && !heroState.inCombat) score -= 10;

        // Buff window status
        if (heroState.hasBuff) score -= 5;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Layer 4: OBJECTIVE CONTROL (12% weight)
     */
    objectiveControlLayer(heroState, gameState) {
        let score = 0;
        
        // Tower under attack detection
        if (gameState.towerUnderAttackNearby) score += 20;

        // Dragon/jungle objective threat
        if (gameState.objectiveThreat) score += 25;

        // Minion wave state analysis
        if (gameState.minionWavePushedIn) score += 15;

        // Wave freeze detection
        if (gameState.waveFrozen) score -= 5;

        return Math.min(100, score);
    }

    /**
     * Layer 5: POSITION ADVANTAGE (12% weight)
     */
    positionAdvantageLayer(heroState, gameState) {
        let score = 0;

        // High ground analysis
        if (heroState.onLowGround && (gameState.nearbyEnemies || []).some(e => e.onHighGround)) {
            score += 15;
        }

        // Vision control check
        if (gameState.inUnvardedArea) score += 20;

        // Kiting space calculation
        if (heroState.restrictedMovement) score += 15;

        // Wall proximity assessment
        if (heroState.nearWall && (gameState.nearbyEnemies || []).some(e => e.hasWallStun)) {
            score += 15;
        }

        return Math.min(100, score);
    }

    /**
     * Layer 6: TEAM COORDINATION (10% weight)
     */
    teamCoordinationLayer(heroState, gameState, teamState) {
        let score = 0;

        // Team fight detection
        if (gameState.teamFightActive && (gameState.nearbyAllies || []).length === 0) {
            score += 40;
        }

        // Ally nearby count and HP
        const weakAllies = (gameState.nearbyAllies || []).filter(a => a.healthPercent < 30);
        score += weakAllies.length * 20;

        // Teammate critical threat
        if (gameState.teammateCritical) score += 20;

        // Average team HP threshold
        if (teamState.averageHP < 40) score += 15;

        return Math.min(100, score);
    }

    /**
     * Layer 7: SKILL COMBO READINESS (8% weight)
     */
    skillComboReadinessLayer(heroState, gameState) {
        let score = 0;

        // All combo skills ready check
        const allReady = heroState.abilities.q.ready && heroState.abilities.e.ready && heroState.abilities.r.ready;
        if (allReady && (gameState.nearbyEnemies || []).length > 0) {
            score -= 20; // Ready to GO!
        }

        // Ultimate impact assessment
        if (!heroState.abilities.r.ready && (gameState.nearbyEnemies || []).length >= 3) {
            score += 15;
        }

        // Mana for combo verification
        if (!heroState.hasManaForCombo) score += 12;

        // Cooldown urgency calculation
        if (!heroState.abilities.e.ready && (gameState.nearbyEnemies || []).length > 0) {
            score += 20; // No escape skill
        }

        return Math.min(100, score);
    }

    /**
     * Layer 8: ROTATION & TIMING (10% weight)
     */
    rotationTimingLayer(heroState, gameState) {
        let score = 0;

        // Time since last base (simulated)
        if (heroState.timeSinceBase > 180) score += 10;

        // Enemy missing duration (gank detection)
        if (gameState.enemyMissingDuration > 15) score += 30;
        else if (gameState.enemyMissingDuration > 8) score += 18;

        // Rotation window availability
        if (gameState.goodRotationWindow) score -= 12;

        // Minion wave state
        if (gameState.wavePushing) score -= 5;
        if (gameState.waveFrozen) score += 5;

        return Math.min(100, score);
    }

    /**
     * Layer 9: MOMENTUM & SENTIMENT (8% weight)
     */
    momentumSentimentLayer(heroState, gameState) {
        let score = 0;

        // Personal kill/death streak
        if (heroState.killStreak >= 3) score -= 15;
        if (heroState.deathStreak >= 2) score += 20;

        // Team momentum calculation
        if (gameState.teamMomentum > 0) score -= 10;
        else if (gameState.teamMomentum < 0) score += 10;

        // Gold differential analysis
        if (gameState.goldDifferential < -2000) score += 15;

        return Math.min(100, score);
    }

    /**
     * Layer 10: PREDICTIVE ANALYSIS (10% weight)
     * Advanced layer that looks ahead at potential future states.
     */
    predictiveAnalysisLayer(heroState, gameState) {
        let score = 0;

        // Incoming CC chain prediction (3s window)
        // High urgency if a lockdown chain is likely
        if (gameState.incomingCCChain) {
            score += 40;
        }

        // Enemy rotation prediction
        // Detects hidden enemies likely moving towards current position
        if (gameState.predictedEnemyGank) {
            score += 30;
        }

        // Objective threat prediction
        // Anticipates enemy contest on key objectives like Dragon/Ancient Titan
        if (gameState.objectiveContestedSoon) {
            score += 20;
        }

        // Death probability in next 3 seconds
        // Calculated based on current health, position, and nearby threats
        if (gameState.deathProbability > 0.7) {
            score += 50;
        }

        // Kill opportunity
        // Positive outlook reduces overall urgency score
        if (gameState.killOpportunity) {
            score -= 20;
        }

        // Skill ready soon
        // Anticipating skill availability can lower panic
        if (heroState.skillsReadySoon) {
            score -= 10;
        }

        return Math.min(100, score);
    }

    calculateDynamicWeights(scores, heroState, gameState) {
        let weights = { ...this.baseWeights };
        const difficulty = (this.controller && this.controller.difficulty) || 'normal';

        // Difficulty multipliers
        if (difficulty === 'nightmare') {
            weights.predictive *= 1.5;
            weights.skills *= 1.3;
            weights.momentum *= 0.8;
        } else if (difficulty === 'hard') {
            weights.combat *= 1.2;
            weights.predictive *= 1.2;
        } else if (difficulty === 'easy') {
            weights.survival *= 0.7;
        }

        // Situation multipliers
        if (gameState.teamFightActive) {
            weights.team *= 2.0;
            weights.position *= 1.5;
        }

        const hpPercent = (heroState.health / heroState.maxHealth) * 100;
        if (hpPercent < 30) {
            weights.survival *= 2.0;
        }

        if (gameState.nearObjective) {
            weights.objective *= 1.8;
        }

        return weights;
    }

    determineDecisionMode(score, heroState) {
        if (score >= 85 || (heroState.deathProbability > 0.8)) return 'EXTREME_URGENT';
        if (score >= 70) return 'URGENT';
        if (score >= 40) return 'PLANNING';
        return 'LOCAL';
    }

    calculateConfidence(scores) {
        const values = Object.values(scores);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        // Lower standard deviation means more consensus across layers = higher confidence
        // This is a simplified calculation
        return Math.max(0, Math.min(1, 1 - (stdDev / 50)));
    }

    generateRationale(scores) {
        const sortedLayers = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        return sortedLayers.map(([layer, score]) => {
            return `${layer.toUpperCase()} (${Math.round(score)})`;
        }).join(', ');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedSmartEvaluator;
}
