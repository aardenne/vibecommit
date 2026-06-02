# VibeCommit

**AI-Powered Commit Message Generator with Vibes** ✨

Generate meaningful, Conventional Commit-style messages with personality — powered by local AI models.

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/aardenne/vibecommit/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933)](https://nodejs.org/)
[![CI](https://github.com/aardenne/vibecommit/actions/workflows/ci.yml/badge.svg)](https://github.com/aardenne/vibecommit/actions)
[![Downloads](https://img.shields.io/npm/dw/vibecommit)](https://www.npmjs.com/package/vibecommit)

## ✨ Features

- 🎭 **7 Vibe Modes**: Professional, Enterprise, Minimal, Funny, Creative, Sarcastic
- 🌍 **Multi-language**: English, Dutch, German, French
- 🔍 **Git Diff Analysis**: Automatically reads staged or working directory changes
- 🤖 **Local AI-First**: Works with Ollama, vLLM, LM Studio, and any OpenAI-compatible API
- 💻 **CLI Tool**: Simple command-line interface with sensible defaults
- 🌐 **Web Demo**: Beautiful browser-based UI for quick commit messages
- ⚡ **Zero Config**: Works out of the box with sensible defaults
- 📦 **Easy Install**: `npm install -g vibecommit`

## 🚀 Quick Start

### Install globally
```bash
npm install -g vibecommit
```

### Generate a commit message
```bash
vibecommit --vibe professional
```

### Use with a diff file
```bash
vibecommit --diff changes.patch
```

### Start the web demo
```bash
vibecommit web --port 3000
```

## 📖 Usage

### CLI Options

```bash
vibecommit [options]

Options:
  -v, --vibe <type>        Vibe mode: professional, funny, minimal, creative, enterprise, sarcastic (default: "professional")
  -l, --lang <language>    Language: en, nl, de, fr (default: "en")
  -d, --diff <file>        Path to a diff file
  --staged                 Only use staged changes
  -s, --staged-status      Show staged files before generating
  -m, --message <text>     Use this as the commit message directly
  -h, --help               Show help
  -V, --version            Show version number
```

### Examples

**Professional commit message (default):**
```bash
vibecommit --vibe professional
```
Output:
```
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh when access token expires.
- Add refresh token storage in secure cookie
- Implement token refresh endpoint
```

**Funny commit message:**
```bash
vibecommit --vibe funny
```
Output:
```
feat(ui): fix the 'works on my machine' bug

Moved the fix from my machine to yours. You're welcome.
```

**Minimal commit message:**
```bash
vibecommit --vibe minimal
```
Output:
```
fix(auth): resolve token expiry issue
```

**Commit message in Dutch:**
```bash
vibecommit --vibe professional --lang nl
```

**Enterprise commit message with ticket reference:**
```bash
vibecommit --vibe enterprise
```
Output:
```
feat(api): implement user authentication endpoint [PROJ-123]

Added OAuth2 authentication endpoint for user login.
```

### Web Demo

Start the interactive web UI:
```bash
vibecommit web --port 3000
```

Then open `http://localhost:3000` in your browser.

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_BASE_URL` | Base URL for OpenAI-compatible API | `http://localhost:8081/v1` |
| `OPENAI_API_KEY` | API key (optional for Ollama) | `sk-no-...ired` |
| `OPENAI_MODEL` | Model name to use | `Qwen3.6-35B-A3B-NVFP4` |

### Local Model Setup

**Ollama:**
```bash
ollama run qwen3:32b
# Then set OPENAI_BASE_URL=http://localhost:11434/v1
```

**vLLM:**
```bash
vllm serve Qwen3.6-35B-A3B-NVFP4 --port 8081
# Then set OPENAI_BASE_URL=http://localhost:8081/v1
```

**LM Studio:**
```bash
# Start LM Studio with local server enabled
# Then set OPENAI_BASE_URL=http://localhost:1234/v1
```

## 🧪 Development

```bash
# Clone the repository
git clone https://github.com/aardenne/vibecommit.git
cd vibecommit

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📁 Project Structure

```
vibecommit/
├── src/
│   ├── cli.ts          # CLI entry point with git diff parsing
│   ├── vibe-generator.ts  # LLM integration (OpenAI-compatible)
│   ├── git-parser.ts   # Git diff parser
│   └── web-demo.ts     # Web server (Fastify)
├── web/
│   ├── index.html      # Web demo frontend
│   ├── style.css       # Styling
│   └── app.js          # Frontend logic
├── .github/workflows/  # CI/CD pipeline
├── package.json
├── tsconfig.json
└── README.md
```

## 🛡️ Security

- Never stores API keys in code or commits
- Uses environment variables for configuration
- OpenAI-compatible API support for local-first deployments
- No telemetry or data collection

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js)
- AI integration via [OpenAI SDK](https://github.com/openai/openai-node)
- Web server powered by [Fastify](https://fastify.dev/)
- Inspired by the need for better commit messages everywhere

---

**Made with ❤️ by [4R Consultancy](https://4rconsultancy.nl)**

*Helping developers write better commit messages, one vibe at a time.*
