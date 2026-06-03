/**
 * VibeCommit — AI-powered git commit message generator
 * 
 * Generates intelligent, conventional commit messages from your staged changes.
 * Supports OpenAI, Anthropic, and local models via OpenAI-compatible APIs.
 */

export { generateCommitMessage } from './commit-generator.js';
export { parseDiff, getStagedDiff } from './git-parser.js';
export { loadConfig, Config } from './config.js';
export { formatConventionalCommit, validateCommitMessage } from './formatter.js';
export { AIProvider } from './types.js';
export { commit } from './cli.js';
