/**
 * ========================================
 * MOBA Arena - Screen Management (Updated)
 * ========================================
 */

const Screens = {
    currentScreen: 'start',
    screens: {},
    previousScreen: null, // Thêm biến lưu màn hình trước đó
    
    // Selection state
    selectedHero: null,
    selectedSpell: 'flash',
    allyDifficulty: 'normal',
    enemyDifficulty: 'normal',
    playerName: CONFIG.game.defaultPlayerName,
    
    /**
     * Khởi tạo screens
     */
    init() {
        this.cacheScreens();
        this.setupEventListeners();
        this.populateHeroGrid();
        this.populateSpellGrid();
        this.loadPlayerName();
        this.loadHowToPlayContent();
    },
    
    /**
     * Cache screen elements
     */
    cacheScreens() {
        this.screens = {
            start: document.getElementById('startScreen'),
            pregame: document.getElementById('pregameScreen'),
            settings: document.getElementById('settingsScreen'),
            pause: document.getElementById('pauseScreen'),
            gameover: document.getElementById('gameOverScreen'),
        };
    },
    
    /**
     * Load player name from localStorage
     */
    loadPlayerName() {
        try {
            const saved = localStorage.getItem('mobaPlayerName');
            if (saved) {
                this.playerName = saved;
            }
        } catch (e) {
            console.warn('Failed to load player name');
        }
        
        // Update input if exists
        const nameInput = document.getElementById('playerNameInput');
        if (nameInput) {
            nameInput.value = this.playerName;
        }
    },
    
    /**
     * Save player name
     */
    savePlayerName(name) {
        this.playerName = name || CONFIG.game.defaultPlayerName;
        try {
            localStorage.setItem('mobaPlayerName', this.playerName);
        } catch (e) {
            console.warn('Failed to save player name');
        }
    },
    
    /**
     * Get random AI name
     */
    getRandomAIName(usedNames = []) {
        const available = CONFIG.aiNames.filter(n => !usedNames.includes(n));
        if (available.length === 0) {
            return 'Bot' + Math.floor(Math.random() * 1000);
        }
        return Utils.randomItem(available);
    },
    
    /**
     * Setup event listeners - UPDATED
     */
    setupEventListeners() {
        // Start screen
        document.getElementById('btnPlay')?.addEventListener('click', () => {
            const nameInput = document.getElementById('playerNameInput');
            if (nameInput) {
                this.savePlayerName(nameInput.value.trim());
            }
            this.showScreen('pregame');
            
            if (typeof AudioManager !== 'undefined') {
                AudioManager.resume();
            }
        });
        
        document.getElementById('btnSettings')?.addEventListener('click', () => {
            this.previousScreen = this.currentScreen;
            this.showScreen('settings');
        });
        
        document.getElementById('btnQuit')?.addEventListener('click', () => {
            alert('Cảm ơn bạn đã chơi MOBA Arena!');
        });
        
        document.getElementById('playerNameInput')?.addEventListener('change', (e) => {
            this.savePlayerName(e.target.value.trim());
        });
        
        // How To Play modal
        document.getElementById('btnHowToPlay')?.addEventListener('click', () => {
            this.showHowToPlayModal();
        });
        
        document.getElementById('btnCloseHowToPlay')?.addEventListener('click', () => {
            this.closeHowToPlayModal();
        });
        
        document.getElementById('howToPlayModal')?.querySelector('.modal-overlay')?.addEventListener('click', () => {
            this.closeHowToPlayModal();
        });
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('howToPlayModal');
                if (modal && modal.classList.contains('active')) {
                    this.closeHowToPlayModal();
                }
            }
        });
        
        // Pre-game screen
        document.getElementById('btnStartGame')?.addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('btnBackToMenu')?.addEventListener('click', () => {
            this.showScreen('start');
        });
        
        document.getElementById('allyDifficulty')?.addEventListener('change', (e) => {
            this.allyDifficulty = e.target.value;
        });
        
        document.getElementById('enemyDifficulty')?.addEventListener('change', (e) => {
            this.enemyDifficulty = e.target.value;
        });
        
        // Settings screen - UPDATED
        document.getElementById('btnCloseSettings')?.addEventListener('click', () => {
            this.closeSettings();
        });
        
        // Pause screen
        document.getElementById('btnResume')?.addEventListener('click', () => {
            this.resumeFromPause();
        });
        
        // Pause settings - UPDATED
        document.getElementById('btnPauseSettings')?.addEventListener('click', () => {
            this.previousScreen = 'pause';
            this.showScreen('settings');
        });
        
        document.getElementById('btnExitGame')?.addEventListener('click', () => {
            Game.stop();
            this.hideScreen('pause');
            this.showScreen('start');
            UI.hideIngameUI();
            
            if (typeof AudioManager !== 'undefined') {
                AudioManager.stopMusic();
            }
        });
        
        // Game over screen
        document.getElementById('btnPlayAgain')?.addEventListener('click', () => {
            this.hideScreen('gameover');
            this.showScreen('pregame');
        });
        
        document.getElementById('btnBackToMenuEnd')?.addEventListener('click', () => {
            this.hideScreen('gameover');
            this.showScreen('start');
        });
        
        // === NEW: ESC key handler ===
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    },
    
    /**
     * Handle ESC key press - NEW
     */
    handleEscapeKey() {
        // Nếu đang ở settings
        if (this.currentScreen === 'settings') {
            this.closeSettings();
            return;
        }
        
        // Nếu đang ở pause
        if (this.currentScreen === 'pause') {
            this.resumeFromPause();
            return;
        }
        
        // Nếu game đang chạy và không pause
        if (Game.isRunning && !Game.isPaused && !Game.isGameOver) {
            Game.pause();
        }
    },
    
    /**
     * Close settings - FIXED
     */
    closeSettings() {
        this.hideScreen('settings');
        
        if (this.previousScreen === 'pause') {
            this.showScreen('pause');
            // KHÔNG hiện UI vì vẫn đang pause
        } else if (Game.isRunning && !Game.isPaused) {
            UI.showIngameUI();
            MinionManager.showCountdownForResume();
        } else if (!Game.isRunning) {
            this.showScreen('start');
        }
        this.previousScreen = null;
    },

    /**
     * Resume from pause - UPDATED
     */
    resumeFromPause() {
        Game.resume();
        this.hideScreen('pause');
        UI.showIngameUI();
        MinionManager.showCountdownForResume(); // Hiện lại countdown nếu cần
    },

        
    /**
     * Populate hero selection grid
     */
    populateHeroGrid() {
        const grid = document.getElementById('heroGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const heroes = HeroRegistry.getAll();
        
        for (const hero of heroes) {
            const card = document.createElement('div');
            card.className = 'hero-card';
            card.dataset.heroId = hero.id;
            
            const roleClass = `role-${hero.role}`;
            
            card.innerHTML = `
                <div class="hero-icon ${roleClass}">${hero.icon}</div>
                <div class="hero-name">${hero.name}</div>
            `;
            
            card.addEventListener('click', () => {
                this.selectHero(hero.id);
                
                if (typeof AudioManager !== 'undefined') {
                    AudioManager.play('click');
                }
            });
            
            grid.appendChild(card);
        }
        
        if (heroes.length > 0) {
            this.selectHero(heroes[0].id);
        }
    },
    
    /**
     * Select hero
     */
    selectHero(heroId) {
        this.selectedHero = heroId;
        
        const cards = document.querySelectorAll('.hero-card');
        cards.forEach(card => {
            card.classList.toggle('selected', card.dataset.heroId === heroId);
        });
        
        const hero = HeroRegistry.get(heroId);
        if (hero) {
            const portrait = document.getElementById('selectedHeroPortrait');
            const name = document.getElementById('heroName');
            const role = document.getElementById('heroRole');
            const desc = document.getElementById('heroDescription');
            
            if (portrait) {
                portrait.textContent = hero.icon;
                portrait.className = `hero-portrait role-${hero.role}`;
            }
            if (name) name.textContent = hero.name;
            if (role) {
                const roleNames = {
                    marksman: 'Xạ Thủ',
                    fighter: 'Đấu Sĩ',
                    mage: 'Pháp Sư',
                    tank: 'Trợ Thủ',
                    assassin: 'Sát Thủ',
                };
                role.textContent = roleNames[hero.role] || hero.role;
            }
            if (desc) desc.textContent = hero.description;
        }
    },
    
    /**
     * Populate spell selection grid
     */
    populateSpellGrid() {
        const grid = document.getElementById('spellGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const spells = Object.entries(CONFIG.spells);
        
        for (const [spellId, spell] of spells) {
            const card = document.createElement('div');
            card.className = 'spell-card';
            card.dataset.spellId = spellId;
            
            if (spellId === this.selectedSpell) {
                card.classList.add('selected');
            }
            
            card.innerHTML = `
                <div class="spell-icon">${spell.icon}</div>
                <div class="spell-name">${spell.name}</div>
            `;
            
            card.addEventListener('click', () => {
                this.selectSpell(spellId);
                
                if (typeof AudioManager !== 'undefined') {
                    AudioManager.play('click');
                }
            });
            
            grid.appendChild(card);
        }
    },
    
    /**
     * Select spell
     */
    selectSpell(spellId) {
        this.selectedSpell = spellId;
        
        const cards = document.querySelectorAll('.spell-card');
        cards.forEach(card => {
            card.classList.toggle('selected', card.dataset.spellId === spellId);
        });
    },
    
    /**
     * Show screen
     */
    showScreen(screenId) {
        for (const [id, screen] of Object.entries(this.screens)) {
            if (screen) {
                screen.classList.remove('active');
            }
        }
        
        if (this.screens[screenId]) {
            this.screens[screenId].classList.add('active');
            this.currentScreen = screenId;
        }
    },
    
    /**
     * Hide screen
     */
    hideScreen(screenId) {
        if (this.screens[screenId]) {
            this.screens[screenId].classList.remove('active');
        }
    },
    
    /**
     * Hide all screens
     */
    hideAllScreens() {
        for (const screen of Object.values(this.screens)) {
            if (screen) {
                screen.classList.remove('active');
            }
        }
        this.currentScreen = null;
    },
    
    /**
     * Show pause screen - UPDATED
     */
    showPause() {
        UI.hideIngameUI();
        MinionManager.hideCountdownForPause(); // Ẩn countdown lính
        this.showScreen('pause');
    },
    
    /**
     * Show game over screen
     */
    showGameOver(won) {
        UI.showGameOverStats(won);
        this.showScreen('gameover');
        
        if (typeof AudioManager !== 'undefined') {
            AudioManager.play(won ? 'victory' : 'defeat');
        }
    },
    
    /**
     * Start game with current selections
     */
    async startGame() {
        if (!this.selectedHero) {
            alert('Vui lòng chọn một tướng!');
            return;
        }

        this.hideAllScreens();

        // Generate AI names
        const usedNames = [this.playerName];
        const aiNames = {
            allies: [],
            enemies: [],
        };

        for (let i = 0; i < 2; i++) {
            const name = this.getRandomAIName(usedNames);
            usedNames.push(name);
            aiNames.allies.push(name);
        }

        for (let i = 0; i < 3; i++) {
            const name = this.getRandomAIName(usedNames);
            usedNames.push(name);
            aiNames.enemies.push(name);
        }

        // Initialize game
        await Game.init({
            playerHero: this.selectedHero,
            playerSpell: this.selectedSpell,
            playerName: this.playerName,
            allyDifficulty: this.allyDifficulty,
            enemyDifficulty: this.enemyDifficulty,
            aiNames: aiNames,
        });

        UI.showIngameUI();

        // Start music
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playMusic();
        }

        Game.start();
    },
    
    /**
     * Get available heroes for AI
     */
    getAvailableHeroes(excludeIds = []) {
        const allHeroes = HeroRegistry.getAll();
        return allHeroes.filter(h => !excludeIds.includes(h.id));
    },
    
    /**
     * Reset to initial state
     */
    reset() {
        this.selectedHero = null;
        this.selectedSpell = 'flash';
        this.allyDifficulty = 'normal';
        this.enemyDifficulty = 'normal';
        this.previousScreen = null;
        
        const allySelect = document.getElementById('allyDifficulty');
        const enemySelect = document.getElementById('enemyDifficulty');
        
        if (allySelect) allySelect.value = 'normal';
        if (enemySelect) enemySelect.value = 'normal';
        
        const cards = document.querySelectorAll('.hero-card');
        cards.forEach(card => card.classList.remove('selected'));
        
        const spellCards = document.querySelectorAll('.spell-card');
        spellCards.forEach(card => {
            card.classList.toggle('selected', card.dataset.spellId === 'flash');
        });
        
        this.showScreen('start');
    },
    
    /**
     * Load How To Play content from instruction.md
     */
    async loadHowToPlayContent() {
        try {
            const response = await fetch('instruction.md');
            if (!response.ok) throw new Error('Failed to load instructions');
            
            const markdown = await response.text();
            const contentDiv = document.getElementById('howToPlayContent');
            if (contentDiv) {
                contentDiv.innerHTML = this.parseMarkdownToHTML(markdown);
            }
        } catch (error) {
            console.error('Error loading How To Play content:', error);
            const contentDiv = document.getElementById('howToPlayContent');
            if (contentDiv) {
                contentDiv.innerHTML = '<p>Failed to load instructions. Please try again later.</p>';
            }
        }
    },
    
    /**
     * Simple markdown to HTML parser
     */
    parseMarkdownToHTML(markdown) {
        let html = markdown;
        
        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Lists
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Paragraphs
        html = html.split('\n\n').map(para => {
            if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<li')) {
                return para;
            }
            return para.trim() ? `<p>${para}</p>` : '';
        }).join('\n');
        
        return html;
    },
    
    /**
     * Show How To Play modal
     */
    showHowToPlayModal() {
        const modal = document.getElementById('howToPlayModal');
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    /**
     * Close How To Play modal
     */
    closeHowToPlayModal() {
        const modal = document.getElementById('howToPlayModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Screens;
}
