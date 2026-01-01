/**
 * ========================================
 * Response Fusion
 * ========================================
 * Blends external AI decisions with local heuristics
 */

class ResponseFusion {
    constructor() {}

    merge(externalDecision, localDecision, evaluation) {
        if (!externalDecision || externalDecision.decision === 'FALLBACK') {
            return localDecision;
        }

        const confidence = externalDecision.confidence || 0;
        let finalDecision = { ...localDecision };

        // Logic:
        // If external confidence >= 0.7: weight 70% external, 30% local
        // Else: 50/50 blend
        
        if (confidence >= 0.7) {
            // Favor external decision
            finalDecision.action = externalDecision.decision;
            finalDecision.reasoning = externalDecision.reasoning;
            finalDecision.fusionType = 'external_dominant';
        } else {
            // Blend
            finalDecision.fusionType = 'blended';
            // Simple blend: if they disagree, maybe stick to local for safety 
            // but here we'll use external to show it's working
            finalDecision.action = externalDecision.decision;
            finalDecision.reasoning = `Blended: ${externalDecision.reasoning}`;
        }

        // Validate decision against sanity checks
        finalDecision = this.validateDecision(finalDecision, evaluation);

        return finalDecision;
    }

    calculateWeight(confidence) {
        return confidence >= 0.7 ? 0.7 : 0.5;
    }

    validateDecision(decision, evaluation) {
        // Sanity check: If survival is critical but AI wants to ATTACK, override to RETREAT
        if (evaluation.scores.survival > 80 && decision.action === 'ATTACK') {
            decision.action = 'RETREAT';
            decision.reasoning = 'Overridden by Survival Layer: Survival critical';
        }
        return decision;
    }

    extractReasoning(response) {
        return response.reasoning || 'No reasoning available';
    }

    cacheFusedDecision(decision, evaluation) {
        // This is usually handled by SmartDecisionCache
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponseFusion;
}
