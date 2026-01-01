/**
 * ========================================
 * MOBA Arena - Utility Functions
 * ========================================
 */

const Utils = {
    // === MATH UTILITIES ===
    
    /**
     * Clamp giá trị trong khoảng min-max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Linear interpolation
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Tính khoảng cách giữa 2 điểm
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Tính khoảng cách giữa 2 entity
     */
    distanceBetween(entity1, entity2) {
        return this.distance(entity1.x, entity1.y, entity2.x, entity2.y);
    },

    /**
     * Tính góc từ điểm 1 đến điểm 2 (radians)
     */
    angleBetweenPoints(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Tính góc từ entity 1 đến entity 2
     */
    angleBetween(entity1, entity2) {
        return this.angleBetweenPoints(entity1.x, entity1.y, entity2.x, entity2.y);
    },

    /**
     * Normalize vector
     */
    normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    },

    /**
     * Random number trong khoảng
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Random integer trong khoảng
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Random item từ array
     */
    randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Shuffle array (Fisher-Yates)
     */
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },

    /**
     * Degrees to radians
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Radians to degrees
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },

    // === COLLISION DETECTION ===

    /**
     * Circle-Circle collision
     */
    circleCollision(x1, y1, r1, x2, y2, r2) {
        const dist = this.distance(x1, y1, x2, y2);
        return dist < r1 + r2;
    },

    /**
     * Point in circle
     */
    pointInCircle(px, py, cx, cy, r) {
        return this.distance(px, py, cx, cy) < r;
    },

    /**
     * Point in rectangle
     */
    pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    },

    /**
     * Circle-Rectangle collision
     */
    circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
        const closestX = this.clamp(cx, rx, rx + rw);
        const closestY = this.clamp(cy, ry, ry + rh);
        return this.distance(cx, cy, closestX, closestY) < cr;
    },

    /**
     * Line-Circle intersection
     */
    lineCircleIntersection(x1, y1, x2, y2, cx, cy, r) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const fx = x1 - cx;
        const fy = y1 - cy;

        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = fx * fx + fy * fy - r * r;

        let discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return null;

        discriminant = Math.sqrt(discriminant);
        const t1 = (-b - discriminant) / (2 * a);
        const t2 = (-b + discriminant) / (2 * a);

        if (t1 >= 0 && t1 <= 1) {
            return { x: x1 + t1 * dx, y: y1 + t1 * dy, t: t1 };
        }
        if (t2 >= 0 && t2 <= 1) {
            return { x: x1 + t2 * dx, y: y1 + t2 * dy, t: t2 };
        }
        return null;
    },

    // === OBJECT POOLING ===

    /**
     * Simple Object Pool
     */
    createPool(factory, initialSize = 10) {
        const pool = [];
        const active = new Set();

        // Pre-populate
        for (let i = 0; i < initialSize; i++) {
            pool.push(factory());
        }

        return {
            get() {
                let obj = pool.pop();
                if (!obj) {
                    obj = factory();
                }
                active.add(obj);
                return obj;
            },
            release(obj) {
                if (active.has(obj)) {
                    active.delete(obj);
                    pool.push(obj);
                }
            },
            clear() {
                active.clear();
                pool.length = 0;
            },
            getActiveCount() {
                return active.size;
            },
        };
    },

    // === TIME UTILITIES ===

    /**
     * Format time to MM:SS
     */
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // === EASING FUNCTIONS ===

    easing: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    },

    // === COLOR UTILITIES ===

    /**
     * Hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * RGB to Hex
     */
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },

    /**
     * Interpolate colors
     */
    lerpColor(color1, color2, t) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        if (!rgb1 || !rgb2) return color1;

        const r = Math.round(this.lerp(rgb1.r, rgb2.r, t));
        const g = Math.round(this.lerp(rgb1.g, rgb2.g, t));
        const b = Math.round(this.lerp(rgb1.b, rgb2.b, t));

        return this.rgbToHex(r, g, b);
    },

    // === SPATIAL HASH ===

    /**
     * Simple Spatial Hash for collision optimization
     */
    createSpatialHash(cellSize) {
        const cells = new Map();

        return {
            clear() {
                cells.clear();
            },

            insert(entity) {
                const cellX = Math.floor(entity.x / cellSize);
                const cellY = Math.floor(entity.y / cellSize);
                const key = `${cellX},${cellY}`;

                if (!cells.has(key)) {
                    cells.set(key, new Set());
                }
                cells.get(key).add(entity);
            },

            query(x, y, radius) {
                const results = [];
                const minCellX = Math.floor((x - radius) / cellSize);
                const maxCellX = Math.floor((x + radius) / cellSize);
                const minCellY = Math.floor((y - radius) / cellSize);
                const maxCellY = Math.floor((y + radius) / cellSize);

                for (let cx = minCellX; cx <= maxCellX; cx++) {
                    for (let cy = minCellY; cy <= maxCellY; cy++) {
                        const key = `${cx},${cy}`;
                        if (cells.has(key)) {
                            for (const entity of cells.get(key)) {
                                results.push(entity);
                            }
                        }
                    }
                }
                return results;
            },

            remove(entity) {
                const cellX = Math.floor(entity.x / cellSize);
                const cellY = Math.floor(entity.y / cellSize);
                const key = `${cellX},${cellY}`;

                if (cells.has(key)) {
                    cells.get(key).delete(entity);
                }
            },
        };
    },

    // === UUID GENERATOR ===
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // === DEEP CLONE ===
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    },

    // === PATHFINDING HELPERS ===

    /**
     * A* Heuristic (Manhattan distance)
     */
    manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    },

    /**
     * Simple line of sight check
     */
    hasLineOfSight(x1, y1, x2, y2, obstacles, stepSize = 10) {
        const dist = this.distance(x1, y1, x2, y2);
        const steps = Math.ceil(dist / stepSize);
        const dx = (x2 - x1) / steps;
        const dy = (y2 - y1) / steps;

        for (let i = 0; i <= steps; i++) {
            const px = x1 + dx * i;
            const py = y1 + dy * i;

            for (const obs of obstacles) {
                if (obs.type === 'rect') {
                    if (this.pointInRect(px, py, obs.x, obs.y, obs.width, obs.height)) {
                        return false;
                    }
                } else if (obs.type === 'circle') {
                    if (this.pointInCircle(px, py, obs.x, obs.y, obs.radius)) {
                        return false;
                    }
                }
            }
        }
        return true;
    },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
