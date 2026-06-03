/**
 * Commit message formatter — conventional commits, validation, parsing.
 */

import { CommitMessage, CommitType } from './types.js';

const TYPE_PATTERN = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(\w+\))?!?:/;
const MAX_SUBJECT_LENGTH = 72;
const MAX_LINE_LENGTH = 100;

export function formatConventionalCommit(msg: CommitMessage): string {
  let result = `${msg.type}`;

  if (msg.scope) {
    result += `(${msg.scope})`;
  }

  if (msg.breaking) {
    result += '!';
  }

  result += `: ${msg.subject}`;

  if (msg.body) {
    result += `\n\n${msg.body}`;
  }

  if (msg.footer) {
    result += `\n\n${msg.footer}`;
  }

  return result;
}

export function parseCommitMessage(input: string): CommitMessage {
  const lines = input.split('\n');
  const firstLine = lines[0];

  const match = firstLine.match(TYPE_PATTERN);
  if (!match) {
    throw new Error('Invalid conventional commit format');
  }

  const msg: CommitMessage = {
    type: match[1] as CommitType,
    scope: match[2] ? match[2].replace(/[()]/g, '') : undefined,
    subject: firstLine.replace(TYPE_PATTERN, '').trim(),
    breaking: firstLine.includes('!'),
  };

  let bodyStart = firstLine.length;
  let bodyLines: string[] = [];
  let footerLines: string[] = [];
  let inBody = true;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === '') {
      if (inBody && bodyLines.length > 0) {
        inBody = false;
      }
      continue;
    }

    if (!inBody) {
      footerLines.push(line);
    } else {
      bodyLines.push(line);
    }
  }

  if (bodyLines.length > 0) {
    msg.body = bodyLines.join('\n');
  }

  if (footerLines.length > 0) {
    msg.footer = footerLines.join('\n');
  }

  return msg;
}

export function validateCommitMessage(input: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const lines = input.split('\n');
  const firstLine = lines[0];

  // Check subject length
  if (firstLine.length > MAX_SUBJECT_LENGTH) {
    errors.push(`Subject line exceeds ${MAX_SUBJECT_LENGTH} characters`);
  }

  // Check line lengths
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > MAX_LINE_LENGTH) {
      errors.push(`Line ${i + 1} exceeds ${MAX_LINE_LENGTH} characters`);
    }
  }

  // Check conventional commit format
  if (!TYPE_PATTERN.test(firstLine)) {
    errors.push('Invalid conventional commit format. Expected: type(scope?): description');
  }

  // Check subject isn't empty
  const subject = firstLine.replace(TYPE_PATTERN, '').trim();
  if (!subject) {
    errors.push('Subject is empty');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function wrapLine(text: string, maxLength: number = MAX_LINE_LENGTH): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).length > maxLength) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}
