# Ollama AI Integration for MOBA Arena

This directory contains the setup for the local AI decision engine.

## Quick Start (Docker Compose)

Ensure you have Docker and Docker Compose installed.

1. Start the Ollama container:
   ```bash
   docker-compose up -d
   ```

2. Pull the Mistral model:
   ```bash
   docker exec -it moba-ollama ollama run mistral
   ```

## Manual Setup (Direct Ollama)

If you prefer to run Ollama directly on your host:

1. Install Ollama from [ollama.com](https://ollama.com).
2. Start Ollama.
3. Pull the model:
   ```bash
   ollama pull mistral
   ```

## Configuration

The AI settings can be found in `js/config.js` under `AI_CONFIG.external_ai`.

- **Model**: Mistral 7B (default)
- **Port**: 11434
- **Timeout**: 300ms (configured for real-time performance)

## Troubleshooting

- **Connection Refused**: Check if Ollama is running and the port is correctly mapped.
- **High Latency**: The system is designed to fallback to local heuristics if Ollama takes longer than 300ms.
- **Model Not Found**: Ensure you have pulled the `mistral` model.
