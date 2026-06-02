import { execSync } from 'child_process';

/**
 * Get git diff (staged or working directory)
 */
export async function getGitDiff(staged: boolean = false): Promise<string> {
  try {
    const args = staged 
      ? ['diff', '--cached', '--unified=0']  // Only header and changed lines
      : ['diff', '--unified=0'];             // Working directory changes
    
    const output = execSync(`git ${args.join(' ')}`, {
      encoding: 'utf-8',
      timeout: 10000
    });
    return output;
  } catch (error) {
    // Not a git repo or no changes
    return '';
  }
}

/**
 * Get git status (short format)
 */
export async function getGitStatus(stagedOnly: boolean = false): Promise<string> {
  try {
    const args = stagedOnly 
      ? ['status', '--short', '--staged']
      : ['status', '--short'];
    
    const output = execSync(`git ${args.join(' ')}`, {
      encoding: 'utf-8',
      timeout: 5000
    });
    return output;
  } catch (error) {
    return '';
  }
}

/**
 * Parse git diff and extract file changes
 */
export function parseGitDiff(diff: string): Array<{file: string, additions: number, deletions: number}> {
  const changes: Array<{file: string, additions: number, deletions: number}> = [];
  
  const lines = diff.split('\n');
  let currentFile = '';
  let additions = 0;
  let deletions = 0;
  
  for (const line of lines) {
    // New file section
    if (line.startsWith('diff --git')) {
      if (currentFile) {
        changes.push({ file: currentFile, additions, deletions });
      }
      // Extract filename from "diff --git a/file b/file"
      const match = line.match(/diff --git a\/(.*) b\/(.*)/);
      currentFile = match ? match[2] : 'unknown';
      additions = 0;
      deletions = 0;
    }
    // Additions
    else if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
    }
    // Deletions
    else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
    }
  }
  
  // Push last file
  if (currentFile) {
    changes.push({ file: currentFile, additions, deletions });
  }
  
  return changes;
}

/**
 * Get summary of changes
 */
export function getChangeSummary(diff: string): { files: number, additions: number, deletions: number } {
  const lines = diff.split('\n');
  let files = 0;
  let additions = 0;
  let deletions = 0;
  
  for (const line of lines) {
    if (line.startsWith('diff --git')) files++;
    if (line.startsWith('+') && !line.startsWith('+++')) additions++;
    if (line.startsWith('-') && !line.startsWith('---')) deletions++;
  }
  
  return { files, additions, deletions };
}
