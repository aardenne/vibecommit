/**
 * AI Provider abstraction for commit message generation.
 */

export interface AIProvider {
  name: string;
  generateCommitMessage(diff: string, context?: string): Promise<string>;
}

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export interface AnthropicConfig {
  apiKey: string;
  model?: string;
}

export interface LocalConfig {
  baseUrl: string;
  model?: string;
}

export enum CommitType {
  FEAT = 'feat',
  FIX = 'fix',
  DOCS = 'docs',
  STYLE = 'style',
  REFACTOR = 'refactor',
  PERF = 'perf',
  TEST = 'test',
  CHORE = 'chore',
  CI = 'ci',
  BUILD = 'build',
  REVERT = 'revert',
}

export interface CommitMessage {
  type: CommitType;
  scope?: string;
  subject: string;
  body?: string;
  footer?: string;
  breaking?: boolean;
}

export type ProviderConfig = OpenAIConfig | AnthropicConfig | LocalConfig;
