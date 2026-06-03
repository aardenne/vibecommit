/**
 * Tests for VibeCommit core functionality.
 */

import { describe, it, expect } from '@jest/globals';
import { formatConventionalCommit, validateCommitMessage, parseCommitMessage } from '../src/formatter';
import { parseDiff } from '../src/git-parser';

describe('formatter', () => {
  describe('formatConventionalCommit', () => {
    it('formats basic commit', () => {
      const msg = formatConventionalCommit({
        type: 'feat',
        subject: 'add user login',
      });
      expect(msg).toBe('feat: add user login');
    });

    it('formats with scope', () => {
      const msg = formatConventionalCommit({
        type: 'fix',
        scope: 'auth',
        subject: 'fix token expiration',
      });
      expect(msg).toBe('fix(auth): fix token expiration');
    });

    it('formats with body', () => {
      const msg = formatConventionalCommit({
        type: 'feat',
        subject: 'add API endpoint',
        body: 'Added /api/v1/users endpoint with CRUD operations',
      });
      expect(msg).toContain('feat: add API endpoint');
      expect(msg).toContain('Added /api/v1/users');
    });

    it('formats with breaking change', () => {
      const msg = formatConventionalCommit({
        type: 'feat',
        subject: 'migrate to v2 API',
        breaking: true,
      });
      expect(msg).toContain('feat!: migrate to v2 API');
    });

    it('formats with footer', () => {
      const msg = formatConventionalCommit({
        type: 'fix',
        subject: 'resolve memory leak',
        footer: 'Closes #123',
      });
      expect(msg).toContain('Closes #123');
    });
  });

  describe('validateCommitMessage', () => {
    it('validates correct conventional commit', () => {
      const result = validateCommitMessage('feat: add user login');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects non-conventional format', () => {
      const result = validateCommitMessage('Added user login feature');
      expect(result.valid).toBe(false);
    });

    it('rejects empty subject', () => {
      const result = validateCommitMessage('feat: ');
      expect(result.valid).toBe(false);
    });

    it('accepts scope', () => {
      const result = validateCommitMessage('fix(api): resolve timeout issue');
      expect(result.valid).toBe(true);
    });

    it('accepts breaking change', () => {
      const result = validateCommitMessage('feat!: drop support for Node 14');
      expect(result.valid).toBe(true);
    });
  });

  describe('parseCommitMessage', () => {
    it('parses basic commit', () => {
      const msg = parseCommitMessage('feat: add user login');
      expect(msg.type).toBe('feat');
      expect(msg.subject).toBe('add user login');
    });

    it('parses with scope', () => {
      const msg = parseCommitMessage('fix(auth): fix token issue');
      expect(msg.type).toBe('fix');
      expect(msg.scope).toBe('auth');
    });

    it('parses with body', () => {
      const msg = parseCommitMessage('feat: add login\n\nAdded JWT authentication with refresh tokens');
      expect(msg.body).toContain('JWT authentication');
    });

    it('rejects invalid format', () => {
      expect(() => parseCommitMessage('Invalid commit message')).toThrow();
    });
  });
});

describe('git-parser', () => {
  describe('parseDiff', () => {
    it('parses single file diff', () => {
      const diff = `diff --git a/src/index.js b/src/index.js
index 1234567..abcdefg 100644
--- a/src/index.js
+++ b/src/index.js
@@ -1,3 +1,4 @@
 const app = require('express');
+const router = app.Router();
 
 module.exports = app;`;

      const result = parseDiff(diff);
      expect(result.files).toContain('src/index.js');
      expect(result.hunks).toHaveLength(1);
    });

    it('parses multiple files', () => {
      const diff = `diff --git a/src/a.js b/src/a.js
index 1..2 100644
--- a/src/a.js
+++ b/src/a.js
@@ -1 +1,2 @@
+console.log('a');

diff --git a/src/b.js b/src/b.js
index 1..2 100644
--- a/src/b.js
+++ b/src/b.js
@@ -1 +1,2 @@
+console.log('b');`;

      const result = parseDiff(diff);
      expect(result.files).toHaveLength(2);
      expect(result.hunks).toHaveLength(2);
    });
  });
});
