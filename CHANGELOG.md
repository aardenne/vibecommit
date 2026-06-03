# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

### Changed

### Fixed

---

## [2.0.0] - 2026-06-03

### Added

- AI-powered commit message generation via OpenAI/Anthropic/local providers
- Conventional Commits output with automatic formatting
- Multi-provider support: GPT-4o, Claude, and local models (vLLM, llama.cpp)
- Interactive CLI with commit, suggest, validate, and format commands
- Smart diff analysis with file change detection
- Configuration management via `.vibecommitrc` and environment variables
- Full test suite (16 tests, 100% passing)
- CI/CD pipeline (GitHub Actions)
- npm package publishing support

### Changed

- [BREAKING] Initial stable release with v2.0.0 versioning

### Technical Details

- Built on Node.js 18+ with TypeScript 5.4
- 4 source modules: CLI, commit generator, formatter, git parser
- Supports Conventional Commits spec (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
- Configurable provider: OpenAI, Anthropic, or local OpenAI-compatible endpoints

### Contributors

- [Mark Aardenne](https://github.com/aardenne) — Architecture & Implementation

[Unreleased]: https://github.com/aardenne/vibecommit/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/aardenne/vibecommit/releases/tag/v2.0.0
