/**
 * ========================================
 * Spatial Grid
 * ========================================
 * Grid-based spatial indexing for fast entity lookups
 * Optimizes entity queries from O(n) to O(k) where k is cells in range
 */

class SpatialGrid {
    constructor(cellSize = 200) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    clear() {
        this.grid.clear();
    }

    addEntity(entity) {
        const cellKey = `${Math.floor(entity.x / this.cellSize)},${Math.floor(entity.y / this.cellSize)}`;

        if (!this.grid.has(cellKey)) {
            this.grid.set(cellKey, []);
        }

        this.grid.get(cellKey).push(entity);
    }

    removeEntity(entity) {
        const cellKey = `${Math.floor(entity.x / this.cellSize)},${Math.floor(entity.y / this.cellSize)}`;

        if (this.grid.has(cellKey)) {
            const cell = this.grid.get(cellKey);
            const index = cell.indexOf(entity);
            if (index !== -1) {
                cell.splice(index, 1);
            }

            // Remove empty cells
            if (cell.length === 0) {
                this.grid.delete(cellKey);
            }
        }
    }

    updateEntity(entity, oldX, oldY) {
        // Remove from old cell and add to new one
        const oldCellKey = `${Math.floor(oldX / this.cellSize)},${Math.floor(oldY / this.cellSize)}`;
        const newCellKey = `${Math.floor(entity.x / this.cellSize)},${Math.floor(entity.y / this.cellSize)}`;

        if (oldCellKey !== newCellKey) {
            this.removeEntity(entity);
            this.addEntity(entity);
        }
    }

    getNearby(x, y, radius) {
        // Only check cells within radius, not each entity
        const results = [];
        const cellSize = this.cellSize;

        const minCell = Math.floor((x - radius) / cellSize);
        const maxCell = Math.floor((x + radius) / cellSize);
        const minCellY = Math.floor((y - radius) / cellSize);
        const maxCellY = Math.floor((y + radius) / cellSize);

        for (let i = minCell; i <= maxCell; i++) {
            for (let j = minCellY; j <= maxCellY; j++) {
                const cellKey = `${i},${j}`;
                const cell = this.grid.get(cellKey);

                if (cell) {
                    // Filter entities by actual distance
                    for (const entity of cell) {
                        const dist = Utils ? Utils.distance(x, y, entity.x, entity.y) :
                            Math.sqrt((x - entity.x) ** 2 + (y - entity.y) ** 2);
                        if (dist <= radius) {
                            results.push(entity);
                        }
                    }
                }
            }
        }

        return results;
    }

    getEntitiesInRect(x, y, width, height) {
        const results = [];
        const cellSize = this.cellSize;

        const minCell = Math.floor(x / cellSize);
        const maxCell = Math.floor((x + width) / cellSize);
        const minCellY = Math.floor(y / cellSize);
        const maxCellY = Math.floor((y + height) / cellSize);

        for (let i = minCell; i <= maxCell; i++) {
            for (let j = minCellY; j <= maxCellY; j++) {
                const cellKey = `${i},${j}`;
                const cell = this.grid.get(cellKey);

                if (cell) {
                    for (const entity of cell) {
                        if (entity.x >= x && entity.x <= x + width &&
                            entity.y >= y && entity.y <= y + height) {
                            results.push(entity);
                        }
                    }
                }
            }
        }

        return results;
    }

    getAllEntities() {
        const allEntities = [];

        for (const cell of this.grid.values()) {
            allEntities.push(...cell);
        }

        return allEntities;
    }

    getCellCount() {
        return this.grid.size;
    }

    getEntityCount() {
        let count = 0;

        for (const cell of this.grid.values()) {
            count += cell.length;
        }

        return count;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpatialGrid;
}
