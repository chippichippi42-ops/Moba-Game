/**
 * ========================================
 * MOBA Arena - Input System
 * ========================================
 * Xử lý keyboard, mouse, và touch input
 */

const Input = {
    // Keyboard state
    keys: {},
    keysJustPressed: {},
    keysJustReleased: {},
    
    // Mouse state
    mouseX: 0,
    mouseY: 0,
    mouseWorldX: 0,
    mouseWorldY: 0,
    mouseButtons: {},
    mouseButtonsJustPressed: {},
    
    // Touch state
    touches: {},
    touchJoystick: { active: false, x: 0, y: 0, dx: 0, dy: 0 },
    
    // Mobile detection
    isMobile: false,
    
    // Event listeners storage
    listeners: [],
    
    /**
     * Khởi tạo input system
     */
    init() {
        // Detect mobile
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Keyboard events
        this.addListener(window, 'keydown', this.onKeyDown.bind(this));
        this.addListener(window, 'keyup', this.onKeyUp.bind(this));
        
        // Mouse events
        this.addListener(window, 'mousemove', this.onMouseMove.bind(this));
        this.addListener(window, 'mousedown', this.onMouseDown.bind(this));
        this.addListener(window, 'mouseup', this.onMouseUp.bind(this));
        this.addListener(window, 'contextmenu', e => e.preventDefault());
        
        // Touch events
        if (this.isMobile) {
            this.addListener(window, 'touchstart', this.onTouchStart.bind(this));
            this.addListener(window, 'touchmove', this.onTouchMove.bind(this));
            this.addListener(window, 'touchend', this.onTouchEnd.bind(this));
            
            // Show mobile controls
            this.showMobileControls();
        }
        
        // Prevent default on game canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            this.addListener(canvas, 'contextmenu', e => e.preventDefault());
        }
    },
    
    /**
     * Add event listener with tracking
     */
    addListener(target, event, handler) {
        target.addEventListener(event, handler);
        this.listeners.push({ target, event, handler });
    },
    
    /**
     * Remove all listeners
     */
    removeAllListeners() {
        for (const { target, event, handler } of this.listeners) {
            target.removeEventListener(event, handler);
        }
        this.listeners = [];
    },
    
    /**
     * Update input state (call at end of frame)
     */
    update() {
        // Clear just pressed/released states
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        this.mouseButtonsJustPressed = {};
        
        // Update world mouse position
        if (typeof Camera !== 'undefined') {
            const worldPos = Camera.screenToWorld(this.mouseX, this.mouseY);
            this.mouseWorldX = worldPos.x;
            this.mouseWorldY = worldPos.y;
        }
    },
    
    // === KEYBOARD ===
    
    /**
     * Handle key down
     */
    onKeyDown(e) {
        const key = e.key;
        
        if (!this.keys[key]) {
            this.keysJustPressed[key] = true;
        }
        this.keys[key] = true;
        
        // Handle game controls
        this.handleGameInput(e);
    },
    
	/**
	 * Handle key up - FIX: Đảm bảo reset state
	 */
	onKeyUp(e) {
		const key = e.key;
		
		if (this.keys[key]) {
			this.keysJustReleased[key] = true;
		}
		this.keys[key] = false;
		
		// Cũng reset cho lowercase/uppercase
		this.keys[key.toLowerCase()] = false;
		this.keys[key.toUpperCase()] = false;
	},
    
	/**
	 * Handle game-specific input
	 */
	handleGameInput(e) {
		const gameKeys = ['w', 'a', 's', 'd', 'q', 'e', 'r', 't', 'f', 'p', ' ', 'Escape'];
		if (gameKeys.includes(e.key.toLowerCase()) || gameKeys.includes(e.key)) {
			e.preventDefault();
		}
		
		// ESC key - pause game (xử lý riêng, không cần game đang chạy)
		if (e.key === 'Escape') {
			if (Game.isRunning && !Game.isPaused && !Game.isGameOver) {
				Game.pause();
				return;
			}
		}
		
		if (typeof Game === 'undefined' || !Game.isRunning) return;
		
		const player = HeroManager.player;
		if (!player || !player.isAlive) return;
		
		switch (e.key.toLowerCase()) {
			case 'q':
				player.useAbility('q', this.mouseWorldX, this.mouseWorldY);
				break;
			case 'e':
				player.useAbility('e', this.mouseWorldX, this.mouseWorldY);
				break;
			case 'r':
				player.useAbility('r', this.mouseWorldX, this.mouseWorldY);
				break;
			case 't':
				player.useAbility('t', this.mouseWorldX, this.mouseWorldY);
				break;
			case 'f':
				player.useSpell(this.mouseWorldX, this.mouseWorldY);
				break;
			case ' ':
				const target = Combat.getClosestEnemy(player, player.stats.attackRange + 100);
				if (target) {
					player.basicAttack(target);
				}
				break;
			case 'p':
				UI.toggleStatsPanel();
				break;
			case 'y':
				Camera.toggleLock();
				break;
		}
		
		// Level up abilities
		if (e.ctrlKey) {
			switch (e.key.toLowerCase()) {
				case 'q':
					player.levelUpAbility('q');
					break;
				case 'e':
					player.levelUpAbility('e');
					break;
				case 'r':
					player.levelUpAbility('r');
					break;
				case 't':
					player.levelUpAbility('t');
					break;
			}
		}
	},
    

	/**
	 * Check if key is currently down - FIX: Check cả lowercase
	 */
	isKeyDown(key) {
		return this.keys[key] === true || this.keys[key.toLowerCase()] === true || this.keys[key.toUpperCase()] === true;
	},
    
    /**
     * Check if key was just pressed this frame
     */
    isKeyJustPressed(key) {
        return this.keysJustPressed[key] === true;
    },
    
    /**
     * Check if key was just released this frame
     */
    isKeyJustReleased(key) {
        return this.keysJustReleased[key] === true;
    },
    
    // === MOUSE ===
    
    /**
     * Handle mouse move
     */
    onMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    },
    
    /**
     * Handle mouse down
     */
    onMouseDown(e) {
        this.mouseButtons[e.button] = true;
        this.mouseButtonsJustPressed[e.button] = true;
        
        // Check minimap click
        if (Minimap.isPointOnMinimap(e.clientX, e.clientY)) {
            Minimap.handleClick(e.clientX, e.clientY);
            return;
        }
        
        // Right click - move or attack
        if (e.button === 2 && Game.isRunning) {
            const player = HeroManager.player;
            if (!player || !player.isAlive) return;
            
            // Check for attack target at mouse position
            const worldPos = Camera.screenToWorld(e.clientX, e.clientY);
            const target = this.getTargetAtPosition(worldPos.x, worldPos.y);
            
            if (target && target.team !== player.team) {
                player.basicAttack(target);
            }
        }
    },
    
    /**
     * Handle mouse up
     */
    onMouseUp(e) {
        this.mouseButtons[e.button] = false;
    },
    
    /**
     * Get target at world position
     */
    getTargetAtPosition(worldX, worldY) {
        const entities = Game.getAllEntities();
        
        for (const entity of entities) {
            if (!entity.isAlive) continue;
            
            const dist = Utils.distance(worldX, worldY, entity.x, entity.y);
            if (dist <= (entity.radius || 30)) {
                return entity;
            }
        }
        
        return null;
    },
    
    /**
     * Check if mouse button is down
     */
    isMouseButtonDown(button) {
        return this.mouseButtons[button] === true;
    },
    
    /**
     * Check if mouse button was just pressed
     */
    isMouseButtonJustPressed(button) {
        return this.mouseButtonsJustPressed[button] === true;
    },
    
    // === TOUCH ===
    
    /**
     * Show mobile controls
     */
    showMobileControls() {
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.classList.remove('hidden');
        }
        
        // Setup joystick
        this.setupJoystick();
        
        // Setup skill buttons
        this.setupMobileSkills();
    },
    
    /**
     * Setup virtual joystick
     */
    setupJoystick() {
        const joystick = document.getElementById('joystick');
        const joystickInner = joystick?.querySelector('.joystick-inner');
        
        if (!joystick || !joystickInner) return;
        
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const maxDist = rect.width / 2 - joystickInner.offsetWidth / 2;
        
        const handleTouch = (e) => {
            const touch = e.touches[0];
            const x = touch.clientX - rect.left - centerX;
            const y = touch.clientY - rect.top - centerY;
            
            // Clamp to circle
            let dist = Math.sqrt(x * x + y * y);
            let clampedX = x;
            let clampedY = y;
            
            if (dist > maxDist) {
                clampedX = (x / dist) * maxDist;
                clampedY = (y / dist) * maxDist;
                dist = maxDist;
            }
            
            // Update joystick visual
            joystickInner.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
            
            // Update input state
            this.touchJoystick.active = true;
            this.touchJoystick.x = clampedX / maxDist;
            this.touchJoystick.y = clampedY / maxDist;
        };
        
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTouch(e);
        });
        
        joystick.addEventListener('touchmove', (e) => {
            e.preventDefault();
            handleTouch(e);
        });
        
        joystick.addEventListener('touchend', () => {
            joystickInner.style.transform = 'translate(-50%, -50%)';
            this.touchJoystick.active = false;
            this.touchJoystick.x = 0;
            this.touchJoystick.y = 0;
        });
    },
    
    /**
     * Setup mobile skill buttons
     */
    setupMobileSkills() {
        const skillButtons = document.querySelectorAll('.mobile-skill');
        
        skillButtons.forEach(button => {
            const skill = button.dataset.skill;
            
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                
                const player = HeroManager.player;
                if (!player || !player.isAlive) return;
                
                // Get touch position for targeting
                const touch = e.touches[0];
                const worldPos = Camera.screenToWorld(touch.clientX, touch.clientY);
                
                switch (skill) {
                    case 'q':
                    case 'e':
                    case 'r':
                    case 't':
                        // Use facing direction for abilities
                        const targetX = player.x + Math.cos(player.facingAngle) * 500;
                        const targetY = player.y + Math.sin(player.facingAngle) * 500;
                        player.useAbility(skill, targetX, targetY);
                        break;
                    case 'f':
                        player.useSpell(worldPos.x, worldPos.y);
                        break;
                    case 'space':
                        const target = Combat.getClosestEnemy(player, player.stats.attackRange + 100);
                        if (target) {
                            player.basicAttack(target);
                        }
                        break;
                }
            });
        });
    },
    
    /**
     * Handle touch start
     */
    onTouchStart(e) {
        for (const touch of e.changedTouches) {
            this.touches[touch.identifier] = {
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY,
            };
        }
    },
    
    /**
     * Handle touch move
     */
    onTouchMove(e) {
        for (const touch of e.changedTouches) {
            if (this.touches[touch.identifier]) {
                this.touches[touch.identifier].x = touch.clientX;
                this.touches[touch.identifier].y = touch.clientY;
            }
        }
        
        // Update mouse position for touch
        if (e.touches.length > 0) {
            this.mouseX = e.touches[0].clientX;
            this.mouseY = e.touches[0].clientY;
        }
    },
    
    /**
     * Handle touch end
     */
    onTouchEnd(e) {
        for (const touch of e.changedTouches) {
            delete this.touches[touch.identifier];
        }
    },
    
    /**
     * Get joystick input for movement
     */
    getJoystickInput() {
        if (this.touchJoystick.active) {
            return {
                x: this.touchJoystick.x,
                y: this.touchJoystick.y,
            };
        }
        return { x: 0, y: 0 };
    },
    
    /**
     * Apply joystick input to player movement
     */
    applyJoystickToPlayer() {
        if (!this.touchJoystick.active) return;
        if (!HeroManager.player || !HeroManager.player.isAlive) return;
        
        const player = HeroManager.player;
        const input = this.getJoystickInput();
        
        player.vx = input.x * player.stats.moveSpeed;
        player.vy = input.y * player.stats.moveSpeed;
        
        if (input.x !== 0 || input.y !== 0) {
            player.facingAngle = Math.atan2(input.y, input.x);
        }
    },
    
    /**
     * Reset input state
     */
    reset() {
        this.keys = {};
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        this.mouseButtons = {};
        this.mouseButtonsJustPressed = {};
        this.touches = {};
        this.touchJoystick = { active: false, x: 0, y: 0, dx: 0, dy: 0 };
    },
    
    /**
     * Cleanup
     */
    destroy() {
        this.removeAllListeners();
        this.reset();
    },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Input;
}