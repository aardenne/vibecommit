# VibeCommit - Development Documentation for Hermes

## Project Goal
Create a professional, production-ready AI commit message generator for the OpenAI Codex for OSS application.

## Hardware Guidelines (for Hermes)
- Primary model: **GB10 #2 (Qwen3.6-35B)** for code generation and refactoring
- Fast model: **GB10 #1 (Nemotron)** for reviews and README work
- Xiaomi API: Only as last resort

## Current Starter Structure
- CLI core in TypeScript
- Basic vibe system
- Professional README

## Tasks to Complete
1. Implement full git diff parsing
2. Add LLM integration (local preferred)
3. Build web UI demo
4. Add GitHub Actions
5. Polish everything
6. Create public repo and push

## Security Rules
- Never commit any API keys
- Scan for secrets before push
- Use environment variables for configuration