# VibeCommit

> **AI-powered git commit message generator — Smart suggestions in seconds**

[![npm version](https://img.shields.io/npm/v/vibecommit.svg)](https://www.npmjs.com/package/vibecommit)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/aardenne/vibecommit/actions/workflows/ci.yml/badge.svg)](https://github.com/aardenne/vibecommit/actions)

## What is VibeCommit?

VibeCommit generates intelligent, conventional commit messages from your staged changes. No more staring at `git diff` trying to remember what you changed — VibeCommit analyzes your code diff and suggests perfect commit messages in seconds.

## Installation

```bash
npm install -g vibecommit
```

## Usage

```bash
# Stage your changes
git add .

# Generate suggestions
vibecommit suggest

# Generate and auto-commit
vibecommit commit --auto

# Use custom prompt instead of diff
vibecommit commit -m "Add JWT authentication"
```

## Commands

| Command | Description |
|---------|-------------|
| `vibecommit commit` | Generate suggestions for staged changes (interactive) |
| `vibecommit suggest` | Print suggestions without committing |
| `vibecommit validate <msg>` | Validate a commit message against Conventional Commits spec |
| `vibecommit format <msg>` | Convert a free-form message to conventional format |

## Options

- `-m, --message <text>` — Use custom prompt instead of staged diff
- `-a, --auto` — Auto-commit with the first suggestion
- `--no-review` — Skip interactive review, use first suggestion
- `-n, --number <n>` — Number of suggestions (default: 3)

## Configuration

Create `.vibecommitrc` in your project root:

```json
{
  "provider": "openai",
  "style": "conventional",
  "maxSuggestions": 3,
  "openai": {
    "apiKey": "your-api-key",
    "model": "gpt-4o-mini"
  }
}
```

Or use environment variables:

```bash
export OPENAI_API_KEY="your-api-key"
export ANTHROPIC_API_KEY="your-api-key"
```

### Supported Providers

| Provider | Models |
|----------|--------|
| OpenAI | GPT-4o, GPT-4, GPT-3.5 Turbo |
| Anthropic | Claude Sonnet, Claude Haiku |
| Local | Any OpenAI-compatible API (vLLM, llama.cpp, Ollama) |

### Local Provider Setup

```json
{
  "provider": "local",
  "local": {
    "baseUrl": "http://localhost:8081/v1",
    "model": "qwen3.6-35b"
  }
}
```

## Output Styles

- **conventional** — Standard [Conventional Commits](https://www.conventionalcommits.org/) format (default)
- **descriptive** — More detailed with body explanations
- **minimal** — Short one-line messages

## Example Output

```
✓ 3 suggestions generated:

✓ feat(auth): add JWT authentication middleware
✓ fix(api): resolve token validation timing issue  
✓ refactor(core): simplify authentication flow
```

## License

MIT

## Author

Mark Aardenne — [sx1.nl](https://sx1.nl)
