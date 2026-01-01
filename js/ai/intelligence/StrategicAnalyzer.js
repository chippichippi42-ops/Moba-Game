/**
 * ========================================
 * Strategic Analyzer
 * ========================================
 * Analyzes overall game strategy and objectives
 */

class StrategicAnalyzer {
    constructor(controller) {
        this.controller = controller;
        this.gamePhase = 'early'; // early, mid, late
        this.objectivePriority = {};
        this.lastAnalysisTime = 0;
        this.analysisInterval = 5000; // Analyze every 5 seconds
    }
    
    initialize() {
        this.updateGamePhase();
        this.calculateObjectivePriority();
    }
    
    update(deltaTime, entities) {
        const now = Date.now();
        if (now - this.lastAnalysisTime >= this.analysisInterval) {
            this.updateGamePhase();
            this.calculateObjectivePriority();
            this.analyzeTeamComposition();
            this.lastAnalysisTime = now;
        }
    }
    
    updateGamePhase() {
        const gameTime = GameManager ? GameManager.gameTime : 0;
        
        if (gameTime < 300000) { // First 5 minutes
            this.gamePhase = 'early';
        } else if (gameTime < 600000) { // Next 5 minutes
            this.gamePhase = 'mid';
        } else {
            this.gamePhase = 'late';
        }
    }
    
    calculateObjectivePriority() {
        const priority = {
            towers: 1.0,
            jungleCamps: 0.8,
            enemyHeroes: 1.2,
            dragon: 0.5,
            baron: 0.3
        };
        
        // Adjust based on game phase
        switch (this.gamePhase) {
            case 'early':
                priority.jungleCamps = 1.2;
                priority.towers = 0.8;
                priority.enemyHeroes = 1.0;
                break;
            case 'mid':
                priority.jungleCamps = 0.9;
                priority.towers = 1.1;
                priority.enemyHeroes = 1.3;
                priority.dragon = 0.8;
                break;
            case 'late':
                priority.jungleCamps = 0.5;
                priority.towers = 1.5;
                priority.enemyHeroes = 1.5;
                priority.dragon = 1.2;
                priority.baron = 1.0;
                break;
        }
        
        this.objectivePriority = priority;
    }
    
    analyzeTeamComposition() {
        // Analyze both team compositions
        const myTeam = this.getTeamComposition(this.controller.hero.team);
        const enemyTeam = this.getTeamComposition(
            this.controller.hero.team === CONFIG.teams.BLUE ? CONFIG.teams.RED : CONFIG.teams.BLUE
        );
        
        // Store composition data
        this.teamComposition = {
            myTeam,
            enemyTeam
        };
    }
    
    getTeamComposition(team) {
        const heroes = [];
        const roles = {
            tank: 0,
            fighter: 0,
            mage: 0,
            marksman: 0,
            assassin: 0,
            support: 0
        };
        
        // Find all heroes on the team
        if (HeroManager && HeroManager.heroes) {
            for (const hero of HeroManager.heroes) {
                if (hero.team === team && hero.isAlive) {
                    heroes.push(hero);
                    if (hero.role) {
                        roles[hero.role] = (roles[hero.role] || 0) + 1;
                    }
                }
            }
        }
        
        return {
            heroes,
            roles,
            hasTank: roles.tank > 0,
            hasMage: roles.mage > 0,
            hasMarksman: roles.marksman > 0,
            hasAssassin: roles.assassin > 0,
            teamFightStrength: this.calculateTeamFightStrength(heroes)
        };
    }
    
    calculateTeamFightStrength(heroes) {
        let strength = 0;

        for (const hero of heroes) {
            // Simple strength calculation based on level and health
            strength += (hero.level || 1) * 100;

            // Safely calculate health percentage
            if (hero.stats?.maxHealth > 0) {
                strength += (hero.health / hero.stats.maxHealth) * 50;
            }

            // Bonus for certain roles
            if (hero.role === 'tank') strength += 150;
            if (hero.role === 'mage') strength += 120;
            if (hero.role === 'marksman') strength += 100;
        }

        return strength;
    }
    
    getCurrentGamePhase() {
        return this.gamePhase;
    }
    
    getObjectivePriority(objectiveType) {
        return this.objectivePriority[objectiveType] || 0;
    }
    
    getTeamCompositionData() {
        return this.teamComposition;
    }
    
    shouldFocusObjective(objectiveType) {
        const priority = this.getObjectivePriority(objectiveType);
        return priority > 1.0; // Focus on high priority objectives
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StrategicAnalyzer;
}