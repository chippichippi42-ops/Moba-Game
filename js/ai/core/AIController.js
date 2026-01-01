/**
 * ========================================
 * AI Controller - Core Orchestrator
 * ========================================
 * Manages all AI behaviors and systems
 */

class AIController {
    constructor(hero, difficulty, systems) {
        this.hero = hero;
        this.difficulty = difficulty;
        this.difficultySettings = CONFIG.aiDifficulty[difficulty];
        this.systems = systems;
        
        // State management
        this.stateMachine = new AIState(this, difficulty);
        this.decisionMaker = new DecisionMaker(this, difficulty);
        
        // Behavior systems
        this.laneBehavior = new LaneBehavior(this);
        this.combatBehavior = new CombatBehavior(this);
        this.retreatBehavior = new RetreatBehavior(this);
        this.pushBehavior = new PushBehavior(this);
        this.dodgeBehavior = new DodgeBehavior(this);
        this.jungleBehavior = new JungleBehavior(this);
        
        // Intelligence systems
        this.strategicAnalyzer = new StrategicAnalyzer(this);
        this.combatAnalyzer = new CombatAnalyzer(this);
        this.movementOptimizer = new MovementOptimizer(this);
        this.llmDecisionEngine = new LLMDecisionEngine(this);
        
        // Initialize
        this.initialize();
    }
    
    initialize() {
        // Set initial state
        this.stateMachine.setState('laning');
        
        // Initialize behaviors
        this.laneBehavior.initialize();
        this.combatBehavior.initialize();
        this.retreatBehavior.initialize();
        this.pushBehavior.initialize();
        this.dodgeBehavior.initialize();
        this.jungleBehavior.initialize();
        
        // Initialize intelligence systems
        this.strategicAnalyzer.initialize();
        this.combatAnalyzer.initialize();
        this.movementOptimizer.initialize();
        this.llmDecisionEngine.initialize();
    }
    
    update(deltaTime, entities) {
        if (!this.hero.isAlive || this.hero.isDead) return;
        
        // Update state machine
        this.stateMachine.update(deltaTime, entities);
        
        // Update intelligence systems
        this.strategicAnalyzer.update(deltaTime, entities);
        this.combatAnalyzer.update(deltaTime, entities);
        this.movementOptimizer.update(deltaTime);
        this.llmDecisionEngine.update(deltaTime, entities);
        
        // Make decisions
        this.decisionMaker.makeDecision(deltaTime, entities);
        
        // Execute current behavior based on state
        this.executeCurrentBehavior(deltaTime, entities);
        
        // Update movement
        this.updateMovement(deltaTime);
    }
    
    executeCurrentBehavior(deltaTime, entities) {
        const currentState = this.stateMachine.getCurrentState();
        
        switch (currentState) {
            case 'laning':
                this.laneBehavior.execute(deltaTime, entities);
                break;
            case 'fighting':
                this.combatBehavior.execute(deltaTime, entities);
                break;
            case 'retreating':
                this.retreatBehavior.execute(deltaTime, entities);
                break;
            case 'pushing':
                this.pushBehavior.execute(deltaTime, entities);
                break;
            case 'dodging':
                this.dodgeBehavior.execute(deltaTime, entities);
                break;
            case 'jungling':
                this.jungleBehavior.execute(deltaTime, entities);
                break;
            default:
                this.laneBehavior.execute(deltaTime, entities);
                break;
        }
    }
    
    updateMovement(deltaTime) {
        this.movementOptimizer.updateMovement(deltaTime);
    }
    
    // Get current difficulty settings
    getDifficultySetting(key) {
        return this.difficultySettings[key];
    }
    
    // Get AI parameter
    getAIParameter(key) {
        return CONFIG.aiParameters[key][this.difficulty] || CONFIG.aiParameters[key].normal;
    }
    
    // Get movement settings
    getMovementSetting(key) {
        return CONFIG.aiMovement[key];
    }
    
    // Get dodge settings
    getDodgeSetting(key) {
        return CONFIG.aiDodge[key];
    }
    
    // Get combo settings
    getComboSetting(key) {
        return CONFIG.aiCombo[key];
    }
    
    // Get targeting settings
    getTargetingSetting(key) {
        return CONFIG.aiTargeting[key];
    }
    
    // Get vision settings
    getVisionSetting(key) {
        return CONFIG.aiVision[key];
    }
    
    // Get farming settings
    getFarmingSetting(key) {
        return CONFIG.aiFarming[key];
    }
    
    // Get roaming settings
    getRoamingSetting(key) {
        return CONFIG.aiRoaming[key];
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIController;
}