/**
 * AI-powered commit message generator.
 * Uses OpenAI/Anthropic/local models to generate commit messages from git diff.
 */

import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { getStagedDiff, ParsedDiff, parseDiff } from './git-parser.js';
import { Config, getProviderKey } from './config.js';
import { formatConventionalCommit, parseCommitMessage, validateCommitMessage } from './formatter.js';
import type { CommitMessage, CommitType } from './types.js';

const SYSTEM_PROMPT = `You are a commit message expert. Generate a conventional commit message from the provided git diff.

Rules:
- Use conventional commit format: type(scope?): description
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Be specific about what changed and why
- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Add body if needed for explanation (max 100 chars per line)
- Reference issue numbers if applicable (e.g., "Closes #123")

Examples:
feat(api): add user authentication endpoint
fix(db): resolve connection pool exhaustion under load
refactor(core): simplify event handling logic`;

export async function generateCommitMessage(
  diff?: string,
  config?: Config
): Promise<string[]> {
  const stagedDiff = diff || getStagedDiff();

  if (!stagedDiff.trim()) {
    throw new Error('No staged changes found. Stage changes with `git add` first.');
  }

  const parsed = parseDiff(stagedDiff);
  const cfg = config || loadConfig();
  const key = getProviderKey(cfg);

  if (!key && cfg.provider !== 'local') {
    throw new Error(`Missing ${cfg.provider.toUpperCase()}_API_KEY environment variable`);
  }

  const prompt = buildPrompt(parsed, cfg);

  let aiResponse: string;

  switch (cfg.provider) {
    case 'openai':
      aiResponse = await generateWithOpenAI(prompt, key, cfg.openai?.model);
      break;
    case 'anthropic':
      aiResponse = await generateWithAnthropic(prompt, key, cfg.anthropic?.model);
      break;
    case 'local':
      aiResponse = await generateWithLocal(prompt, cfg.local);
      break;
    default:
      throw new Error(`Unknown provider: ${cfg.provider}`);
  }

  // Generate multiple suggestions
  const messages: string[] = [];
  const lines = aiResponse.split('\n').filter(l => l.trim());

  for (const line of lines) {
    if (line.trim() && validateCommitMessage(line).valid) {
      messages.push(line.trim());
    }
  }

  // Fallback if no valid messages found
  if (messages.length === 0 && aiResponse.trim()) {
    const validation = validateCommitMessage(aiResponse.trim());
    if (validation.valid) {
      messages.push(aiResponse.trim());
    } else {
      // Try to fix common issues
      const fixed = fixCommitMessage(aiResponse.trim());
      if (fixed) {
        messages.push(fixed);
      } else {
        throw new Error('Failed to generate valid commit message');
      }
    }
  }

  // Limit to max suggestions
  return messages.slice(0, cfg.maxSuggestions || 3);
}

function buildPrompt(parsed: ParsedDiff, config: Config): string {
  const style = config.style || 'conventional';
  const files = parsed.files.slice(0, 20).join(', '); // Limit files for token limits

  return `${SYSTEM_PROMPT}

## Changes

Files changed: ${files || 'unknown'}
Total files: ${parsed.files.length}

${parsed.raw.substring(0, 12000)}

Generate ${config.maxSuggestions || 3} commit message suggestions in "${style}" style.
Only output the commit messages, one per line. No explanations.`;
}

async function generateWithOpenAI(
  prompt: string,
  apiKey: string,
  model?: string
): Promise<string> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content || '';
}

async function generateWithAnthropic(
  prompt: string,
  apiKey: string,
  model?: string
): Promise<string> {
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: model || 'claude-3-haiku-20240307',
    max_tokens: 500,
    messages: [
      { role: 'user', content: prompt },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic');
  }

  return content.text;
}

async function generateWithLocal(
  prompt: string,
  localConfig: Config['local']
): Promise<string> {
  const baseUrl = localConfig?.baseUrl || 'http://localhost:8081/v1';
  const model = localConfig?.model || 'qwen3.6-35b';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Local AI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function fixCommitMessage(msg: string): string | null {
  // Try to extract a valid commit message from the response
  const lines = msg.split('\n');
  for (const line of lines) {
    if (line.match(TYPE_PATTERN)) {
      return line.trim();
    }
  }
  return null;
}

// Regex for conventional commit type
const TYPE_PATTERN = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(\w+\))?!?:/;
