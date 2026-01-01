/**
 * ========================================
 * Advanced Prompt Builder
 * ========================================
 * Constructs sophisticated prompts for Ollama
 */

class AdvancedPromptBuilder {
    constructor() {}

    buildDecisionPrompt(heroState, gameState, teamState, evaluation) {
        const breakdown = this.formatEvaluationBreakdown(evaluation.scores);
        const clues = this.generateContextClues(heroState, gameState, evaluation);

        return `
### MOBA AI STRATEGY SESSION ###
You are an expert MOBA player. Decide the best action for ${heroState.name}.

## HERO STATE
- Name: ${heroState.name}
- Level: ${heroState.level}
- HP: ${Math.round(heroState.healthPercent)}%
- Mana: ${Math.round(heroState.manaPercent)}%
- Position: (${Math.round(heroState.x)}, ${Math.round(heroState.y)})

## SITUATION ANALYSIS
${clues}

## EVALUATION BREAKDOWN
${breakdown}

## TEAM STATE
- Team Score: ${gameState.blueScore} vs ${gameState.redScore}
- Nearby Allies: ${gameState.nearbyAllies.length}
- Nearby Enemies: ${gameState.nearbyEnemies.length}
- Objective Threat: ${gameState.objectiveThreat ? '🚨 HIGH' : 'NORMAL'}

## SKILL AVAILABILITY
- Q (Basic): ${heroState.abilities.q.ready ? 'READY' : 'COOLDOWN'}
- E (Movement): ${heroState.abilities.e.ready ? 'READY' : 'COOLDOWN'}
- R (Ultimate): ${heroState.abilities.r.ready ? 'READY' : 'COOLDOWN'}

## OPTIONS
1. ATTACK: Engage nearest vulnerable enemy
2. RETREAT: Back off to safe distance or tower
3. PROTECT: Save a nearby ally in trouble
4. FARM: Focus on last-hitting minions
5. BACK: Return to base for health/items
6. ROTATE: Move to another lane or objective
7. HOLD: Stay in position and defend
8. DODGE: Focus on avoiding incoming spells
9. COUNTER: Wait for enemy to engage, then flip
10. DIVE: High-risk attack under enemy tower

Choose ONE action and provide a brief reasoning.
Format: ACTION | REASONING
        `;
    }

    buildStrategyPrompt(heroState, gameState, evaluation) {
        return `
### STRATEGIC PLANNING ###
Situation: ${evaluation.mode}
Current Score: ${Math.round(evaluation.score)}
Top Factors: ${evaluation.rationale}

As ${heroState.name}, what is our objective for the next 30 seconds? 
Consider map control, farm, and team momentum.
        `;
    }

    formatEvaluationBreakdown(scores) {
        return Object.entries(scores)
            .map(([layer, score]) => `- ${layer.toUpperCase()}: ${Math.round(score)}`)
            .join('\n');
    }

    generateContextClues(heroState, gameState, evaluation) {
        let clues = [];
        
        if (evaluation.scores.survival > 50) clues.push("⚠️ SURVIVAL AT RISK: Health low or high damage incoming.");
        if (evaluation.scores.combat > 50) clues.push("⚔️ COMBAT PRESSURE: Outnumbered or CC threat.");
        if (evaluation.scores.resource > 40) clues.push("💧 RESOURCE DEPLETED: Low mana for skills.");
        if (evaluation.scores.objective > 40) clues.push("🏰 OBJECTIVE PRIORITY: Tower or Dragon needs attention.");
        if (evaluation.scores.position > 40) clues.push("📍 POSITION DISADVANTAGE: Bad terrain or no vision.");
        
        if (clues.length === 0) clues.push("✅ STABLE: No immediate threats detected.");
        
        return clues.join('\n');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedPromptBuilder;
}
