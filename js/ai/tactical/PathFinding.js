/**
 * ========================================
 * Path Finding System with A* Algorithm
 * ========================================
 * Handles advanced pathfinding and navigation
 */

class PathFinding {
    constructor() {
        this.grid = null;
        this.gridSize = 100; // 100px grid cells
        this.lastGridUpdate = 0;
        this.gridUpdateInterval = 5000; // Update grid every 5 seconds
    }
    
    initialize() {
        this.updateNavigationGrid();
    }
    
    update(deltaTime) {
        const now = Date.now();
        if (now - this.lastGridUpdate > this.gridUpdateInterval) {
            this.updateNavigationGrid();
            this.lastGridUpdate = now;
        }
    }
    
    updateNavigationGrid() {
        // Create grid based on map size
        const width = Math.ceil(CONFIG.map.width / this.gridSize);
        const height = Math.ceil(CONFIG.map.height / this.gridSize);
        
        this.grid = [];
        
        for (let y = 0; y < height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < width; x++) {
                this.grid[y][x] = this.isCellWalkable(x, y) ? 1 : 0;
            }
        }
    }
    
    isCellWalkable(gridX, gridY) {
        // Convert grid coordinates to world coordinates
        const x = gridX * this.gridSize + this.gridSize / 2;
        const y = gridY * this.gridSize + this.gridSize / 2;
        
        // Check walls
        for (const wall of CONFIG.wallPositions) {
            if (x > wall.x && x < wall.x + wall.width && 
                y > wall.y && y < wall.y + wall.height) {
                return false;
            }
        }
        
        // Check if near map boundaries
        if (x < 100 || x > CONFIG.map.width - 100 || 
            y < 100 || y > CONFIG.map.height - 100) {
            return false;
        }
        
        return true;
    }
    
    findPath(start, end, radius = 50) {
        // Convert world coordinates to grid coordinates
        const startGrid = this.worldToGrid(start.x, start.y);
        const endGrid = this.worldToGrid(end.x, end.y);
        
        // Check if start or end is invalid
        if (!startGrid || !endGrid) {
            return [end]; // Direct path if grid conversion fails
        }
        
        // Run A* algorithm
        const path = this.aStar(startGrid, endGrid);
        
        if (path && path.length > 0) {
            // Convert grid path to world coordinates
            return path.map(node => this.gridToWorld(node.x, node.y));
        }
        
        // Fallback to direct path
        return [end];
    }
    
    worldToGrid(x, y) {
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        
        if (gridX >= 0 && gridX < this.grid[0].length && 
            gridY >= 0 && gridY < this.grid.length) {
            return { x: gridX, y: gridY };
        }
        
        return null;
    }
    
    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.gridSize + this.gridSize / 2,
            y: gridY * this.gridSize + this.gridSize / 2
        };
    }
    
    aStar(start, end) {
        // Heuristic function (Manhattan distance)
        const heuristic = (a, b) => {
            return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        };
        
        // Check if start or end is blocked
        if (this.grid[start.y][start.x] === 0 || this.grid[end.y][end.x] === 0) {
            return null;
        }
        
        const openSet = [start];
        const cameFrom = {};
        const gScore = {};
        const fScore = {};
        
        // Initialize scores
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                gScore[`${x},${y}`] = Infinity;
                fScore[`${x},${y}`] = Infinity;
            }
        }
        
        gScore[`${start.x},${start.y}`] = 0;
        fScore[`${start.x},${start.y}`] = heuristic(start, end);
        
        while (openSet.length > 0) {
            // Find node with lowest fScore
            let current = openSet[0];
            for (let i = 1; i < openSet.length; i++) {
                const currentScore = fScore[`${current.x},${current.y}`];
                const nodeScore = fScore[`${openSet[i].x},${openSet[i].y}`];
                if (nodeScore < currentScore) {
                    current = openSet[i];
                }
            }
            
            // Check if we reached the end
            if (current.x === end.x && current.y === end.y) {
                return this.reconstructPath(cameFrom, current);
            }
            
            // Remove current from openSet
            openSet.splice(openSet.indexOf(current), 1);
            
            // Get neighbors
            const neighbors = this.getNeighbors(current);
            
            for (const neighbor of neighbors) {
                const tentativeGScore = gScore[`${current.x},${current.y}`] + 1;
                
                if (tentativeGScore < gScore[`${neighbor.x},${neighbor.y}`]) {
                    cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                    gScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore;
                    fScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore + heuristic(neighbor, end);
                    
                    if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        // No path found
        return null;
    }
    
    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 },  // Right
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: -1 }, // Up-Right
            { x: 1, y: 1 },  // Down-Right
            { x: -1, y: 1 }, // Down-Left
            { x: -1, y: -1 } // Up-Left
        ];
        
        for (const dir of directions) {
            const neighborX = node.x + dir.x;
            const neighborY = node.y + dir.y;
            
            // Check bounds
            if (neighborX >= 0 && neighborX < this.grid[0].length &&
                neighborY >= 0 && neighborY < this.grid.length) {
                
                // Check if walkable
                if (this.grid[neighborY][neighborX] === 1) {
                    neighbors.push({ x: neighborX, y: neighborY });
                }
            }
        }
        
        return neighbors;
    }
    
    reconstructPath(cameFrom, current) {
        const path = [current];
        
        while (cameFrom[`${current.x},${current.y}`]) {
            current = cameFrom[`${current.x},${current.y}`];
            path.unshift(current);
        }
        
        return path;
    }
    
    // Smooth path using Bezier curves
    smoothPath(path) {
        if (path.length <= 2) return path;
        
        const smoothedPath = [path[0]];
        
        for (let i = 1; i < path.length - 1; i++) {
            const prev = path[i - 1];
            const curr = path[i];
            const next = path[i + 1];
            
            // Simple smoothing - average with neighbors
            const smoothedX = (prev.x + curr.x + next.x) / 3;
            const smoothedY = (prev.y + curr.y + next.y) / 3;
            
            smoothedPath.push({ x: smoothedX, y: smoothedY });
        }
        
        smoothedPath.push(path[path.length - 1]);
        
        return smoothedPath;
    }
    
    // Check if path is blocked
    isPathBlocked(start, end) {
        // Simple line of sight check
        const steps = 10;
        
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = start.x + (end.x - start.x) * t;
            const y = start.y + (end.y - start.y) * t;
            
            if (GameMap.checkWallCollision(x, y, 30)) {
                return true;
            }
        }
        
        return false;
    }
    
    // Get distance along path
    getPathDistance(path) {
        let distance = 0;
        
        for (let i = 1; i < path.length; i++) {
            distance += Utils.distance(
                path[i - 1].x, path[i - 1].y,
                path[i].x, path[i].y
            );
        }
        
        return distance;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PathFinding;
}