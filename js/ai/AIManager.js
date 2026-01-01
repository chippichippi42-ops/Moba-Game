/**
 * ========================================
 * MOBA Arena - Advanced AI Manager
 * ========================================
 * Complete AI system with 19 specialized classes
 */

const AIManager = new (class AIManager {
    constructor() {
        this.controllers = [];
        this.visionSystem = new VisionSystem();
        this.pathFinding = new PathFinding();
        this.dodgeSystem = new DodgeSystem();
        this.comboExecutor = new ComboExecutor();
        this.targetSelector = new TargetSelector();

        // Advanced AI Systems
        this.advancedEvaluator = new AdvancedSmartEvaluator();
        this.ollamaIntegrator = new OllamaIntegrator(AI_CONFIG.external_ai.ollama);
        this.smartDecisionCache = new SmartDecisionCache();
        this.promptBuilder = new AdvancedPromptBuilder();
        this.responseFusion = new ResponseFusion();
        
        // Initialize all systems
        this.initializeSystems();
    }
    
    init() {
        this.controllers = [];
        this.initializeSystems();
    }

    async initializeAI() {
        const isAvailable = await this.ollamaIntegrator.checkAvailability();
        if (!isAvailable) {
            console.warn('Ollama not available, using local AI only');
        }
        return isAvailable;
    }
    
    initializeSystems() {
        // Initialize systems with config
        if (this.visionSystem) this.visionSystem.initialize();
        if (this.pathFinding) this.pathFinding.initialize();
        if (this.dodgeSystem) this.dodgeSystem.initialize();
        if (this.comboExecutor) this.comboExecutor.initialize();
        if (this.targetSelector) this.targetSelector.initialize();
    }
    
    createController(hero, difficulty) {
        const controller = new AIController(hero, difficulty, {
            visionSystem: this.visionSystem,
            pathFinding: this.pathFinding,
            dodgeSystem: this.dodgeSystem,
            comboExecutor: this.comboExecutor,
            targetSelector: this.targetSelector,
            advancedEvaluator: this.advancedEvaluator,
            ollamaIntegrator: this.ollamaIntegrator,
            smartDecisionCache: this.smartDecisionCache,
            promptBuilder: this.promptBuilder,
            responseFusion: this.responseFusion
        });
        
        this.controllers.push(controller);
        return controller;
    }
    
    update(deltaTime, entities) {
        // Update shared systems
        if (this.visionSystem) {
            this.visionSystem.update(deltaTime, entities);
        }
        
        // Update all controllers
        for (const controller of this.controllers) {
            controller.update(deltaTime, entities);
        }
    }
    
    clear() {
        this.controllers = [];
    }
    
    // Get AI controller for specific hero
    getController(hero) {
        return this.controllers.find(c => c.hero === hero);
    }
    
    // Remove controller
    removeController(hero) {
        this.controllers = this.controllers.filter(c => c.hero !== hero);
    }
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIManager;
}
