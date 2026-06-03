/**
 * Configuration management for VibeCommit.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  provider: 'openai' | 'anthropic' | 'local';
  model?: string;
  openai?: {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
  };
  anthropic?: {
    apiKey?: string;
    model?: string;
  };
  local?: {
    baseUrl: string;
    model?: string;
  };
  style: 'conventional' | 'descriptive' | 'minimal';
  maxSuggestions: number;
  requireReview: boolean;
}

const DEFAULT_CONFIG: Config = {
  provider: 'openai',
  style: 'conventional',
  maxSuggestions: 3,
  requireReview: true,
};

export function loadConfig(): Config {
  const configPath = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.vibecommitrc');

  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  return DEFAULT_CONFIG;
}

export function getProviderKey(config: Config): string {
  switch (config.provider) {
    case 'openai':
      return config.openai?.apiKey || process.env.OPENAI_API_KEY || '';
    case 'anthropic':
      return config.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY || '';
    case 'local':
      return '';
    default:
      return '';
  }
}

export function validateConfig(config: Config): string[] {
  const errors: string[] = [];

  const key = getProviderKey(config);
  if (!key && config.provider !== 'local') {
    errors.push(`Missing ${config.provider.toUpperCase()}_API_KEY`);
  }

  return errors;
}
