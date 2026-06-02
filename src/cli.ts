#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommitMessage } from './vibe-generator';
import { parseGitDiff, getGitDiff, getGitStatus } from './git-parser';

const program = new Command();

program
  .name('vibecommit')
  .description('AI-powered commit message generator with vibes')
  .version('1.0.0')
  .option('-v, --vibe <type>', 'Vibe mode: professional, funny, minimal, creative, enterprise, sarcastic', 'professional')
  .option('-l, --lang <language>', 'Language for the message (e.g., en, nl, de, fr)', 'en')
  .option('-d, --diff <file>', 'Path to a diff file to analyze')
  .option('--staged', 'Only stage changes for commit message generation')
  .option('-s, --staged-status', 'Show staged files before generating')
  .option('-m, --message <text>', 'Use this as the full commit message directly')
  .action(async (options) => {
    try {
      if (options.stagedStatus) {
        console.log('📊 Staged files:');
        const status = await getGitStatus(true);
        if (status) {
          status.split('\n').forEach(line => console.log('  ' + line));
        } else {
          console.log('  (nothing staged)');
        }
        return;
      }

      if (options.message) {
        console.log(options.message);
        return;
      }

      let diffText = '';
      
      // Get diff from file or git
      if (options.diff) {
        const fs = await import('fs');
        diffText = fs.readFileSync(options.diff, 'utf-8');
        console.log(`📄 Analyzing diff from file: ${options.diff}`);
      } else {
        console.log('🔍 Reading git diff...');
        diffText = await getGitDiff(options.staged);
      }

      if (!diffText || diffText.trim().length === 0) {
        console.log('⚠️  No changes detected. Make sure you have staged/working directory changes.');
        return;
      }

      console.log('🔥 Generating vibe commit message...');
      const message = await generateCommitMessage(diffText, options.vibe, options.lang);
      console.log('\n✨ Suggested commit message:\n');
      console.log(message);
      
      // Also output a minimal version
      const minimalMessage = await generateCommitMessage(diffText, 'minimal', options.lang);
      console.log('\n📝 Minimal version:\n');
      console.log(minimalMessage);
      
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Web demo command
program
  .command('web')
  .description('Start the web demo server')
  .option('-p, --port <number>', 'Port to run on', '3000')
  .action(async (options) => {
    const { startWebServer } = await import('./web-demo');
    startWebServer(parseInt(options.port));
  });

program.parse();
