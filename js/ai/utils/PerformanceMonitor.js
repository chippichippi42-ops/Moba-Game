/**
 * ========================================
 * Performance Monitor
 * ========================================
 * Tracks and logs AI system performance metrics
 */

class PerformanceMonitor {
    constructor(enabled = true) {
        this.enabled = enabled;
        this.timers = new Map();
        this.metrics = {
            decisionTimes: [],
            pathfindingTimes: [],
            movementTimes: [],
            combatTimes: [],
            totalFrames: 0,
            slowFrames: 0
        };
        this.slowThreshold = 20; // ms - consider > 20ms slow
        this.historySize = 100;
    }

    startTimer(label) {
        if (!this.enabled) return;
        this.timers.set(label, performance.now());
    }

    endTimer(label) {
        if (!this.enabled) return;

        const startTime = this.timers.get(label);
        if (startTime === undefined) return;

        const elapsed = performance.now() - startTime;

        // Categorize by timer label
        if (label.includes('decision')) {
            this.recordMetric(this.metrics.decisionTimes, elapsed);
        } else if (label.includes('pathfinding')) {
            this.recordMetric(this.metrics.pathfindingTimes, elapsed);
        } else if (label.includes('movement')) {
            this.recordMetric(this.metrics.movementTimes, elapsed);
        } else if (label.includes('combat')) {
            this.recordMetric(this.metrics.combatTimes, elapsed);
        }

        // Track slow frames
        if (elapsed > this.slowThreshold) {
            this.metrics.slowFrames++;
        }

        this.metrics.totalFrames++;
    }

    recordMetric(array, value) {
        array.push(value);

        // Maintain history size
        if (array.length > this.historySize) {
            array.shift();
        }
    }

    getAverage(times) {
        if (times.length === 0) return 0;
        const sum = times.reduce((a, b) => a + b, 0);
        return sum / times.length;
    }

    getMax(times) {
        if (times.length === 0) return 0;
        return Math.max(...times);
    }

    getMetrics() {
        return {
            decisionAvg: this.getAverage(this.metrics.decisionTimes),
            decisionMax: this.getMax(this.metrics.decisionTimes),
            pathfindingAvg: this.getAverage(this.metrics.pathfindingTimes),
            pathfindingMax: this.getMax(this.metrics.pathfindingTimes),
            movementAvg: this.getAverage(this.metrics.movementTimes),
            movementMax: this.getMax(this.metrics.movementTimes),
            combatAvg: this.getAverage(this.metrics.combatTimes),
            combatMax: this.getMax(this.metrics.combatTimes),
            totalFrames: this.metrics.totalFrames,
            slowFrames: this.metrics.slowFrames,
            slowFrameRate: this.metrics.totalFrames > 0 ?
                (this.metrics.slowFrames / this.metrics.totalFrames * 100) : 0
        };
    }

    printMetrics() {
        const metrics = this.getMetrics();

        console.log('=== AI Performance Metrics ===');
        console.log(`Decision: ${metrics.decisionAvg.toFixed(2)}ms avg, ${metrics.decisionMax.toFixed(2)}ms max`);
        console.log(`Pathfinding: ${metrics.pathfindingAvg.toFixed(2)}ms avg, ${metrics.pathfindingMax.toFixed(2)}ms max`);
        console.log(`Movement: ${metrics.movementAvg.toFixed(2)}ms avg, ${metrics.movementMax.toFixed(2)}ms max`);
        console.log(`Combat: ${metrics.combatAvg.toFixed(2)}ms avg, ${metrics.combatMax.toFixed(2)}ms max`);
        console.log(`Total frames: ${metrics.totalFrames}`);
        console.log(`Slow frames: ${metrics.slowFrames} (${metrics.slowFrameRate.toFixed(1)}%)`);
        console.log('================================');

        return metrics;
    }

    checkThresholds() {
        const metrics = this.getMetrics();
        const issues = [];

        if (metrics.decisionMax > 8) {
            issues.push(`Decision making exceeded 8ms: ${metrics.decisionMax.toFixed(2)}ms`);
        }

        if (metrics.pathfindingMax > 5) {
            issues.push(`Pathfinding exceeded 5ms: ${metrics.pathfindingMax.toFixed(2)}ms`);
        }

        if (metrics.slowFrameRate > 10) {
            issues.push(`High slow frame rate: ${metrics.slowFrameRate.toFixed(1)}%`);
        }

        if (issues.length > 0) {
            console.warn('Performance Issues Detected:');
            issues.forEach(issue => console.warn(`  - ${issue}`));
        }

        return issues;
    }

    reset() {
        this.timers.clear();
        this.metrics = {
            decisionTimes: [],
            pathfindingTimes: [],
            movementTimes: [],
            combatTimes: [],
            totalFrames: 0,
            slowFrames: 0
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}
