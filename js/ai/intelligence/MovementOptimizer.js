/**
 * ========================================
 * Movement Optimizer
 * ========================================
 * Handles advanced movement, pathfinding, and positioning
 */

class MovementOptimizer {
    constructor(controller) {
        this.controller = controller;
        this.path = [];
        this.pathIndex = 0;
        this.lastPosition = { x: 0, y: 0 };
        this.stuckTimer = 0;
        this.stuckCount = 0;
        this.lastStuckCheck = 0;
        this.randomOffset = { x: 0, y: 0 };
        this.waypoints = [];
        this.currentWaypointIndex = 0;
        
        // Movement state
        this.movementState = {
            isMoving: false,
            targetPosition: null,
            movementMode: 'normal', // normal, dodge, retreat, chase
            pathQuality: 'none'
        };
    }
    
    initialize() {
        this.resetMovementState();
    }
    
    resetMovementState() {
        this.path = [];
        this.pathIndex = 0;
        this.waypoints = [];
        this.currentWaypointIndex = 0;
        this.randomOffset = { x: 0, y: 0 };
        this.stuckTimer = 0;
        this.stuckCount = 0;
        
        this.movementState = {
            isMoving: false,
            targetPosition: null,
            movementMode: 'normal',
            pathQuality: 'none'
        };
    }
    
    update(deltaTime) {
        this.checkStuck(deltaTime);
        this.updatePathFollowing();
    }
    
    updateMovement(deltaTime) {
        this.checkStuck(deltaTime);
        this.updatePathFollowing();
        
        // Apply movement based on current state
        if (this.movementState.isMoving && this.movementState.targetPosition) {
            this.moveTowardsTarget(this.movementState.targetPosition);
        }
    }
    
    checkStuck(deltaTime) {
        const now = Date.now();
        if (now - this.lastStuckCheck < CONFIG.aiMovement.stuckDetectionInterval) {
            return;
        }
        
        this.lastStuckCheck = now;
        
        const hero = this.controller.hero;
        const distMoved = Utils.distance(
            hero.x, hero.y,
            this.lastPosition.x, this.lastPosition.y
        );
        
        // If barely moved but should be moving
        if (distMoved < CONFIG.aiMovement.stuckDistanceThreshold && 
            (Math.abs(hero.vx) > 10 || Math.abs(hero.vy) > 10)) {
            this.stuckTimer += deltaTime;
        } else {
            this.stuckTimer = 0;
            this.stuckCount = 0;
        }
        
        // If stuck for too long, take action
        if (this.stuckTimer > this.controller.getDifficultySetting('unstuckThreshold')) {
            this.handleStuck();
            this.stuckTimer = 0;
            this.stuckCount++;
        }
        
        // Update last position
        this.lastPosition = { x: hero.x, y: hero.y };
    }
    
    handleStuck() {
        const hero = this.controller.hero;
        
        // Generate random offset to escape
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 200;
        
        this.randomOffset = {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
        };
        
        // If stuck multiple times, try more drastic measures
        if (this.stuckCount > CONFIG.aiMovement.stuckRecoverySteps) {
            // Try to use escape abilities
            this.tryEscapeDash();
            
            // Recalculate path
            if (this.movementState.targetPosition) {
                this.calculatePathToPosition(this.movementState.targetPosition);
            }
        }
    }
    
    tryEscapeDash() {
        const hero = this.controller.hero;
        
        for (const key of ['e', 'r', 'q']) {
            const ability = hero.heroData.abilities[key];
            if (!ability) continue;
            
            if (ability.type === 'dash' || ability.type === 'blink') {
                if (hero.abilityCooldowns[key] <= 0 && hero.abilityLevels[key] > 0) {
                    // Dash towards a safe direction
                    const safeAngle = this.findSafeDirection();
                    if (safeAngle !== null) {
                        const dashX = hero.x + Math.cos(safeAngle) * 300;
                        const dashY = hero.y + Math.sin(safeAngle) * 300;
                        hero.useAbility(key, dashX, dashY);
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    findSafeDirection() {
        const hero = this.controller.hero;
        const testAngles = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4];
        
        for (const angle of testAngles) {
            const testX = hero.x + Math.cos(angle) * 200;
            const testY = hero.y + Math.sin(angle) * 200;
            
            if (!GameMap.checkWallCollision(testX, testY, hero.radius)) {
                return angle;
            }
        }
        
        return null;
    }
    
    moveTowardsTarget(targetPosition) {
        const hero = this.controller.hero;
        
        // Apply waypoint-based movement if we have a path
        if (this.waypoints.length > 0) {
            const currentWaypoint = this.waypoints[this.currentWaypointIndex];
            const distToWaypoint = Utils.distance(hero.x, hero.y, currentWaypoint.x, currentWaypoint.y);
            
            if (distToWaypoint < CONFIG.aiMovement.waypointDistance) {
                this.currentWaypointIndex++;
                if (this.currentWaypointIndex >= this.waypoints.length) {
                    this.waypoints = [];
                    this.currentWaypointIndex = 0;
                }
            } else {
                this.moveTowards(currentWaypoint.x, currentWaypoint.y);
                return;
            }
        }
        
        // Direct movement to target
        this.moveTowards(targetPosition.x, targetPosition.y);
    }
    
    moveTowards(targetX, targetY) {
        const hero = this.controller.hero;
        
        // Apply random offset if stuck
        const finalX = targetX + this.randomOffset.x;
        const finalY = targetY + this.randomOffset.y;
        
        let angle = Utils.angleBetweenPoints(hero.x, hero.y, finalX, finalY);
        
        // Check if direct path is blocked
        const testDist = 50;
        const testX = hero.x + Math.cos(angle) * testDist;
        const testY = hero.y + Math.sin(angle) * testDist;
        
        if (GameMap.checkWallCollision(testX, testY, hero.radius)) {
            // Try alternative angles
            const alternativeAngles = [
                angle + Math.PI / 4,
                angle - Math.PI / 4,
                angle + Math.PI / 2,
                angle - Math.PI / 2,
                angle + Math.PI * 3 / 4,
                angle - Math.PI * 3 / 4,
            ];
            
            for (const altAngle of alternativeAngles) {
                const altX = hero.x + Math.cos(altAngle) * testDist;
                const altY = hero.y + Math.sin(altAngle) * testDist;
                
                if (!GameMap.checkWallCollision(altX, altY, hero.radius)) {
                    angle = altAngle;
                    break;
                }
            }
        }
        
        let speed = hero.stats.moveSpeed * this.controller.getDifficultySetting('movementSpeed');
        
        // Apply movement debuffs
        if (Array.isArray(hero.debuffs)) {
            const slow = hero.debuffs.find(d => d.type === 'slow');
            if (slow) {
                speed *= (1 - slow.percent / 100);
            }
        }
        
        hero.vx = Math.cos(angle) * speed;
        hero.vy = Math.sin(angle) * speed;
        hero.facingAngle = angle;
        
        // Update movement state
        this.movementState.isMoving = true;
        this.movementState.targetPosition = { x: finalX, y: finalY };
    }
    
    calculatePathToPosition(targetPosition) {
        // Use A* pathfinding
        const start = { x: this.controller.hero.x, y: this.controller.hero.y };
        const end = { x: targetPosition.x, y: targetPosition.y };
        
        this.waypoints = this.controller.systems.pathFinding.findPath(start, end, this.controller.hero.radius);
        this.currentWaypointIndex = 0;
        
        // Update path quality based on waypoints
        if (this.waypoints.length > 0) {
            this.movementState.pathQuality = this.waypoints.length <= 3 ? 'direct' : 'complex';
        } else {
            this.movementState.pathQuality = 'failed';
        }
    }
    
    updatePathFollowing() {
        // If we don't have waypoints but should be moving, calculate path
        if (this.movementState.isMoving && this.movementState.targetPosition && this.waypoints.length === 0) {
            this.calculatePathToPosition(this.movementState.targetPosition);
        }
    }
    
    setMovementTarget(targetPosition, movementMode = 'normal') {
        this.movementState.isMoving = true;
        this.movementState.targetPosition = targetPosition;
        this.movementState.movementMode = movementMode;
        
        // Calculate path immediately
        this.calculatePathToPosition(targetPosition);
    }
    
    clearMovementTarget() {
        this.movementState.isMoving = false;
        this.movementState.targetPosition = null;
        this.waypoints = [];
        this.currentWaypointIndex = 0;
        
        // Stop movement
        this.controller.hero.vx = 0;
        this.controller.hero.vy = 0;
    }
    
    getMovementState() {
        return this.movementState;
    }
    
    isMoving() {
        return this.movementState.isMoving;
    }
    
    getCurrentPath() {
        return this.waypoints;
    }
    
    // Deadlock detection and prevention
    detectDeadlock() {
        // Check if we've been trying to reach the same target for too long
        if (this.movementState.targetPosition && this.movementState.isMoving) {
            const timeStuck = Date.now() - this.lastStuckCheck;
            if (timeStuck > CONFIG.aiMovement.deadlockDetectionTime) {
                // Try alternative recovery methods
                this.handleDeadlock();
                return true;
            }
        }
        return false;
    }
    
    handleDeadlock() {
        const recoveryMode = CONFIG.aiMovement.deadlockRecoveryMode;
        
        switch (recoveryMode) {
            case 'jump':
                this.tryEscapeDash();
                break;
            case 'retreat':
                this.retreatToSafety();
                break;
            case 'dodge':
                this.dodgeToSide();
                break;
        }
    }
    
    retreatToSafety() {
        const basePoint = GameMap.getSpawnPoint(this.controller.hero.team);
        this.setMovementTarget(basePoint, 'retreat');
    }
    
    dodgeToSide() {
        const hero = this.controller.hero;
        const angle = Utils.angleBetweenPoints(hero.x, hero.y, 
            this.movementState.targetPosition.x, this.movementState.targetPosition.y);
        
        // Dodge perpendicular to movement direction
        const dodgeAngle = angle + (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2);
        const dodgeX = hero.x + Math.cos(dodgeAngle) * 200;
        const dodgeY = hero.y + Math.sin(dodgeAngle) * 200;
        
        this.setMovementTarget({ x: dodgeX, y: dodgeY }, 'dodge');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovementOptimizer;
}