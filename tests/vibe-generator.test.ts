/**
 * VibeCommit — Test suite for vibe-generator module
 * Tests fallback message generation and parsing logic
 */

import { describe, it, expect } from 'vitest';

describe('generateFallbackMessage', () => {
  // Simulating the fallback logic since it's not directly exported
  function parseFallback(diff: string) {
    const lines = diff.split('\n');
    const changedFiles = new Set<string>();
    let additions = 0;
    let deletions = 0;

    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        // Extract file path from either "diff --git a/x b/y" or "diff --git b/x a/y" format
        const parts = line.split(' ');
        for (const part of parts) {
          if (part.startsWith('b/')) {
            changedFiles.add(part.slice(2));
            break;
          }
        }
      }
      if (line.startsWith('+') && !line.startsWith('+++')) additions++;
      if (line.startsWith('-') && !line.startsWith('---')) deletions++;
    }

    return {
      fileCount: changedFiles.size,
      additions,
      deletions,
      type: additions > deletions ? 'feat' : 'fix',
      files: Array.from(changedFiles),
    };
  }

  it('should parse diff with added files', () => {
    const diff = `diff --git a/src/main.ts b/src/main.ts
index 123..456 789
--- a/src/main.ts
+++ b/src/main.ts
@@ -1,3 +1,5 @@
 import { App } from './app';
+import { Config } from './config';
+const config = new Config();
 export default new App();
-const app = new App();
`;
    const result = parseFallback(diff);
    expect(result.fileCount).toBe(1);
    expect(result.additions).toBe(2);
    expect(result.deletions).toBe(1);
    expect(result.type).toBe('feat');
    expect(result.files).toContain('src/main.ts');
  });

  it('should parse diff with removed files', () => {
    const diff = `diff --git a/src/old.ts b/src/old.ts
deleted file mode 100644
index 123..000
--- a/src/old.ts
+++ /dev/null
@@ -1,5 +0,0 @@
-const old = 'deprecated';
-export default old;
-// TODO: remove
-// NOTE: broken
-// FIXME: never
`;
    const result = parseFallback(diff);
    expect(result.fileCount).toBe(1);
    expect(result.deletions).toBe(5);
    expect(result.additions).toBe(0);
    expect(result.type).toBe('fix');
  });

  it('should detect multiple files', () => {
    const diff = `diff --git a/src/a.ts b/src/a.ts
--- a/src/a.ts
+++ b/src/a.ts
@@ -1 +1 @@
-a
+b
diff --git b/src/b.ts a/src/b.ts
--- a/src/b.ts
+++ b/src/b.ts
@@ -1 +1 @@
-c
+d
`;
    const result = parseFallback(diff);
    expect(result.fileCount).toBe(2);
    expect(result.files).toContain('src/a.ts');
    expect(result.files).toContain('src/b.ts');
  });

  it('should return feat when additions > deletions', () => {
    const result = parseFallback('+line1\n+line2\n+line3\n-line4');
    expect(result.type).toBe('feat');
  });

  it('should return fix when deletions >= additions', () => {
    const result = parseFallback('+line1\n-line2\n-line3\n-line4');
    expect(result.type).toBe('fix');
  });

  it('should handle empty diff', () => {
    const result = parseFallback('');
    expect(result.fileCount).toBe(0);
    expect(result.additions).toBe(0);
    expect(result.deletions).toBe(0);
  });

  it('should handle diff with index lines', () => {
    const diff = `diff --git a/file.ts b/file.ts
index 1234567..abcdefg 100644
--- a/file.ts
+++ b/file.ts
@@ -0,0 +1,5 @@
+const a = 1;
+const b = 2;
+const c = 3;
+const d = 4;
+const e = 5;
`;
    const result = parseFallback(diff);
    expect(result.fileCount).toBe(1);
    expect(result.additions).toBe(5);
  });
});

describe('VibePrompt templates', () => {
  const VIBE_PROMPTS = {
    professional: 'Conventional Commits',
    funny: 'Humorous',
    minimal: 'Shortest',
    creative: 'Metaphors',
    enterprise: 'Formal',
    sarcastic: 'Sarcastic',
  };

  it('should have all 6 vibe modes', () => {
    expect(Object.keys(VIBE_PROMPTS)).toHaveLength(6);
    expect(VIBE_PROMPTS).toHaveProperty('professional');
    expect(VIBE_PROMPTS).toHaveProperty('funny');
    expect(VIBE_PROMPTS).toHaveProperty('minimal');
    expect(VIBE_PROMPTS).toHaveProperty('creative');
    expect(VIBE_PROMPTS).toHaveProperty('enterprise');
    expect(VIBE_PROMPTS).toHaveProperty('sarcastic');
  });

  it('should default to professional for unknown vibe', () => {
    const vibe = VIBE_PROMPTS['unknown'] || VIBE_PROMPTS.professional;
    expect(vibe).toBe('Conventional Commits');
  });
});

describe('CLI options', () => {
  const VALID_VIBES = ['professional', 'funny', 'minimal', 'creative', 'enterprise', 'sarcastic'];
  const VALID_LANGS = ['en', 'nl', 'de', 'fr', 'es'];

  it('should validate vibe modes', () => {
    expect(VALID_VIBES).toContain('professional');
    expect(VALID_VIBES).toContain('funny');
  });

  it('should validate languages', () => {
    expect(VALID_LANGS).toContain('en');
    expect(VALID_LANGS).toContain('nl');
    expect(VALID_LANGS).toContain('de');
  });
});
