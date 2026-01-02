/**
 * ========================================
 * MOBA Arena - Screen Management (Updated)
 * ========================================
 */

// Embedded instruction content to avoid CORS issues with file:// protocol
const INSTRUCTION_CONTENT = `# How To Play MOBA Arena

Welcome to MOBA Arena! This guide will help you get started and master the game.

## 🎮 Basic Controls

### Movement
- **WASD Keys** - Move your hero around the map
- **Mouse** - Aim abilities and select targets

### Abilities
- **Q Key** - First Ability
- **E Key** - Second Ability
- **R Key** - Third Ability (Often a mobility skill)
- **T Key** - Ultimate Ability (Powerful skill with long cooldown)

### Summoner Spell
- **D Key** - Use your chosen summoner spell (Flash, Ignite, etc.)

### Interface
- **Tab** - Toggle detailed stats panel
- **ESC** - Pause game / Open menu

## 🎯 Game Objective

Your goal is to **destroy the enemy main tower** while protecting your own!

### Win Conditions
- ✅ Destroy the enemy's main tower (center base)
- ❌ Lose if your main tower is destroyed

## ⚔️ Team Setup

You play in a **3v3 format**:
- **Your Team (Blue)**: You + 2 AI allies
- **Enemy Team (Red)**: 3 AI enemies

## 💰 Economy & Progression

### Gold System
- **Kill Minions**: Earn gold for every minion you defeat
- **Kill Heroes**: Bonus gold for defeating enemy champions
- **Destroy Towers**: Large gold rewards
- **Kill Jungle Monsters**: Additional gold and buffs

### Leveling Up
- Gain **experience (XP)** from kills and being near dying enemies
- Level up to unlock and upgrade abilities
- Each level increases your base stats

### Ability Upgrades
- Click the **+** button on abilities when available
- Prioritize your ultimate (T) when possible
- Balance between offensive and defensive skills

## 🗺️ Map Layout

### Lanes
- **Top Lane** - Upper path to enemy base
- **Mid Lane** - Shortest direct path through center
- **Bot Lane** - Lower path to enemy base

### Jungle
- Area between lanes with neutral monsters
- Provides buffs and extra gold/XP
- Strategic camping ground for ambushes

### Towers
- **Defensive structures** that attack enemies
- Provide vision and safety zones
- Must be destroyed to reach enemy base
- **Main Tower**: The final objective in each base

### Fog of War
- Areas you haven't explored are darkened
- Enemies in fog are invisible
- Towers and allies provide vision

## 🎚️ Difficulty Settings

Choose the challenge level for AI opponents:

### Easy
- AI plays conservatively
- Fewer ability combos
- Good for learning the game
- Lower aggression and skill usage

### Normal (Recommended)
- Balanced AI behavior
- Standard difficulty
- Uses basic combos
- Decent challenge for most players

### Hard
- Aggressive AI
- Smart ability usage
- Coordinated team fights
- Recommended for experienced players

### Nightmare
- Highly aggressive AI
- Perfect ability combos
- Exceptional positioning
- Only for skilled players

## 💡 Combat Tips

### Early Game (Levels 1-6)
- **Focus on farming** minions for gold and XP
- Avoid risky fights
- Upgrade your abilities wisely
- Stay near your towers for safety

### Mid Game (Levels 7-12)
- Start grouping with teammates
- Contest jungle objectives
- Push lanes after winning fights
- Ward and maintain vision

### Late Game (Levels 13+)
- Team fights are critical
- One mistake can lose the game
- Focus objectives after kills
- Protect your carries

### Positioning
- **Frontline**: Tanks and fighters absorb damage
- **Backline**: Marksmen and mages deal damage safely
- **Flankers**: Assassins look for isolated targets
- Stay with your team during fights

### Team Fights
- **Engage**: Start fights when you have advantage
- **Disengage**: Retreat when outnumbered
- **Focus**: Attack the same target as your team
- **Peel**: Protect your damage dealers

## 🦸 Hero Roles

### Marksman
- High physical damage from range
- Weak early, strong late game
- Stay behind tanks
- Focus on farming

### Fighter
- Balanced damage and durability
- Good in extended fights
- Dive enemy backline
- Sustain with lifesteal

### Mage
- High burst magical damage
- Skillshot focused
- Control zones with abilities
- Fragile but deadly

### Tank
- High health and armor
- Protect teammates
- Initiate team fights
- Absorb damage

### Assassin
- High burst damage
- Mobility and stealth
- Eliminate priority targets
- Hit and run playstyle

## 🔮 Ability Types

### Skillshots
- Aimed abilities that can miss
- Predict enemy movement
- High reward for accuracy

### Area of Effect (AoE)
- Damage or effects in an area
- Great for team fights
- Zone control

### Targeted
- Point-and-click abilities
- Guaranteed to hit
- Usually less powerful than skillshots

### Dash/Blink
- Mobility abilities
- Escape danger or engage fights
- Position yourself optimally

## 🏆 Tips & Tricks

### General Strategy
1. **Farm efficiently** - Last-hit minions for gold
2. **Map awareness** - Watch minimap for enemy positions
3. **Objective focus** - Towers > Kills
4. **Resource management** - Watch your mana
5. **Death timer** - Dead time = lost gold and XP

### Advanced Techniques
- **Kiting**: Attack while moving away from enemies
- **Trading**: Exchange damage favorably
- **Zoning**: Control space with threat
- **Wave management**: Control minion waves
- **Cooldown tracking**: Know when enemies can use abilities

## ⚠️ Common Mistakes

❌ **Don't**:
- Chase too deep into enemy territory
- Fight without your team
- Ignore the minimap
- Waste abilities on minions
- Dive towers alone
- Give up after one death

✅ **Do**:
- Farm safely when behind
- Ward key locations
- Group for objectives
- Learn from mistakes
- Stay positive!

## 🎓 Learning Path

### Beginner
1. Choose one hero to master
2. Learn basic controls and abilities
3. Practice last-hitting minions
4. Understand tower ranges
5. Play on Easy difficulty

### Intermediate
1. Learn all hero abilities
2. Practice ability combos
3. Improve map awareness
4. Time objectives
5. Try Normal difficulty

### Advanced
1. Master multiple heroes
2. Understand team compositions
3. Advanced positioning
4. Predict enemy movements
5. Challenge Hard/Nightmare difficulty

---

## 🎮 Ready to Play?

Choose your hero, select your summoner spell, and jump into the arena!

**Good luck, and may your tower never fall!**
`;

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

        document.getElementById('btnHowToPlay')?.addEventListener('click', () => {
            this.showHowToPlay();
        });

        document.getElementById('btnQuit')?.addEventListener('click', () => {
            alert('Cảm ơn bạn đã chơi MOBA Arena!');
        });

        document.getElementById('playerNameInput')?.addEventListener('change', (e) => {
            this.savePlayerName(e.target.value.trim());
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

        // Nếu modal đang mở
        const modal = document.getElementById('howToPlayModal');
        if (modal && modal.classList.contains('active')) {
            this.closeHowToPlay();
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
     * Show How To Play modal
     */
    showHowToPlay() {
        const modal = document.getElementById('howToPlayModal');
        const content = document.getElementById('howToPlayContent');

        if (!modal || !content) return;

        // Use embedded content to avoid CORS issues with file:// protocol
        try {
            let html = this.parseMarkdown(INSTRUCTION_CONTENT);
            content.innerHTML = html;
        } catch (error) {
            console.error('Error loading instructions:', error);
            content.innerHTML = '<p>Failed to load instructions.</p>';
        }

        modal.classList.add('active');

        // Set up close button
        document.getElementById('btnCloseHowToPlay').onclick = () => {
            this.closeHowToPlay();
        };

        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeHowToPlay();
            }
        };
    },

    /**
     * Close How To Play modal
     */
    closeHowToPlay() {
        const modal = document.getElementById('howToPlayModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Simple markdown parser for instruction.md
     */
    parseMarkdown(text) {
        // Simple markdown parsing
        let html = text;

        // Headers
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Bullet points
        html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Line breaks
        html = html.replace(/\n\n/g, '<br><br>');

        // Check marks
        html = html.replace(/✅/g, '<span style="color: #22c55e;">✅</span>');
        html = html.replace(/❌/g, '<span style="color: #ef4444;">❌</span>');

        // Emojis
        html = html.replace(/(🎮|🎯|⚔️|💰|🗺️|🎚️|💡|🦸|🔮|🏆|⚠️|🎓|🎲)/g, '<span style="font-size: 1.2em;">$1</span>');

        return html;
    },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Screens;
}
