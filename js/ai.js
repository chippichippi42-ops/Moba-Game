/**
 * ========================================
 * MOBA Arena - AI System (Legacy Proxy)
 * ========================================
 * Proxy to new AI system for backward compatibility
 */

// Import new AI system
const NewAIManager = typeof AIManager !== 'undefined' ? AIManager : null;

const AIManager = {
    controllers: [],
    newAIManager: null,

    init() {
        this.controllers = [];

        // Initialize new AI manager if available
        if (NewAIManager) {
            this.newAIManager = new NewAIManager();
        }
    },

    createController(hero, difficulty) {
        // Use new AI system if available
        if (this.newAIManager) {
            return this.newAIManager.createController(hero, difficulty);
        }

        // Fallback to legacy system
        const controller = new LegacyAIController(hero, difficulty);
        this.controllers.push(controller);
        return controller;
    },

    update(deltaTime, entities) {
        // Use new AI system if available
        if (this.newAIManager) {
            this.newAIManager.update(deltaTime, entities);
            return;
        }

        // Fallback to legacy system
        for (const controller of this.controllers) {
            controller.update(deltaTime, entities);
        }
    },

    clear() {
        this.controllers = [];

        if (this.newAIManager) {
            this.newAIManager.clear();
        }
    },
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIManager };
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIManager, AIController };
}
