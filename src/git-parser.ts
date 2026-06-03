/**
 * Git parser — extract staged diff for AI analysis.
 */

import { execSync } from 'child_process';

export interface DiffHunk {
  file: string;
  before: number;
  after: number;
  lines: string[];
}

export interface ParsedDiff {
  files: string[];
  hunks: DiffHunk[];
  raw: string;
}

export function getStagedDiff(): string {
  try {
    const output = execSync('git diff --cached --no-color', {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    return output;
  } catch (error: any) {
    throw new Error(`Git diff failed: ${error.message || 'No staged changes or git not initialized'}`);
  }
}

export function parseDiff(diff: string): ParsedDiff {
  const files: string[] = [];
  const hunks: DiffHunk[] = [];

  const lines = diff.split('\n');
  let currentFile = '';
  let currentHunk: DiffHunk | null = null;
  let beforeLine = 0;
  let afterLine = 0;

  for (const line of lines) {
    // File header
    const fileMatch = line.match(/^diff --git a\/(.*) b\/(.*)$/);
    if (fileMatch) {
      currentFile = fileMatch[2];
      if (!files.includes(currentFile)) {
        files.push(currentFile);
      }
      currentHunk = null;
      continue;
    }

    // File name in index line
    const nameMatch = line.match(/^index\s+\w+\.\.\w+\s+(\d+)$/);
    if (nameMatch) {
      continue;
    }

    // New file mode
    if (line.startsWith('new file mode')) {
      continue;
    }

    // --- / +++ lines
    if (line.startsWith('--- ') || line.startsWith('+++ ')) {
      continue;
    }

    // Hunk header
    const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      if (currentHunk) {
        hunks.push(currentHunk);
      }
      currentHunk = {
        file: currentFile,
        before: parseInt(hunkMatch[1]),
        after: parseInt(hunkMatch[2]),
        lines: [],
      };
      beforeLine = currentHunk.before;
      afterLine = currentHunk.after;
      continue;
    }

    // Hunk content
    if (currentHunk && line) {
      currentHunk.lines.push(line);
      if (!line.startsWith('-')) {
        afterLine++;
      }
      if (!line.startsWith('+')) {
        beforeLine++;
      }
    }
  }

  if (currentHunk) {
    hunks.push(currentHunk);
  }

  return { files, hunks, raw: diff };
}

export function hasStagedChanges(): boolean {
  try {
    const output = execSync('git diff --cached --name-only', {
      encoding: 'utf-8',
    }).trim();
    return output.length > 0;
  } catch {
    return false;
  }
}
