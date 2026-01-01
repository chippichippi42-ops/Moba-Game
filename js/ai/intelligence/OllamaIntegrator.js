/**
 * ========================================
 * Ollama Integrator
 * ========================================
 * Handles communication with local Ollama instance
 */

class OllamaIntegrator {
    constructor(config = {}) {
        this.host = config.host || 'localhost';
        this.port = config.port || 11434;
        this.model = config.model || 'mistral';
        this.timeoutMs = config.timeout_ms || 300;
        this.retryAttempts = config.retry_attempts || 2;
        this.isConnected = false;
        this.isAvailable = false;
    }

    async connect() {
        try {
            const response = await fetch(`http://${this.host}:${this.port}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            this.isConnected = response.ok;
            return this.isConnected;
        } catch (error) {
            this.isConnected = false;
            return false;
        }
    }

    async checkAvailability() {
        try {
            const response = await fetch(`http://${this.host}:${this.port}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            this.isAvailable = response.ok;
            return this.isAvailable;
        } catch (error) {
            this.isAvailable = false;
            return false;
        }
    }

    async queryOllama(prompt) {
        let attempts = 0;
        while (attempts <= this.retryAttempts) {
            try {
                const response = await fetch(`http://${this.host}:${this.port}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: this.model,
                        prompt: prompt,
                        stream: false,
                        options: {
                            num_predict: 50,
                            temperature: 0.7
                        }
                    }),
                    signal: AbortSignal.timeout(this.timeoutMs)
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                return this.parseResponse(data.response);
            } catch (error) {
                attempts++;
                if (attempts > this.retryAttempts) {
                    this.isAvailable = false;
                    return this.handleTimeout();
                }
            }
        }
    }

    parseResponse(response) {
        if (!response) return null;

        // Expected format: ACTION | REASONING
        const parts = response.split('|');
        const action = parts[0].trim().toUpperCase();
        const reasoning = parts[1] ? parts[1].trim() : 'No reasoning provided';

        // Extract confidence if present (simulated for now)
        const confidence = 0.85; 

        return {
            decision: action,
            reasoning: reasoning,
            confidence: confidence,
            provider: 'ollama'
        };
    }

    handleTimeout() {
        return {
            decision: 'FALLBACK',
            reasoning: 'Ollama timed out or connection failed',
            confidence: 0,
            provider: 'fallback'
        };
    }

    async retryWithBackoff(fn, maxAttempts = 3) {
        // Implementation of retry with exponential backoff if needed
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = OllamaIntegrator;
}
