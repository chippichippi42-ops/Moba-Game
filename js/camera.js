/**
 * ========================================
 * MOBA Arena - Camera System
 * ========================================
 * Quản lý camera, viewport, và rendering position
 */

const Camera = {
    // Camera position (top-left corner of viewport)
    x: 0,
    y: 0,
    
    // Target position (for smooth following)
    targetX: 0,
    targetY: 0,
    
    // Viewport dimensions
    width: 0,
    height: 0,
    
    // Zoom settings
    zoom: CONFIG.camera.defaultZoom,
    targetZoom: CONFIG.camera.defaultZoom,
    
    // Camera settings
    smoothing: CONFIG.camera.smoothing,
    edgeScrollSpeed: CONFIG.camera.edgeScrollSpeed,
    edgeScrollMargin: CONFIG.camera.edgeScrollMargin,
    
    // Bounds
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
    
    // Shake effect
    shakeIntensity: 0,
    shakeDuration: 0,
    shakeOffset: { x: 0, y: 0 },
    
    // Lock target
    lockedTarget: null,
    isLocked: true,
    
    /**
     * Khởi tạo camera
     */
    init(canvas) {
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Set bounds based on map size
        this.updateBounds();
        
        // Center camera
        this.x = CONFIG.map.width / 2 - this.width / 2;
        this.y = CONFIG.map.height / 2 - this.height / 2;
        this.targetX = this.x;
        this.targetY = this.y;
    },
    
    /**
     * Cập nhật bounds
     */
    updateBounds() {
        const scaledWidth = this.width / this.zoom;
        const scaledHeight = this.height / this.zoom;
        
        // Allow some buffer outside map
        this.minX = -CONFIG.map.baseExtension;
        this.minY = -CONFIG.map.baseExtension;
        this.maxX = CONFIG.map.width - scaledWidth + CONFIG.map.baseExtension;
        this.maxY = CONFIG.map.height - scaledHeight + CONFIG.map.baseExtension;
    },
    
    /**
     * Update camera mỗi frame
     */
    update(deltaTime) {
        // Update shake
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            this.shakeOffset.x = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeOffset.y = (Math.random() - 0.5) * this.shakeIntensity;
        } else {
            this.shakeOffset.x = 0;
            this.shakeOffset.y = 0;
        }
        
        // Follow locked target
        if (this.lockedTarget && this.isLocked) {
            this.setTarget(this.lockedTarget.x, this.lockedTarget.y);
        }
        
        // Edge scrolling (when not locked)
        if (!this.isLocked && Input.mouseX !== undefined) {
            this.handleEdgeScroll(deltaTime);
        }
        
        // Smooth camera movement
        this.x = Utils.lerp(this.x, this.targetX, this.smoothing);
        this.y = Utils.lerp(this.y, this.targetY, this.smoothing);
        
        // Smooth zoom
        this.zoom = Utils.lerp(this.zoom, this.targetZoom, this.smoothing);
        
        // Clamp to bounds
        this.x = Utils.clamp(this.x, this.minX, this.maxX);
        this.y = Utils.clamp(this.y, this.minY, this.maxY);
        
        // Update bounds on zoom change
        this.updateBounds();
    },
    
    /**
     * Handle edge scrolling
     */
    handleEdgeScroll(deltaTime) {
        const speed = this.edgeScrollSpeed * deltaTime / 16;
        const margin = this.edgeScrollMargin;
        
        if (Input.mouseX < margin) {
            this.targetX -= speed;
        } else if (Input.mouseX > this.width - margin) {
            this.targetX += speed;
        }
        
        if (Input.mouseY < margin) {
            this.targetY -= speed;
        } else if (Input.mouseY > this.height - margin) {
            this.targetY += speed;
        }
    },
    
    /**
     * Set target position (center of screen)
     */
    setTarget(worldX, worldY) {
        const scaledWidth = this.width / this.zoom;
        const scaledHeight = this.height / this.zoom;
        
        this.targetX = worldX - scaledWidth / 2;
        this.targetY = worldY - scaledHeight / 2;
    },
    
    /**
     * Move camera to position immediately
     */
    moveTo(worldX, worldY) {
        this.setTarget(worldX, worldY);
        this.x = this.targetX;
        this.y = this.targetY;
    },
    
    /**
     * Lock camera to entity
     */
    lock(entity) {
        this.lockedTarget = entity;
        this.isLocked = true;
    },
    
    /**
     * Unlock camera
     */
    unlock() {
        this.isLocked = false;
    },
    
    /**
     * Toggle camera lock
     */
    toggleLock() {
        if (this.lockedTarget) {
            this.isLocked = !this.isLocked;
        }
    },
    
    /**
     * Set zoom level
     */
    setZoom(zoom) {
        this.targetZoom = Utils.clamp(zoom, CONFIG.camera.minZoom, CONFIG.camera.maxZoom);
    },
    
    /**
     * Zoom in/out
     */
    adjustZoom(delta) {
        this.setZoom(this.targetZoom + delta);
    },
    
    /**
     * Screen shake effect
     */
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    },
    
    /**
     * Convert world position to screen position
     */
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x) * this.zoom + this.shakeOffset.x,
            y: (worldY - this.y) * this.zoom + this.shakeOffset.y
        };
    },
    
    /**
     * Convert screen position to world position
     */
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.shakeOffset.x) / this.zoom + this.x,
            y: (screenY - this.shakeOffset.y) / this.zoom + this.y
        };
    },
    
    /**
     * Check if world position is visible on screen
     */
    isVisible(worldX, worldY, margin = 100) {
        const scaledWidth = this.width / this.zoom;
        const scaledHeight = this.height / this.zoom;
        
        return worldX >= this.x - margin &&
               worldX <= this.x + scaledWidth + margin &&
               worldY >= this.y - margin &&
               worldY <= this.y + scaledHeight + margin;
    },
    
    /**
     * Get visible world bounds
     */
    getVisibleBounds() {
        const scaledWidth = this.width / this.zoom;
        const scaledHeight = this.height / this.zoom;
        
        return {
            left: this.x,
            top: this.y,
            right: this.x + scaledWidth,
            bottom: this.y + scaledHeight,
            width: scaledWidth,
            height: scaledHeight
        };
    },
    
    /**
     * Apply camera transform to canvas context
     */
    applyTransform(ctx) {
        ctx.save();
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-this.x + this.shakeOffset.x / this.zoom, -this.y + this.shakeOffset.y / this.zoom);
    },
    
    /**
     * Restore canvas context
     */
    restoreTransform(ctx) {
        ctx.restore();
    },
    
    /**
     * Resize handler
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.updateBounds();
    },
    
    /**
     * Get camera center in world coordinates
     */
    getCenter() {
        const scaledWidth = this.width / this.zoom;
        const scaledHeight = this.height / this.zoom;
        
        return {
            x: this.x + scaledWidth / 2,
            y: this.y + scaledHeight / 2
        };
    },
    
    /**
     * Reset camera to default state
     */
    reset() {
        this.zoom = CONFIG.camera.defaultZoom;
        this.targetZoom = CONFIG.camera.defaultZoom;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffset = { x: 0, y: 0 };
        this.isLocked = true;
        this.lockedTarget = null;
    },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Camera;
}