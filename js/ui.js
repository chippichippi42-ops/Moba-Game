/**
 * ========================================
 * MOBA Arena - UI System (Fixed v3)
 * ========================================
 */

const UI = {
    // DOM elements
    elements: {},
    
    // Kill feed
    killFeed: [],
    maxKillFeedEntries: 5,
    
    // Stats panel visible
    statsPanelVisible: false,
    
    // Team panel state
    teamPanelCollapsed: false,
    teamPanelDragging: false,
    teamPanelOffset: { x: 0, y: 0 },
    teamPanelPosition: { x: 20, y: 80 },
    
    // Settings
    settings: {
        graphicsQuality: 'medium',
        enableEffects: true,
        showFPS: false,
        masterVolume: 80,
        musicVolume: 50,
        sfxVolume: 70,
        cameraSensitivity: 5,
    },
    
    /**
     * Khởi tạo UI
     */
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.loadSettings();
        this.createSkillUpgradeButtons();
        this.createKDADisplay();
        this.createTeamStatusPanel();
        this.createRespawnOverlay();
        this.createAttackRangeIndicator();
    },
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            ingameUI: document.getElementById('ingameUI'),
            topBar: document.getElementById('topBar'),
            blueScore: document.getElementById('blueScore'),
            redScore: document.getElementById('redScore'),
            gameTimer: document.getElementById('gameTimer'),
            playerStats: document.getElementById('playerStats'),
            healthFill: document.getElementById('healthFill'),
            healthText: document.getElementById('healthText'),
            manaFill: document.getElementById('manaFill'),
            manaText: document.getElementById('manaText'),
            playerLevel: document.getElementById('playerLevel'),
            expFill: document.getElementById('expFill'),
            skillBar: document.getElementById('skillBar'),
            skill1: document.getElementById('skill1'),
            skill2: document.getElementById('skill2'),
            skill3: document.getElementById('skill3'),
            skill4: document.getElementById('skill4'),
            spellSlot: document.getElementById('spellSlot'),
            statsPanel: document.getElementById('statsPanel'),
            statsList: document.getElementById('statsList'),
            killFeed: document.getElementById('killFeed'),
            fpsCounter: document.getElementById('fpsCounter'),
            graphicsQuality: document.getElementById('graphicsQuality'),
            enableEffects: document.getElementById('enableEffects'),
            showFPS: document.getElementById('showFPS'),
            masterVolume: document.getElementById('masterVolume'),
            musicVolume: document.getElementById('musicVolume'),
            sfxVolume: document.getElementById('sfxVolume'),
            cameraSensitivity: document.getElementById('cameraSensitivity'),
            showCoordinates: document.getElementById('showCoordinates'),
        };
        this.createCoordinatesDisplay();
    },
    
    /**
     * Create KDA Display
     */
    createKDADisplay() {
        const kdaContainer = document.createElement('div');
        kdaContainer.id = 'kdaDisplay';
        kdaContainer.innerHTML = `
            <div class="kda-item">
                <span class="kda-label">K</span>
                <span class="kda-value kda-kills" id="kdaKills">0</span>
            </div>
            <div class="kda-separator">/</div>
            <div class="kda-item">
                <span class="kda-label">D</span>
                <span class="kda-value kda-deaths" id="kdaDeaths">0</span>
            </div>
            <div class="kda-separator">/</div>
            <div class="kda-item">
                <span class="kda-label">A</span>
                <span class="kda-value kda-assists" id="kdaAssists">0</span>
            </div>
        `;
        
        const ingameUI = document.getElementById('ingameUI');
        if (ingameUI) {
            ingameUI.appendChild(kdaContainer);
        }
        
        this.elements.kdaKills = document.getElementById('kdaKills');
        this.elements.kdaDeaths = document.getElementById('kdaDeaths');
        this.elements.kdaAssists = document.getElementById('kdaAssists');
    },
    
    /**
     * Create Coordinates Display
     */
    createCoordinatesDisplay() {
        const coordsDisplay = document.createElement('div');
        coordsDisplay.id = 'coordinatesDisplay';
        coordsDisplay.className = 'hidden';
        coordsDisplay.innerHTML = `
            <span id="playerCoords">X: 0 Y: 0</span>
        `;
        
        const ingameUI = document.getElementById('ingameUI');
        if (ingameUI) {
            ingameUI.appendChild(coordsDisplay);
        }
        
        this.elements.coordinatesDisplay = coordsDisplay;
        this.elements.playerCoords = document.getElementById('playerCoords');
    },
    
    
    /**
     * Create Team Status Panel - RECODE HOÀN TOÀN
     */
    createTeamStatusPanel() {
        // Xóa panel cũ nếu có
        const oldPanel = document.getElementById('teamStatusPanel');
        if (oldPanel) oldPanel.remove();
        
        const teamPanel = document.createElement('div');
        teamPanel.id = 'teamStatusPanel';
        teamPanel.innerHTML = `
            <div class="team-panel-header" id="teamPanelHeader">
                <span class="team-panel-drag-handle" id="teamPanelDragHandle">⋮⋮</span>
                <span class="team-status-title">Đồng Đội</span>
                <button class="team-panel-toggle" id="teamPanelToggle" type="button">−</button>
            </div>
            <div class="team-panel-content" id="teamPanelContent">
                <div id="allyStatusList" class="ally-status-list"></div>
            </div>
        `;
        
        const ingameUI = document.getElementById('ingameUI');
        if (ingameUI) {
            ingameUI.appendChild(teamPanel);
        }
        
        // Cache elements
        this.elements.teamStatusPanel = teamPanel;
        this.elements.allyStatusList = document.getElementById('allyStatusList');
        this.elements.teamPanelContent = document.getElementById('teamPanelContent');
        this.elements.teamPanelToggle = document.getElementById('teamPanelToggle');
        this.elements.teamPanelHeader = document.getElementById('teamPanelHeader');
        this.elements.teamPanelDragHandle = document.getElementById('teamPanelDragHandle');
        
        // Set initial position
        teamPanel.style.left = this.teamPanelPosition.x + 'px';
        teamPanel.style.top = this.teamPanelPosition.y + 'px';
        
        // Setup interactions
        this.setupTeamPanelInteractions();
    },

    
    /**
     * Setup Team Panel Interactions - Drag + Toggle
     */
    setupTeamPanelInteractions() {
        const panel = document.getElementById('teamStatusPanel');
        const header = document.getElementById('teamPanelHeader');
        const toggleBtn = document.getElementById('teamPanelToggle');
        const dragHandle = document.getElementById('teamPanelDragHandle');
        
        if (!panel || !header || !toggleBtn) return;
        
        // === TOGGLE FUNCTIONALITY ===
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleTeamPanel();
        });
        
        // === DRAG FUNCTIONALITY ===
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let panelStartX = 0;
        let panelStartY = 0;
        
        const startDrag = (clientX, clientY) => {
            isDragging = true;
            dragStartX = clientX;
            dragStartY = clientY;
            panelStartX = panel.offsetLeft;
            panelStartY = panel.offsetTop;
            
            panel.style.transition = 'none';
            panel.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        };
        
        const doDrag = (clientX, clientY) => {
            if (!isDragging) return;
            
            const deltaX = clientX - dragStartX;
            const deltaY = clientY - dragStartY;
            
            let newX = panelStartX + deltaX;
            let newY = panelStartY + deltaY;
            
            // Giới hạn trong màn hình
            const maxX = window.innerWidth - panel.offsetWidth - 10;
            const maxY = window.innerHeight - panel.offsetHeight - 10;
            
            newX = Math.max(10, Math.min(newX, maxX));
            newY = Math.max(10, Math.min(newY, maxY));
            
            panel.style.left = newX + 'px';
            panel.style.top = newY + 'px';
        };
        
        const endDrag = () => {
            if (!isDragging) return;
            
            isDragging = false;
            panel.style.transition = '';
            panel.style.cursor = '';
            document.body.style.userSelect = '';
            
            // Lưu vị trí
            this.teamPanelPosition.x = panel.offsetLeft;
            this.teamPanelPosition.y = panel.offsetTop;
        };
        
        // Mouse events - chỉ drag khi kéo từ drag handle hoặc header (không phải toggle)
        header.addEventListener('mousedown', (e) => {
            if (e.target === toggleBtn) return;
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                doDrag(e.clientX, e.clientY);
            }
        });
        
        document.addEventListener('mouseup', endDrag);
        
        // Touch events
        header.addEventListener('touchstart', (e) => {
            if (e.target === toggleBtn) return;
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                doDrag(touch.clientX, touch.clientY);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', endDrag);
        document.addEventListener('touchcancel', endDrag);
    },

    /**
     * Toggle Team Panel - Đóng/Mở
     */
    toggleTeamPanel() {
        this.teamPanelCollapsed = !this.teamPanelCollapsed;
        
        const content = document.getElementById('teamPanelContent');
        const toggle = document.getElementById('teamPanelToggle');
        const panel = document.getElementById('teamStatusPanel');
        
        if (content) {
            if (this.teamPanelCollapsed) {
                content.style.maxHeight = '0';
                content.style.padding = '0 14px';
                content.style.opacity = '0';
                content.style.overflow = 'hidden';
            } else {
                content.style.maxHeight = '400px';
                content.style.padding = '14px';
                content.style.opacity = '1';
                content.style.overflow = 'auto';
            }
        }
        
        if (toggle) {
            toggle.textContent = this.teamPanelCollapsed ? '+' : '−';
        }
        
        if (panel) {
            panel.classList.toggle('collapsed', this.teamPanelCollapsed);
        }
    },
    /**
     * Update Team Status - Cập nhật thông tin đồng đội
     */
    updateTeamStatus() {
        const listEl = document.getElementById('allyStatusList');
        if (!listEl) return;
        
        // Không update nếu panel đang đóng
        if (this.teamPanelCollapsed) return;
        
        const player = HeroManager.player;
        if (!player) return;
        
        const allies = HeroManager.getTeamHeroes(player.team).filter(h => h !== player);
        
        // Rebuild nếu số lượng thay đổi
        if (listEl.children.length !== allies.length) {
            this.buildTeamStatusItems(allies);
        }
        
        // Update từng ally
        allies.forEach((ally, index) => {
            const item = listEl.children[index];
            if (!item) return;
            
            // Update dead state
            item.classList.toggle('dead', !ally.isAlive);
            
            // Update health bar
            const healthFill = item.querySelector('.ally-health-fill');
            if (healthFill) {
                const healthPercent = (ally.health / ally.stats.maxHealth) * 100;
                healthFill.style.width = healthPercent + '%';
            }
            
            // Update mana bar
            const manaFill = item.querySelector('.ally-mana-fill');
            if (manaFill) {
                const manaPercent = (ally.mana / ally.stats.maxMana) * 100;
                manaFill.style.width = manaPercent + '%';
            }
            
            // Update ult indicator
            const ultIndicator = item.querySelector('.ally-ult-indicator');
            if (ultIndicator) {
                const hasUlt = ally.abilityLevels['t'] > 0 && ally.abilityCooldowns['t'] <= 0;
                ultIndicator.classList.toggle('ready', hasUlt);
                ultIndicator.classList.toggle('not-ready', !hasUlt);
            }
            
            // Update respawn timer
            const respawnTimer = item.querySelector('.ally-respawn-timer');
            if (respawnTimer) {
                if (!ally.isAlive && ally.respawnTimer > 0) {
                    respawnTimer.textContent = Math.ceil(ally.respawnTimer / 1000);
                    respawnTimer.style.display = 'block';
                } else {
                    respawnTimer.style.display = 'none';
                }
            }
            
            // Update level
            const levelEl = item.querySelector('.ally-level');
            if (levelEl) {
                levelEl.textContent = ally.level;
            }
        });
    },
    
    /**
     * Build Team Status Items - Tạo các item cho từng ally
     */
    buildTeamStatusItems(allies) {
        const listEl = document.getElementById('allyStatusList');
        if (!listEl) return;
        
        listEl.innerHTML = '';
        
        const roleColors = {
            marksman: '#f59e0b',
            fighter: '#ef4444',
            mage: '#8b5cf6',
            tank: '#3b82f6',
            assassin: '#6366f1',
        };
        
        for (const ally of allies) {
            const item = document.createElement('div');
            item.className = 'ally-status-item';
            item.innerHTML = `
                <div class="ally-icon" style="background: ${roleColors[ally.role] || '#64748b'}">
                    ${ally.heroData.icon}
                    <div class="ally-ult-indicator not-ready"></div>
                    <span class="ally-level">${ally.level}</span>
                </div>
                <div class="ally-info">
                    <div class="ally-name">${ally.playerName}</div>
                    <div class="ally-bars">
                        <div class="ally-health-bar">
                            <div class="ally-health-fill" style="width: 100%"></div>
                        </div>
                        <div class="ally-mana-bar">
                            <div class="ally-mana-fill" style="width: 100%"></div>
                        </div>
                    </div>
                </div>
                <div class="ally-respawn-timer" style="display: none"></div>
            `;
            listEl.appendChild(item);
        }
    },

    
    /**
     * Create Respawn Overlay - FIXED timer update
     */
    createRespawnOverlay() {
        const respawnOverlay = document.createElement('div');
        respawnOverlay.id = 'respawnOverlay';
        respawnOverlay.className = 'hidden';
        respawnOverlay.innerHTML = `
            <div class="respawn-content">
                <div class="respawn-title">BẠN ĐÃ BỊ HẠ GỤC</div>
                <div class="respawn-timer-container">
                    <div class="respawn-timer-text">Hồi sinh sau</div>
                    <div class="respawn-timer" id="respawnTimer">5</div>
                    <div class="respawn-timer-text">giây</div>
                </div>
            </div>
        `;
        
        const ingameUI = document.getElementById('ingameUI');
        if (ingameUI) {
            ingameUI.appendChild(respawnOverlay);
        }
        
        this.elements.respawnOverlay = respawnOverlay;
        this.elements.respawnTimer = document.getElementById('respawnTimer');
    },
    
    /**
     * Create Attack Range Indicator
     */
    createAttackRangeIndicator() {
        this.showAttackRange = false;
        this.attackRangeAlpha = 0;
    },
    
    /**
     * Create skill upgrade buttons
     */
    createSkillUpgradeButtons() {
        const skillElements = [
            { element: this.elements.skill1, key: 'q' },
            { element: this.elements.skill2, key: 'e' },
            { element: this.elements.skill3, key: 'r' },
            { element: this.elements.skill4, key: 't' },
        ];
        
        for (const skill of skillElements) {
            if (!skill.element) continue;
            
            const upgradeBtn = document.createElement('div');
            upgradeBtn.className = 'skill-upgrade-btn hidden';
            upgradeBtn.innerHTML = '+';
            upgradeBtn.dataset.skill = skill.key;
            
            upgradeBtn.style.cssText = `
                position: absolute;
                top: -15px;
                right: -5px;
                width: 22px;
                height: 22px;
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                border: 2px solid #fcd34d;
                border-radius: 50%;
                color: #000;
                font-size: 16px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                box-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
                animation: pulse-glow 1s ease-in-out infinite;
                transition: transform 0.2s;
            `;
            
            upgradeBtn.addEventListener('mouseenter', () => {
                upgradeBtn.style.transform = 'scale(1.2)';
            });
            upgradeBtn.addEventListener('mouseleave', () => {
                upgradeBtn.style.transform = 'scale(1)';
            });
            
            upgradeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onSkillUpgradeClick(skill.key);
            });
            
            skill.element.appendChild(upgradeBtn);
            skill.element.style.position = 'relative';
        }
        
        this.addUpgradeButtonStyles();
    },
    
    /**
     * Add CSS styles
     */
    addUpgradeButtonStyles() {
        const styleId = 'skill-upgrade-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.8); }
                50% { box-shadow: 0 0 20px rgba(251, 191, 36, 1), 0 0 30px rgba(251, 191, 36, 0.5); }
            }
            
            .skill-upgrade-btn { pointer-events: auto !important; }
            .skill-upgrade-btn.hidden { display: none !important; }
            
            .skill-level-indicator {
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 2px;
            }
            
            .skill-level-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.5);
            }
            
            .skill-level-dot.active {
                background: #fbbf24;
                border-color: #fcd34d;
                box-shadow: 0 0 5px rgba(251, 191, 36, 0.8);
            }
            
            #kdaDisplay {
                position: absolute;
                bottom: 250px;
                left: 20px;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }
            
            .kda-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
            .kda-label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
            .kda-value { font-size: 22px; font-weight: bold; line-height: 1; }
            .kda-kills { color: #22c55e; }
            .kda-deaths { color: #ef4444; }
            .kda-assists { color: #fbbf24; }
            #kdaDisplay .kda-separator { color: #4a5568; font-size: 20px; font-weight: 300; margin: 0 2px; align-self: flex-end; padding-bottom: 2px; }
            
            #respawnOverlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                pointer-events: none;
            }
            
            #respawnOverlay.hidden { display: none; }
            
            .respawn-content { text-align: center; animation: respawn-fade-in 0.5s ease-out; }
            
            @keyframes respawn-fade-in {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            .respawn-title {
                font-size: 42px;
                font-weight: bold;
                color: #ef4444;
                text-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
                margin-bottom: 40px;
                letter-spacing: 3px;
            }
            
            .respawn-timer-container { display: flex; flex-direction: column; align-items: center; gap: 10px; }
            .respawn-timer-text { font-size: 18px; color: #94a3b8; }
            
            .respawn-timer {
                font-size: 96px;
                font-weight: bold;
                color: #fff;
                text-shadow: 0 0 40px rgba(255, 255, 255, 0.5);
                animation: timer-pulse 1s ease-in-out infinite;
                line-height: 1;
            }
            
            @keyframes timer-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @media (max-width: 768px) {
                #teamStatusPanel { width: 170px; }
                #teamStatusPanel.collapsed { width: 110px; }
                #kdaDisplay { padding: 8px 12px; bottom: 110px; }
                .kda-value { font-size: 18px; }
                .respawn-title { font-size: 28px; }
                .respawn-timer { font-size: 64px; }
            }
            
            #coordinatesDisplay {
                position: absolute;
                top: 10px;
                right: 240px;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.7);
                border-radius: 6px;
                font-family: monospace;
                font-size: 12px;
                color: #00d4ff;
                border: 1px solid rgba(0, 212, 255, 0.3);
            }

            #coordinatesDisplay.hidden { display: none; }
        `;
        document.head.appendChild(style);
    },
    
    onSkillUpgradeClick(skillKey) {
        const player = HeroManager.player;
        if (!player) return;
        
        if (player.levelUpAbility(skillKey)) {
            if (typeof AudioManager !== 'undefined') {
                AudioManager.play('levelUp', 0.5);
            }
            this.updateSkillBar();
        }
    },
    
    setupEventListeners() {
        const volumeSliders = ['masterVolume', 'musicVolume', 'sfxVolume'];
        for (const id of volumeSliders) {
            const slider = this.elements[id];
            const display = document.getElementById(`${id}Value`);
            
            if (slider && display) {
                slider.addEventListener('input', () => {
                    display.textContent = slider.value + '%';
                    this.settings[id] = parseInt(slider.value);
                    this.saveSettings();
                });
            }
        }
        
        const camSlider = this.elements.cameraSensitivity;
        const camDisplay = document.getElementById('cameraSensitivityValue');
        if (camSlider && camDisplay) {
            camSlider.addEventListener('input', () => {
                camDisplay.textContent = camSlider.value;
                this.settings.cameraSensitivity = parseInt(camSlider.value);
                this.saveSettings();
            });
        }
        
        if (this.elements.graphicsQuality) {
            this.elements.graphicsQuality.addEventListener('change', (e) => {
                this.settings.graphicsQuality = e.target.value;
                this.saveSettings();
            });
        }
        
        if (this.elements.enableEffects) {
            this.elements.enableEffects.addEventListener('change', (e) => {
                this.settings.enableEffects = e.target.checked;
                this.saveSettings();
            });
        }
        
        if (this.elements.showFPS) {
            this.elements.showFPS.addEventListener('change', (e) => {
                this.settings.showFPS = e.target.checked;
                this.elements.fpsCounter.classList.toggle('hidden', !e.target.checked);
                this.saveSettings();
            });
        }
        
        const showCoordsCheckbox = document.getElementById('showCoordinates');
        if (showCoordsCheckbox) {
            showCoordsCheckbox.addEventListener('change', (e) => {
                this.settings.showCoordinates = e.target.checked;
                this.saveSettings();
                // Gọi updateCoordinates ngay để refresh UI
                this.updateCoordinates();
            });
        }
    },
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('mobaSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
        this.applySettings();
    },
    
    saveSettings() {
        try {
            localStorage.setItem('mobaSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    },
    
    applySettings() {
        if (this.elements.graphicsQuality) {
            this.elements.graphicsQuality.value = this.settings.graphicsQuality;
        }
        if (this.elements.enableEffects) {
            this.elements.enableEffects.checked = this.settings.enableEffects;
        }
        if (this.elements.showFPS) {
            this.elements.showFPS.checked = this.settings.showFPS;
            this.elements.fpsCounter?.classList.toggle('hidden', !this.settings.showFPS);
        }
        if (this.elements.masterVolume) {
            this.elements.masterVolume.value = this.settings.masterVolume;
            const display = document.getElementById('masterVolumeValue');
            if (display) display.textContent = this.settings.masterVolume + '%';
        }
        if (this.elements.musicVolume) {
            this.elements.musicVolume.value = this.settings.musicVolume;
            const display = document.getElementById('musicVolumeValue');
            if (display) display.textContent = this.settings.musicVolume + '%';
        }
        if (this.elements.sfxVolume) {
            this.elements.sfxVolume.value = this.settings.sfxVolume;
            const display = document.getElementById('sfxVolumeValue');
            if (display) display.textContent = this.settings.sfxVolume + '%';
        }
        if (this.elements.cameraSensitivity) {
            this.elements.cameraSensitivity.value = this.settings.cameraSensitivity;
            const display = document.getElementById('cameraSensitivityValue');
            if (display) display.textContent = this.settings.cameraSensitivity;
        }
        
        const showCoordsCheckbox = document.getElementById('showCoordinates');
        if (showCoordsCheckbox) {
            showCoordsCheckbox.checked = this.settings.showCoordinates || false;
        }
    },
    
    update(deltaTime) {
        if (!Game.isRunning) return;
        
        this.updatePlayerStats();
        this.updateSkillBar();
        this.updateScores();
        this.updateTimer();
        this.updateKillFeed(deltaTime);
        this.updateKDA();
        this.updateTeamStatus();
        this.updateRespawnOverlay();
        this.updateAttackRangeDisplay();
        this.updateCoordinates();
    },
    
    updateCoordinates() {
        // Luôn cập nhật element từ DOM, không dùng cache
        const coordsDisplay = document.getElementById('coordinatesDisplay');
        const playerCoords = document.getElementById('playerCoords');
        
        if (!coordsDisplay) return;
        
        const player = HeroManager.player;
        if (!player) return;
        
        // Cập nhật text tọa độ
        if (playerCoords) {
            playerCoords.textContent = `X: ${Math.round(player.x)} Y: ${Math.round(player.y)}`;
        }
        
        // Kiểm tra checkbox trực tiếp từ DOM
        const checkbox = document.getElementById('showCoordinates');
        if (checkbox && checkbox.checked) {
            coordsDisplay.classList.remove('hidden');
        } else {
            coordsDisplay.classList.add('hidden');
        }
    },
    
    updateKDA() {
        const player = HeroManager.player;
        if (!player) return;
        
        if (this.elements.kdaKills) this.elements.kdaKills.textContent = player.kills;
        if (this.elements.kdaDeaths) this.elements.kdaDeaths.textContent = player.deaths;
        if (this.elements.kdaAssists) this.elements.kdaAssists.textContent = player.assists;
    },
    
    updateTeamStatus() {
        const listEl = document.getElementById('allyStatusList');
        if (!listEl) return;
        if (this.teamPanelCollapsed) return;
        
        const player = HeroManager.player;
        if (!player) return;
        
        const allies = HeroManager.getTeamHeroes(player.team).filter(h => h !== player);
        
        if (listEl.children.length !== allies.length) {
            this.buildTeamStatusItems(allies);
        }
        
        allies.forEach((ally, index) => {
            const item = listEl.children[index];
            if (!item) return;
            
            item.classList.toggle('dead', !ally.isAlive);
            
            const healthFill = item.querySelector('.ally-health-fill');
            if (healthFill) {
                healthFill.style.width = ((ally.health / ally.stats.maxHealth) * 100) + '%';
            }
            
            const manaFill = item.querySelector('.ally-mana-fill');
            if (manaFill) {
                manaFill.style.width = ((ally.mana / ally.stats.maxMana) * 100) + '%';
            }
            
            const ultIndicator = item.querySelector('.ally-ult-indicator');
            if (ultIndicator) {
                const hasUlt = ally.abilityLevels['t'] > 0 && ally.abilityCooldowns['t'] <= 0;
                ultIndicator.classList.toggle('ready', hasUlt);
                ultIndicator.classList.toggle('not-ready', !hasUlt);
            }
            
            const respawnTimer = item.querySelector('.ally-respawn-timer');
            if (respawnTimer) {
                if (!ally.isAlive && ally.respawnTimer > 0) {
                    respawnTimer.textContent = Math.ceil(ally.respawnTimer / 1000);
                    respawnTimer.style.display = 'block';
                } else {
                    respawnTimer.style.display = 'none';
                }
            }
        });
    },
    
    buildTeamStatusItems(allies) {
        const listEl = document.getElementById('allyStatusList');
        if (!listEl) return;
        
        listEl.innerHTML = '';
        
        const roleColors = {
            marksman: '#f59e0b',
            fighter: '#ef4444',
            mage: '#8b5cf6',
            tank: '#3b82f6',
            assassin: '#6366f1',
        };
        
        for (const ally of allies) {
            const item = document.createElement('div');
            item.className = 'ally-status-item';
            item.innerHTML = `
                <div class="ally-icon" style="background: ${roleColors[ally.role] || '#64748b'}">
                    ${ally.heroData.icon}
                    <div class="ally-ult-indicator not-ready"></div>
                </div>
                <div class="ally-info">
                    <div class="ally-name">${ally.playerName}</div>
                    <div class="ally-bars">
                        <div class="ally-health-bar">
                            <div class="ally-health-fill" style="width: 100%"></div>
                        </div>
                        <div class="ally-mana-bar">
                            <div class="ally-mana-fill" style="width: 100%"></div>
                        </div>
                    </div>
                </div>
                <div class="ally-respawn-timer" style="display: none"></div>
            `;
            listEl.appendChild(item);
        }
    },
    
    /**
     * Update Respawn Overlay - FIXED: Timer now updates correctly
     */
    updateRespawnOverlay() {
        const player = HeroManager.player;
        if (!player) return;
        
        const overlay = document.getElementById('respawnOverlay');
        const timerEl = document.getElementById('respawnTimer');
        
        if (player.isDead && player.respawnTimer > 0) {
            if (overlay) overlay.classList.remove('hidden');
            if (timerEl) {
                timerEl.textContent = Math.ceil(player.respawnTimer / 1000);
            }
        } else {
            if (overlay) overlay.classList.add('hidden');
        }
    },
    
    updateAttackRangeDisplay() {
        const player = HeroManager.player;
        if (!player || !player.isAlive) {
            this.showAttackRange = false;
            return;
        }
        this.showAttackRange = Input.isKeyDown(' ') || Input.isMouseButtonDown(2);
    },
    
    renderAttackRange(ctx) {
        if (!this.showAttackRange) return;
        
        const player = HeroManager.player;
        if (!player || !player.isAlive) return;
        
        const range = player.stats.attackRange;
        this.attackRangeAlpha = Math.min(this.attackRangeAlpha + 0.1, 0.4);
        
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = this.attackRangeAlpha;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.arc(player.x, player.y, range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = player.color;
        ctx.globalAlpha = this.attackRangeAlpha * 0.2;
        ctx.fill();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    },
    
    updatePlayerStats() {
        const player = HeroManager.player;
        if (!player) return;
        
        const healthPercent = (player.health / player.stats.maxHealth) * 100;
        if (this.elements.healthFill) this.elements.healthFill.style.width = healthPercent + '%';
        if (this.elements.healthText) {
            this.elements.healthText.textContent = `${Math.ceil(player.health)}/${Math.ceil(player.stats.maxHealth)}`;
        }
        
        const manaPercent = (player.mana / player.stats.maxMana) * 100;
        if (this.elements.manaFill) this.elements.manaFill.style.width = manaPercent + '%';
        if (this.elements.manaText) {
            this.elements.manaText.textContent = `${Math.ceil(player.mana)}/${Math.ceil(player.stats.maxMana)}`;
        }
        
        if (this.elements.playerLevel) this.elements.playerLevel.textContent = player.level;
        
        const expPercent = (player.exp / player.expToNextLevel) * 100;
        if (this.elements.expFill) this.elements.expFill.style.width = Math.min(expPercent, 100) + '%';
    },
    
    updateSkillBar() {
        const player = HeroManager.player;
        if (!player) return;
        
        const skillKeys = ['q', 'e', 'r', 't'];
        const skillElements = [this.elements.skill1, this.elements.skill2, this.elements.skill3, this.elements.skill4];
        
        for (let i = 0; i < skillKeys.length; i++) {
            const key = skillKeys[i];
            const element = skillElements[i];
            if (!element) continue;
            
            const ability = player.heroData.abilities[key];
            const level = player.abilityLevels[key];
            const cooldown = player.abilityCooldowns[key];
            
            const overlay = element.querySelector('.cooldown-overlay');
            if (overlay) {
                if (level === 0) {
                    overlay.style.height = '100%';
                    overlay.style.background = 'rgba(0,0,0,0.8)';
                } else if (cooldown > 0) {
                    const maxCd = ability.cooldown[level - 1];
                    overlay.style.height = ((cooldown / maxCd) * 100) + '%';
                    overlay.style.background = 'rgba(0,0,0,0.7)';
                    element.dataset.cooldown = Math.ceil(cooldown / 1000);
                    element.classList.add('on-cooldown');
                } else {
                    overlay.style.height = '0%';
                    element.classList.remove('on-cooldown');
                    delete element.dataset.cooldown;
                }
            }
            
            if (level > 0) {
                const manaCost = ability.manaCost[level - 1];
                element.style.opacity = player.mana < manaCost ? '0.5' : '1';
            }
            
            const upgradeBtn = element.querySelector('.skill-upgrade-btn');
            if (upgradeBtn) {
                upgradeBtn.classList.toggle('hidden', !this.canUpgradeSkill(player, key));
            }
            
            this.updateSkillLevelIndicator(element, level, ability.maxLevel);
        }
        
        if (this.elements.spellSlot) {
            const overlay = this.elements.spellSlot.querySelector('.cooldown-overlay');
            if (overlay && player.spell) {
                const spellData = CONFIG.spells[player.spell];
                if (player.spellCooldown > 0) {
                    overlay.style.height = ((player.spellCooldown / spellData.cooldown) * 100) + '%';
                    this.elements.spellSlot.dataset.cooldown = Math.ceil(player.spellCooldown / 1000);
                    this.elements.spellSlot.classList.add('on-cooldown');
                } else {
                    overlay.style.height = '0%';
                    this.elements.spellSlot.classList.remove('on-cooldown');
                    delete this.elements.spellSlot.dataset.cooldown;
                }
            }
        }
    },
    
    canUpgradeSkill(player, skillKey) {
        if (player.abilityPoints <= 0) return false;
        
        const ability = player.heroData.abilities[skillKey];
        if (!ability) return false;
        
        const currentLevel = player.abilityLevels[skillKey];
        if (currentLevel >= ability.maxLevel) return false;
        
        if (skillKey === 't') {
            if (player.level < 4) return false;
            if (currentLevel >= 1 && player.level < 8) return false;
            if (currentLevel >= 2 && player.level < 12) return false;
        }
        
        return true;
    },
    
    updateSkillLevelIndicator(element, currentLevel, maxLevel) {
        let indicator = element.querySelector('.skill-level-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'skill-level-indicator';
            element.appendChild(indicator);
        }
        
        if (indicator.children.length !== maxLevel) {
            indicator.innerHTML = '';
            for (let i = 0; i < maxLevel; i++) {
                const dot = document.createElement('div');
                dot.className = 'skill-level-dot';
                indicator.appendChild(dot);
            }
        }
        
        const dots = indicator.querySelectorAll('.skill-level-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index < currentLevel);
        });
    },
    
    updateScores() {
        const blueKills = HeroManager.getTeamHeroes(CONFIG.teams.BLUE).reduce((sum, h) => sum + h.kills, 0);
        const redKills = HeroManager.getTeamHeroes(CONFIG.teams.RED).reduce((sum, h) => sum + h.kills, 0);
        
        if (this.elements.blueScore) this.elements.blueScore.textContent = blueKills;
        if (this.elements.redScore) this.elements.redScore.textContent = redKills;
    },
    
    updateTimer() {
        if (this.elements.gameTimer) {
            this.elements.gameTimer.textContent = Utils.formatTime(Game.gameTime);
        }
    },
    
    updateFPS(fps) {
        if (this.elements.fpsCounter && this.settings.showFPS) {
            this.elements.fpsCounter.textContent = `FPS: ${Math.round(fps)}`;
        }
    },
    
    addKillFeed(killer, victim, type) {
        let killerName = 'Unknown';
        
        if (killer) {
            if (killer.playerName) {
                killerName = killer.playerName;
            } else if (killer.name) {
                killerName = killer.name;
            } else if (killer.type === 'creature') {
                killerName = killer.name || 'Monster';
            } else if (killer.type === 'tower') {
                killerName = 'Tower';
            } else if (killer.type === 'minion') {
                killerName = 'Minion';
            }
        }
        
        let victimName = typeof victim === 'string' ? victim : (victim?.playerName || victim?.name || 'Unknown');
        
        const entry = { killer: killerName, victim: victimName, type, timestamp: Date.now() };
        this.killFeed.unshift(entry);
        if (this.killFeed.length > this.maxKillFeedEntries) this.killFeed.pop();
        this.renderKillFeedEntry(entry);
    },
    
    renderKillFeedEntry(entry) {
        if (!this.elements.killFeed) return;
        
        const div = document.createElement('div');
        div.className = 'kill-entry';
        
        if (entry.type === 'kill') {
            div.innerHTML = `<span class="killer">${entry.killer}</span><span class="action">killed</span><span class="victim">${entry.victim}</span>`;
        } else if (entry.type === 'tower') {
            div.innerHTML = `<span class="victim">${entry.victim}</span><span class="action">was destroyed</span>`;
        }
        
        this.elements.killFeed.insertBefore(div, this.elements.killFeed.firstChild);
        setTimeout(() => div.remove(), CONFIG.ui.killFeedDuration);
    },
    
    updateKillFeed(deltaTime) {
        const now = Date.now();
        this.killFeed = this.killFeed.filter(e => now - e.timestamp < CONFIG.ui.killFeedDuration);
    },
    
    /**
     * Toggle stats panel - FIX
     */
    toggleStatsPanel() {
        this.statsPanelVisible = !this.statsPanelVisible;
        
        const panel = document.getElementById('statsPanel');
        if (panel) {
            if (this.statsPanelVisible) {
                panel.classList.remove('hidden');
                panel.style.display = 'block'; // Thêm dòng này để đảm bảo hiển thị
                this.updateStatsPanel();
            } else {
                panel.classList.add('hidden');
                panel.style.display = 'none'; // Thêm dòng này
            }
        }
    },
    
    updateStatsPanel() {
        const player = HeroManager.player;
        if (!player || !this.elements.statsList) return;
        
        const stats = player.stats;
        const statItems = [
            { name: 'Máu', value: `${Math.ceil(player.health)}/${Math.ceil(stats.maxHealth)}` },
            { name: 'Mana', value: `${Math.ceil(player.mana)}/${Math.ceil(stats.maxMana)}` },
            { name: 'Hồi máu/s', value: stats.healthRegen.toFixed(1) },
            { name: 'Hồi mana/s', value: stats.manaRegen.toFixed(1) },
            { name: 'Sát thương', value: Math.ceil(stats.attackDamage) },
            { name: 'Sức mạnh phép', value: Math.ceil(stats.abilityPower) },
            { name: 'Giáp', value: Math.ceil(stats.armor) },
            { name: 'Kháng phép', value: Math.ceil(stats.magicResist) },
            { name: 'Tốc đánh', value: (stats.attackSpeed * 100).toFixed(0) + '%' },
            { name: 'Tầm đánh', value: stats.attackRange },
            { name: 'Tốc chạy', value: Math.ceil(stats.moveSpeed) },
            { name: 'Tỷ lệ chí mạng', value: stats.critChance.toFixed(0) + '%' },
            { name: 'Sát thương chí mạng', value: stats.critDamage + '%' },
            { name: 'Giảm hồi chiêu', value: stats.cdr + '%' },
        ];
        
        this.elements.statsList.innerHTML = statItems.map(s => 
            `<div class="stat-item"><span class="stat-name">${s.name}</span><span class="stat-value">${s.value}</span></div>`
        ).join('');
    },
    
    showIngameUI() {
        if (this.elements.ingameUI) this.elements.ingameUI.classList.remove('hidden');
    },
    
    hideIngameUI() {
        if (this.elements.ingameUI) this.elements.ingameUI.classList.add('hidden');
        const overlay = document.getElementById('respawnOverlay');
        if (overlay) overlay.classList.add('hidden');
    },
    
    showGameOverStats(won) {
        const statsDiv = document.getElementById('gameOverStats');
        const titleDiv = document.getElementById('gameOverTitle');
        
        if (titleDiv) {
            titleDiv.textContent = won ? 'CHIẾN THẮNG!' : 'THẤT BẠI!';
            titleDiv.style.color = won ? '#22c55e' : '#ef4444';
        }
        
        if (statsDiv) {
            const player = HeroManager.player;
            if (player) {
                statsDiv.innerHTML = `
                    <div class="stat-row"><span>Kills:</span><span>${player.kills}</span></div>
                    <div class="stat-row"><span>Deaths:</span><span>${player.deaths}</span></div>
                    <div class="stat-row"><span>Assists:</span><span>${player.assists}</span></div>
                    <div class="stat-row"><span>Damage Dealt:</span><span>${Math.ceil(player.totalDamageDealt)}</span></div>
                    <div class="stat-row"><span>Level:</span><span>${player.level}</span></div>
                    <div class="stat-row"><span>Game Time:</span><span>${Utils.formatTime(Game.gameTime)}</span></div>
                `;
            }
        }
    },
    
    reset() {
        this.killFeed = [];
        this.statsPanelVisible = false;
        this.showAttackRange = false;
        this.attackRangeAlpha = 0;
        this.teamPanelCollapsed = false;
        
        if (this.elements.killFeed) this.elements.killFeed.innerHTML = '';
        if (this.elements.statsPanel) this.elements.statsPanel.classList.add('hidden');
        
        const overlay = document.getElementById('respawnOverlay');
        if (overlay) overlay.classList.add('hidden');
        
        const listEl = document.getElementById('allyStatusList');
        if (listEl) listEl.innerHTML = '';
        
        const content = document.getElementById('teamPanelContent');
        if (content) content.classList.remove('collapsed');
        
        const toggle = document.getElementById('teamPanelToggle');
        if (toggle) toggle.textContent = '−';
        
        const panel = document.getElementById('teamStatusPanel');
        if (panel) panel.classList.remove('collapsed');
    },
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
