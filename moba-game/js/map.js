/**
 * ========================================
 * MOBA Arena - Map System (Config-based)
 * ========================================
 */

const GameMap = {
    width: 8000,
    height: 8000,
    walls: [],
    brushes: [],
    river: null,
    lanes: { top: [], mid: [], bot: [] },
    blueBase: null,
    redBase: null,
    towerPositions: {
        blue: { main: null, top: [], mid: [], bot: [] },
        red: { main: null, top: [], mid: [], bot: [] },
    },
    minimapData: null,
    lanePaths: [],
    
    colors: {
        grass: '#2d5a27',
        grassLight: '#3d6a37',
        grassDark: '#1d4a17',
        river: '#3498db',
        riverDeep: '#2980b9',
        path: '#8B7355',
        pathBorder: '#6B5335',
        wall: '#4a4a4a',
        wallHighlight: '#5a5a5a',
        wallDark: '#3a3a3a',
        brush: '#1e5a1e',
        brushDark: '#0e4a0e',
        brushLight: '#2e6a2e',
        blueBase: 'rgba(0, 150, 255, 0.3)',
        redBase: 'rgba(255, 50, 50, 0.3)',
    },
    
    init() {
        this.walls = [];
        this.brushes = [];
        this.lanePaths = [];
        this.generateMap();
        this.generateMinimapData();
    },
    
    generateMap() {
        const w = this.width;
        const h = this.height;
        const baseExt = 500;
        const laneW = 350;
        
        // === BASES ===
        this.blueBase = {
            x: -baseExt,
            y: h - baseExt - 800,
            width: baseExt + 800,
            height: baseExt + 800,
            team: CONFIG.teams.BLUE,
            spawnPoint: { x: 300, y: h - 300 },
            healZone: { x: 250, y: h - 250, radius: 250 },
        };

        this.redBase = {
            x: w - 800,
            y: -baseExt,
            width: baseExt + 800,
            height: baseExt + 800,
            team: CONFIG.teams.RED,
            spawnPoint: { x: w - 300, y: 300 },
            healZone: { x: w - 250, y: 250, radius: 250 },
        };
        
        // === LANES ===
        this.lanes.top = {
            path: [
                { x: 400, y: h - 800 },
                { x: 400, y: 1200 },
                { x: 400, y: 400 },
                { x: 1200, y: 400 },
                { x: w - 800, y: 400 },
            ],
            width: laneW,
        };
        
        this.lanes.mid = {
            path: [
                { x: 700, y: h - 700 },
                { x: w / 2, y: h / 2 },
                { x: w - 700, y: 700 },
            ],
            width: laneW,
        };
        
        this.lanes.bot = {
            path: [
                { x: 800, y: h - 400 },
                { x: w - 1200, y: h - 400 },
                { x: w - 400, y: h - 400 },
                { x: w - 400, y: h - 1200 },
                { x: w - 400, y: 800 },
            ],
            width: laneW,
        };
        
        this.storeLanePaths();
        
        // === RIVER ===
        this.river = {
            start: { x: 300, y: 300 },
            end: { x: w - 300, y: h - 300 },
            width: 300,
            points: this.generateRiverPath(300, 300, w - 300, h - 300),
        };
        
        // === TOWER POSITIONS ===
        this.generateTowerPositions();
        
        // === WALLS FROM CONFIG ===
        this.loadWallsFromConfig();
        
        // === BRUSHES FROM CONFIG ===
        this.loadBrushesFromConfig();
        
        // === BOUNDARY WALLS ===
        this.generateBoundaryWalls();
    },
    
    /**
     * Load walls from CONFIG
     */
    loadWallsFromConfig() {
        if (CONFIG.wallPositions && Array.isArray(CONFIG.wallPositions)) {
            for (const wallData of CONFIG.wallPositions) {
                const wall = {
                    x: wallData.x,
                    y: wallData.y,
                    width: wallData.width || 160,
                    height: wallData.height || 160,
                    type: 'rect',
                };
                
                // Validate wall position
                if (this.isValidWallPosition(wall)) {
                    this.walls.push(wall);
                }
            }
        }
    },
    
    /**
     * Load brushes from CONFIG - Rectangular only
     */
    loadBrushesFromConfig() {
        if (CONFIG.brushPositions && Array.isArray(CONFIG.brushPositions)) {
            for (const brushData of CONFIG.brushPositions) {
                const brush = {
                    x: brushData.x,
                    y: brushData.y,
                    width: brushData.width || 160,
                    height: brushData.height || 120,
                    type: 'rect',
                };
                
                // Validate brush position
                if (this.isValidBrushPosition(brush)) {
                    this.brushes.push(brush);
                }
            }
        }
    },
    
    storeLanePaths() {
        this.lanePaths = [];
        for (const [laneName, lane] of Object.entries(this.lanes)) {
            for (let i = 0; i < lane.path.length - 1; i++) {
                this.lanePaths.push({
                    x1: lane.path[i].x,
                    y1: lane.path[i].y,
                    x2: lane.path[i + 1].x,
                    y2: lane.path[i + 1].y,
                    width: lane.width,
                });
            }
        }
    },
    
    isPointOnLane(x, y, margin = 50) {
        for (const segment of this.lanePaths) {
            const dist = this.pointToLineDistance(x, y, segment.x1, segment.y1, segment.x2, segment.y2);
            if (dist < (segment.width / 2) + margin) return true;
        }
        return false;
    },
    
    isPointInRiver(x, y, margin = 50) {
        if (!this.river || !this.river.points) return false;
        for (let i = 0; i < this.river.points.length - 1; i++) {
            const dist = this.pointToLineDistance(
                x, y,
                this.river.points[i].x, this.river.points[i].y,
                this.river.points[i + 1].x, this.river.points[i + 1].y
            );
            if (dist < (this.river.width / 2) + margin) return true;
        }
        return false;
    },
    
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = lenSq !== 0 ? dot / lenSq : -1;
        
        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }
        
        return Math.sqrt((px - xx) * (px - xx) + (py - yy) * (py - yy));
    },
    
    generateRiverPath(x1, y1, x2, y2) {
        const points = [];
        const segments = 30;
        const amplitude = 150;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const baseX = Utils.lerp(x1, x2, t);
            const baseY = Utils.lerp(y1, y2, t);
            
            const perpX = -(y2 - y1);
            const perpY = x2 - x1;
            const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);
            const perpNormX = perpX / perpLen;
            const perpNormY = perpY / perpLen;
            
            const wave = Math.sin(t * Math.PI * 4) * amplitude * 0.7;
            
            points.push({
                x: baseX + perpNormX * wave,
                y: baseY + perpNormY * wave,
            });
        }
        
        return points;
    },
    
    generateTowerPositions() {
        const w = this.width;
        const h = this.height;
        
        this.towerPositions.blue.main = { x: 600, y: h - 600 };
        this.towerPositions.blue.top = [
            { x: 400, y: h - 1500 },
            { x: 400, y: h - 2800 },
            { x: 400, y: h - 4200 },
        ];
        this.towerPositions.blue.mid = [
            { x: 1500, y: h - 1500 },
            { x: 2400, y: h - 2400 },
            { x: 3300, y: h - 3300 },
        ];
        this.towerPositions.blue.bot = [
            { x: 1500, y: h - 400 },
            { x: 2800, y: h - 400 },
            { x: 4200, y: h - 400 },
        ];
        
        this.towerPositions.red.main = { x: w - 600, y: 600 };
        this.towerPositions.red.top = [
            { x: w - 1500, y: 400 },
            { x: w - 2800, y: 400 },
            { x: w - 4200, y: 400 },
        ];
        this.towerPositions.red.mid = [
            { x: w - 1500, y: 1500 },
            { x: w - 2400, y: 2400 },
            { x: w - 3300, y: 3300 },
        ];
        this.towerPositions.red.bot = [
            { x: w - 400, y: 1500 },
            { x: w - 400, y: 2800 },
            { x: w - 400, y: 4200 },
        ];
    },
    
    isValidWallPosition(wall) {
        // Check bounds
        if (wall.x < 500 || wall.x + wall.width > this.width - 500 ||
            wall.y < 500 || wall.y + wall.height > this.height - 500) {
            return false;
        }
        
        // Check lane collision
        const checkPoints = [
            { x: wall.x, y: wall.y },
            { x: wall.x + wall.width, y: wall.y },
            { x: wall.x, y: wall.y + wall.height },
            { x: wall.x + wall.width, y: wall.y + wall.height },
            { x: wall.x + wall.width / 2, y: wall.y + wall.height / 2 },
        ];
        
        for (const point of checkPoints) {
            if (this.isPointOnLane(point.x, point.y, 200)) {
                return false;
            }
        }
        
        // Check base proximity
        const centerX = wall.x + wall.width / 2;
        const centerY = wall.y + wall.height / 2;
        
        if (Utils.distance(centerX, centerY, this.blueBase.healZone.x, this.blueBase.healZone.y) < 700) {
            return false;
        }
        if (Utils.distance(centerX, centerY, this.redBase.healZone.x, this.redBase.healZone.y) < 700) {
            return false;
        }
        
        return true;
    },
    
    isValidBrushPosition(brush) {
        const x = brush.x + brush.width / 2;
        const y = brush.y + brush.height / 2;
        const size = Math.max(brush.width, brush.height) / 2;
        
        // Check bounds
        if (brush.x < 400 || brush.x + brush.width > this.width - 400 ||
            brush.y < 400 || brush.y + brush.height > this.height - 400) {
            return false;
        }
        
        // Check not inside walls
        for (const wall of this.walls) {
            if (wall.type === 'rect') {
                if (Utils.circleRectCollision(x, y, size + 30, wall.x, wall.y, wall.width, wall.height)) {
                    return false;
                }
            }
        }
        
        // Check base proximity
        if (Utils.distance(x, y, this.blueBase.healZone.x, this.blueBase.healZone.y) < 500) return false;
        if (Utils.distance(x, y, this.redBase.healZone.x, this.redBase.healZone.y) < 500) return false;
        
        return true;
    },
    
    generateBoundaryWalls() {
        const w = this.width;
        const h = this.height;
        const thickness = 150;
        
        this.walls.push(
            { x: -thickness, y: -thickness, width: w + thickness * 2, height: thickness, type: 'rect' },
            { x: -thickness, y: h, width: w + thickness * 2, height: thickness, type: 'rect' },
            { x: -thickness, y: -thickness, width: thickness, height: h + thickness * 2, type: 'rect' },
            { x: w, y: -thickness, width: thickness, height: h + thickness * 2, type: 'rect' },
        );
    },
    
    generateMinimapData() {
        const scale = CONFIG.ui.minimapSize / Math.max(this.width, this.height);
        this.minimapData = { scale, width: this.width * scale, height: this.height * scale };
    },
    
    checkWallCollision(x, y, radius = 30) {
        if (x - radius < 0 || x + radius > this.width || y - radius < 0 || y + radius > this.height) {
            return true;
        }
        
        for (const wall of this.walls) {
            if (wall.type === 'rect') {
                if (Utils.circleRectCollision(x, y, radius, wall.x, wall.y, wall.width, wall.height)) {
                    return true;
                }
            }
        }
        
        return false;
    },
    
    isInBrush(x, y) {
        for (const brush of this.brushes) {
            // Rectangular brush check
            if (x >= brush.x && x <= brush.x + brush.width &&
                y >= brush.y && y <= brush.y + brush.height) {
                return true;
            }
        }
        return false;
    },
    
    getSpawnPoint(team) {
        if (team === CONFIG.teams.BLUE) return { ...this.blueBase.spawnPoint };
        return { ...this.redBase.spawnPoint };
    },
    
    isInHealZone(x, y, team) {
        const base = team === CONFIG.teams.BLUE ? this.blueBase : this.redBase;
        return Utils.pointInCircle(x, y, base.healZone.x, base.healZone.y, base.healZone.radius);
    },
    
    /**
     * Find safe spawn position near target - for creatures
     */
    findSafeSpawnPosition(targetX, targetY, radius = 30, maxAttempts = 20) {
        // Check if original position is valid
        if (!this.checkWallCollision(targetX, targetY, radius)) {
            return { x: targetX, y: targetY };
        }
        
        // Try to find nearby safe position
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const angle = (attempt / maxAttempts) * Math.PI * 2;
            const dist = 50 + attempt * 20;
            
            const testX = targetX + Math.cos(angle) * dist;
            const testY = targetY + Math.sin(angle) * dist;
            
            if (!this.checkWallCollision(testX, testY, radius)) {
                return { x: testX, y: testY };
            }
        }
        
        // Fallback: return closest valid position
        return this.findNearestValidPosition(targetX, targetY, radius);
    },
    
    /**
     * Find nearest valid position
     */
    findNearestValidPosition(x, y, radius = 30) {
        const searchRadius = 500;
        const step = 30;
        
        for (let dist = step; dist <= searchRadius; dist += step) {
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                const testX = x + Math.cos(angle) * dist;
                const testY = y + Math.sin(angle) * dist;
                
                if (!this.checkWallCollision(testX, testY, radius)) {
                    return { x: testX, y: testY };
                }
            }
        }
        
        // Ultimate fallback
        return { x: this.width / 2, y: this.height / 2 };
    },
    
    render(ctx, camera) {
        this.renderBackground(ctx, camera);
        this.renderLanes(ctx, camera);
        this.renderRiver(ctx, camera);
        this.renderWalls(ctx, camera);
        this.renderBrushes(ctx, camera);
        this.renderBases(ctx, camera);
    },
    
    renderBackground(ctx, camera) {
        const bounds = camera.getVisibleBounds();
        
        ctx.fillStyle = this.colors.grass;
        ctx.fillRect(bounds.left - 100, bounds.top - 100, bounds.width + 200, bounds.height + 200);
        
        const tileSize = 100;
        const startX = Math.floor(bounds.left / tileSize) * tileSize;
        const startY = Math.floor(bounds.top / tileSize) * tileSize;
        
        for (let x = startX; x < bounds.right + tileSize; x += tileSize) {
            for (let y = startY; y < bounds.bottom + tileSize; y += tileSize) {
                const variation = ((x * 7 + y * 13) % 3);
                if (variation === 0) ctx.fillStyle = this.colors.grassLight;
                else if (variation === 1) ctx.fillStyle = this.colors.grassDark;
                else continue;
                ctx.globalAlpha = 0.3;
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
        ctx.globalAlpha = 1;
    },
    
    renderLanes(ctx, camera) {
        for (const [laneName, lane] of Object.entries(this.lanes)) {
            if (!lane || !lane.path || lane.path.length < 2) continue;
            
            ctx.strokeStyle = this.colors.pathBorder;
            ctx.lineWidth = lane.width + 20;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(lane.path[0].x, lane.path[0].y);
            for (let i = 1; i < lane.path.length; i++) {
                ctx.lineTo(lane.path[i].x, lane.path[i].y);
            }
            ctx.stroke();
            
            ctx.strokeStyle = this.colors.path;
            ctx.lineWidth = lane.width;
            ctx.stroke();
            
            ctx.strokeStyle = this.colors.pathBorder;
            ctx.lineWidth = 4;
            ctx.setLineDash([20, 20]);
            ctx.globalAlpha = 0.5;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        }
    },
    
    renderRiver(ctx, camera) {
        if (!this.river || !this.river.points || this.river.points.length < 2) return;
        
        ctx.strokeStyle = this.colors.river;
        ctx.lineWidth = this.river.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.river.points[0].x, this.river.points[0].y);
        for (let i = 1; i < this.river.points.length; i++) {
            ctx.lineTo(this.river.points[i].x, this.river.points[i].y);
        }
        ctx.stroke();
        
        ctx.strokeStyle = this.colors.riverDeep;
        ctx.lineWidth = this.river.width * 0.6;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
    },
    
    renderWalls(ctx, camera) {
        for (const wall of this.walls) {
            if (wall.x < -100 || wall.y < -100) continue;
            if (!camera.isVisible(wall.x + (wall.width || 0) / 2, wall.y + (wall.height || 0) / 2, 300)) continue;
            
            if (wall.type === 'rect') {
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.fillRect(wall.x + 6, wall.y + 6, wall.width, wall.height);
                
                // Main wall
                ctx.fillStyle = this.colors.wall;
                ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
                
                // Highlight top-left
                ctx.fillStyle = this.colors.wallHighlight;
                ctx.fillRect(wall.x, wall.y, wall.width, Math.min(12, wall.height));
                ctx.fillRect(wall.x, wall.y, Math.min(12, wall.width), wall.height);
                
                // Dark bottom-right
                ctx.fillStyle = this.colors.wallDark;
                ctx.fillRect(wall.x, wall.y + wall.height - 8, wall.width, 8);
                ctx.fillRect(wall.x + wall.width - 8, wall.y, 8, wall.height);
            }
        }
    },
    
    /**
     * Render brushes - Rectangular only
     */
    renderBrushes(ctx, camera) {
        for (const brush of this.brushes) {
            if (!camera.isVisible(brush.x + brush.width / 2, brush.y + brush.height / 2, Math.max(brush.width, brush.height))) continue;
            
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(brush.x + 4, brush.y + 4, brush.width, brush.height);
            
            // Main brush
            ctx.fillStyle = this.colors.brush;
            ctx.fillRect(brush.x, brush.y, brush.width, brush.height);
            
            // Inner lighter area
            ctx.fillStyle = this.colors.brushLight;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(
                brush.x + brush.width * 0.15,
                brush.y + brush.height * 0.15,
                brush.width * 0.7,
                brush.height * 0.7
            );
            ctx.globalAlpha = 1;
            
            // Grass blade patterns
            this.renderRectangularGrassPattern(ctx, brush);
        }
    },
    
    /**
     * Render grass pattern for rectangular brush
     */
    renderRectangularGrassPattern(ctx, brush) {
        ctx.fillStyle = this.colors.brushDark;
        
        const bladeRows = Math.floor(brush.height / 30);
        const bladeCols = Math.floor(brush.width / 30);
        
        for (let row = 0; row < bladeRows; row++) {
            for (let col = 0; col < bladeCols; col++) {
                const bx = brush.x + 15 + col * 30 + (row % 2) * 15;
                const by = brush.y + 15 + row * 30;
                
                if (bx < brush.x + brush.width - 10 && by < brush.y + brush.height - 10) {
                    ctx.beginPath();
                    ctx.moveTo(bx, by + 10);
                    ctx.lineTo(bx - 4, by);
                    ctx.lineTo(bx + 4, by);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    },
    
    renderBases(ctx, camera) {
        // Blue base
        if (camera.isVisible(this.blueBase.healZone.x, this.blueBase.healZone.y, this.blueBase.healZone.radius + 200)) {
            ctx.fillStyle = 'rgba(0, 100, 200, 0.15)';
            ctx.beginPath();
            ctx.arc(this.blueBase.healZone.x, this.blueBase.healZone.y, this.blueBase.healZone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            const blueGradient = ctx.createRadialGradient(
                this.blueBase.healZone.x, this.blueBase.healZone.y, 0,
                this.blueBase.healZone.x, this.blueBase.healZone.y, this.blueBase.healZone.radius
            );
            blueGradient.addColorStop(0, 'rgba(0, 200, 255, 0.4)');
            blueGradient.addColorStop(0.5, 'rgba(0, 150, 255, 0.2)');
            blueGradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
            
            ctx.fillStyle = blueGradient;
            ctx.beginPath();
            ctx.arc(this.blueBase.healZone.x, this.blueBase.healZone.y, this.blueBase.healZone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = CONFIG.colors.blueTeam;
            ctx.lineWidth = 3;
            ctx.setLineDash([15, 10]);
            ctx.lineDashOffset = -Date.now() / 50;
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.font = '30px Arial';
            ctx.fillStyle = 'rgba(0, 200, 255, 0.6)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💚', this.blueBase.healZone.x, this.blueBase.healZone.y);
        }
        
        // Red base
        if (camera.isVisible(this.redBase.healZone.x, this.redBase.healZone.y, this.redBase.healZone.radius + 200)) {
            ctx.fillStyle = 'rgba(200, 50, 50, 0.15)';
            ctx.beginPath();
            ctx.arc(this.redBase.healZone.x, this.redBase.healZone.y, this.redBase.healZone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            const redGradient = ctx.createRadialGradient(
                this.redBase.healZone.x, this.redBase.healZone.y, 0,
                this.redBase.healZone.x, this.redBase.healZone.y, this.redBase.healZone.radius
            );
            redGradient.addColorStop(0, 'rgba(255, 100, 100, 0.4)');
            redGradient.addColorStop(0.5, 'rgba(255, 50, 50, 0.2)');
            redGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = redGradient;
            ctx.beginPath();
            ctx.arc(this.redBase.healZone.x, this.redBase.healZone.y, this.redBase.healZone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = CONFIG.colors.redTeam;
            ctx.lineWidth = 3;
            ctx.setLineDash([15, 10]);
            ctx.lineDashOffset = -Date.now() / 50;
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.font = '30px Arial';
            ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💚', this.redBase.healZone.x, this.redBase.healZone.y);
        }
    },
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameMap;
}
