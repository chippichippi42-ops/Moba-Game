/**
 * ========================================
 * MOBA Arena - Main Game Controller
 * ========================================
 * Game loop, initialization, và overall control
 */

const Game = {
    // Canvas and context
    canvas: null,
    ctx: null,
    
    // Game state
    isRunning: false,
    isPaused: false,
    isGameOver: false,
    
    // Timing
    lastTime: 0,
    deltaTime: 0,
    gameTime: 0,
    fps: 0,
    frameCount: 0,
    fpsTime: 0,
    
    // Game settings
    settings: {
        playerHero: null,
        playerSpell: null,
        allyDifficulty: 'normal',
        enemyDifficulty: 'normal',
    },
    
    // Entity lists (for easy access)
    entities: [],
    
    /**
     * Initialize game
     */
    async init(settings) {
        console.log('Initializing MOBA Arena...');

        // Store settings
        this.settings = { ...this.settings, ...settings };

        // Get canvas
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }

        this.ctx = this.canvas.getContext('2d');

        // Setup canvas
        this.setupCanvas();

        // Initialize systems
        await this.initializeSystems();

        // Create game entities
        this.createGameEntities();

        // Reset state
        this.isRunning = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameTime = 0;

        console.log('Game initialized successfully!');
    },
    
    /**
     * Setup canvas for HiDPI
     */
    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // Set actual size in memory
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale context to match DPR
        this.ctx.scale(dpr, dpr);
        
        // Set display size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Handle resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 200));
    },
    
    /**
     * Handle window resize
     */
    handleResize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        
        Camera.resize(rect.width, rect.height);
    },
    
    /**
     * Initialize all game systems
     */
    async initializeSystems() {
        // Initialize map first
        GameMap.init();

        // Initialize camera
        Camera.init(this.canvas);

        // Initialize managers
        HeroManager.init();
        TowerManager.init();
        MinionManager.init();
        CreatureManager.init();
        ProjectileManager.init();
        EffectManager.init();
        AIManager.init();
        await AIManager.initializeAI();

        // Initialize input
        Input.init();

        // Initialize UI
        UI.init();

        // Initialize minimap
        Minimap.init();

        // Initialize screens
        Screens.init();
    },
    
    /**
     * Create game entities
     */
    createGameEntities() {
        // Clear all existing entities to prevent orphaned bots
        HeroManager.clear();
        AIManager.clear();
        
        // Create player hero
        const player = HeroManager.createHero(
            this.settings.playerHero,
            CONFIG.teams.BLUE,
            true,
            this.settings.playerName
        );
        player.spell = this.settings.playerSpell;
        
        Camera.lock(player);
        
        const usedHeroes = [this.settings.playerHero];
        
        // Create ally AI heroes
        for (let i = 0; i < 2; i++) {
            const available = Screens.getAvailableHeroes(usedHeroes);
            if (available.length > 0) {
                const heroData = Utils.randomItem(available);
                const aiName = this.settings.aiNames?.allies?.[i] || `Ally${i + 1}`;
                
                const hero = HeroManager.createHero(heroData.id, CONFIG.teams.BLUE, false, aiName);
                hero.spell = Utils.randomItem(Object.keys(CONFIG.spells));
                usedHeroes.push(heroData.id);
                
                AIManager.createController(hero, this.settings.allyDifficulty);
            }
        }
        
        // Create enemy AI heroes
        const enemyUsedHeroes = [];
        for (let i = 0; i < 3; i++) {
            const available = Screens.getAvailableHeroes(enemyUsedHeroes);
            if (available.length > 0) {
                const heroData = Utils.randomItem(available);
                const aiName = this.settings.aiNames?.enemies?.[i] || `Enemy${i + 1}`;
                
                const hero = HeroManager.createHero(heroData.id, CONFIG.teams.RED, false, aiName);
                hero.spell = Utils.randomItem(Object.keys(CONFIG.spells));
                enemyUsedHeroes.push(heroData.id);
                
                AIManager.createController(hero, this.settings.enemyDifficulty);
            }
        }
    },
    
    /**
     * Start game
     */
    start() {
        console.log('Starting game...');
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        
        // Start game loop
        this.gameLoop(this.lastTime);
    },
    
    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent huge jumps
        this.deltaTime = Math.min(this.deltaTime, 100);
        
        // FPS calculation
        this.frameCount++;
        this.fpsTime += this.deltaTime;
        if (this.fpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = 0;
            UI.updateFPS(this.fps);
        }
        
        // Update and render if not paused
        if (!this.isPaused) {
            this.gameTime += this.deltaTime;
            this.update(this.deltaTime);
        }
        
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    },
    
    /**
     * Update game state
     */
    update(deltaTime) {
        // Get all entities
        this.updateEntityList();
        
        // Update systems in order
        HeroManager.update(deltaTime, this.entities);
        TowerManager.update(deltaTime, this.entities);
        MinionManager.update(deltaTime, this.entities);
        CreatureManager.update(deltaTime, this.entities);
        ProjectileManager.update(deltaTime, this.entities);
        EffectManager.update(deltaTime);
        AIManager.update(deltaTime, this.entities);
        
        // Update camera
        Camera.update(deltaTime);
        
        // Update minimap
        Minimap.update(deltaTime);
        
        // Update UI
        UI.update(deltaTime);
        
        // Update input state
        Input.update();
        
        // Apply mobile joystick input
        if (Input.isMobile) {
            Input.applyJoystickToPlayer();
        }
        
        // Check game over conditions
        this.checkGameOver();
    },
    
    /**
     * Update entity list
     */
    updateEntityList() {
        this.entities = [
            ...HeroManager.heroes,
            ...TowerManager.towers,
            ...MinionManager.minions,
            ...CreatureManager.creatures,
        ];
    },
    
    /**
     * Render game
     */
    render() {
        // Clear canvas
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, rect.width, rect.height);
        
        // Apply camera transform
        Camera.applyTransform(this.ctx);
        
        // Render world
        this.renderWorld();
        
        // Render attack range indicator (UI element but in world space)
        UI.renderAttackRange(this.ctx);
        
        // Restore transform
        Camera.restoreTransform(this.ctx);
        
        // Render minimap
        Minimap.render();
    },
    
    /**
     * Render game world
     */
    renderWorld() {
        // Render map
        GameMap.render(this.ctx, Camera);
        
        // Render towers
        TowerManager.render(this.ctx);
        
        // Render projectiles (zones first)
        ProjectileManager.render(this.ctx);
        
        // Render minions
        MinionManager.render(this.ctx);
        
        // Render creatures
        CreatureManager.render(this.ctx);
        
        // Render heroes
        HeroManager.render(this.ctx);
        
        // Render effects
        EffectManager.render(this.ctx);
    },
    
    /**
     * Pause game - UPDATED
     */
    pause() {
        this.isPaused = true;
        Screens.showPause(); // Screens sẽ tự ẩn UI
    },
    
    /**
     * Resume game
     */
    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
    },
    
    /**
     * Stop game
     */
    stop() {
        this.isRunning = false;
        this.cleanup();
    },
    
    /**
     * Cleanup game state
     */
    cleanup() {
        HeroManager.clear();
        TowerManager.clear();
        MinionManager.clear();
        CreatureManager.clear();
        ProjectileManager.clear();
        EffectManager.clear();
        AIManager.clear();
        Combat.clear();
        UI.reset();
        Camera.reset();
    },
    
    /**
     * Check game over conditions
     */
    checkGameOver() {
        if (this.isGameOver) return;
        
        // Check if main tower is destroyed
        const blueMain = TowerManager.towers.find(t => 
            t.team === CONFIG.teams.BLUE && t.towerType === 'main'
        );
        const redMain = TowerManager.towers.find(t => 
            t.team === CONFIG.teams.RED && t.towerType === 'main'
        );
        
        if (blueMain && !blueMain.isAlive) {
            this.endGame(false);
        } else if (redMain && !redMain.isAlive) {
            this.endGame(true);
        }
    },
    
    /**
     * Called when main tower is destroyed
     */
    onMainTowerDestroyed(losingTeam) {
        const won = losingTeam !== CONFIG.teams.BLUE;
        this.endGame(won);
    },
    
    /**
     * End game
     */
    endGame(won) {
        this.isGameOver = true;
        this.isPaused = true;
        
        // Show game over screen
        UI.hideIngameUI();
        Screens.showGameOver(won);
        
        console.log(won ? 'Victory!' : 'Defeat!');
    },
    
    /**
     * Get all entities
     */
    getAllEntities() {
        return this.entities;
    },
    
    /**
     * Get team heroes
     */
    getTeamHeroes(team) {
        return HeroManager.getTeamHeroes(team);
    },
    
    /**
     * Get entity by ID
     */
    getEntityById(id) {
        return this.entities.find(e => e.id === id);
    },
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('MOBA Arena loaded!');
    
    // Initialize screens (this will show the start screen)
    Screens.init();
    UI.init();
    Input.init();
    
    // Draw initial canvas background
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        // Draw background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, rect.width, rect.height);
        
        // Draw title effect
        const gradient = ctx.createRadialGradient(
            rect.width / 2, rect.height / 2, 0,
            rect.width / 2, rect.height / 2, rect.width / 2
        );
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.05)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rect.width, rect.height);
        
        // Draw grid pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        
        const gridSize = 50;
        for (let x = 0; x < rect.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, rect.height);
            ctx.stroke();
        }
        for (let y = 0; y < rect.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(rect.width, y);
            ctx.stroke();
        }
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
