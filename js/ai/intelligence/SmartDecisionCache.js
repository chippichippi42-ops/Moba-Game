/**
 * ========================================
 * Smart Decision Cache
 * ========================================
 * Intelligent caching system for AI decisions
 */

class SmartDecisionCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 50;
        this.stats = {
            hits: 0,
            misses: 0
        };
    }

    generateCacheKey(evaluation) {
        // Multi-factor cache key
        const mode = evaluation.mode;
        const scoreBucket = Math.floor(evaluation.score / 5); // 5-point buckets
        const combatLevel = evaluation.scores.combat > 50 ? 'high' : 'low';
        const positionLevel = evaluation.scores.position > 50 ? 'bad' : 'good';
        const teamFight = evaluation.weights.team > 0.15 ? 'active' : 'none';

        return `${mode}_${scoreBucket}_${combatLevel}_${positionLevel}_${teamFight}`;
    }

    canUseCached(evaluation, lastCache) {
        if (!lastCache) return false;

        const age = Date.now() - lastCache.timestamp;
        const scoreDiff = Math.abs(evaluation.score - lastCache.score);

        // Reuse if: score within 5 points, age < 100ms, same mode
        return (
            scoreDiff <= 5 &&
            age < 100 &&
            evaluation.mode === lastCache.mode
        );
    }

    shouldQueryOllama(evaluation) {
        // Only query if mode is URGENT or PLANNING
        // EXTREME_URGENT is local only
        // LOCAL is local only
        return evaluation.mode === 'URGENT' || evaluation.mode === 'PLANNING';
    }

    updateCache(heroId, decision, evaluation) {
        const key = this.generateCacheKey(evaluation);
        const cacheEntry = {
            decision: decision,
            evaluation: evaluation,
            score: evaluation.score,
            mode: evaluation.mode,
            timestamp: Date.now(),
            key: key
        };

        this.cache.set(heroId, cacheEntry);

        // Maintain max size
        if (this.cache.size > this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
    }

    getCached(heroId) {
        const cached = this.cache.get(heroId);
        if (cached) {
            this.stats.hits++;
            return cached;
        }
        this.stats.misses++;
        return null;
    }

    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            hitRate: total > 0 ? (this.stats.hits / total) : 0
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartDecisionCache;
}
