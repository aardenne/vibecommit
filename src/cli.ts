#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommitMessage } from './vibe-generator';
import { parseGitDiff, getGitDiff, getGitStatus, getGitLog } from './git-parser';

const program = new Command();

// ── Main Command ────────────────────────────────────────────

program
  .name('vibecommit')
  .description('AI-powered commit message generator with vibe modes')
  .version('2.0.0')
  .option('-v, --vibe <type>', 'Vibe mode: professional, funny, minimal, creative, enterprise, sarcastic, concise', 'professional')
  .option('-l, --lang <language>', 'Language for the message (en, nl, de, fr, es)', 'en')
  .option('-d, --diff <file>', 'Path to a diff file to analyze')
  .option('--staged', 'Only analyze staged changes')
  .option('-s, --staged-status', 'Show staged files before generating')
  .option('-m, --message <text>', 'Use this as the full commit message directly')
  .option('-p, --prompt <text>', 'Add a custom instruction to the prompt')
  .option('--json', 'Output results as JSON')
  .option('-n, --dry-run', 'Show what would be committed without generating')
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
        if (options.json) {
          console.log(JSON.stringify({ message: options.message }, null, 2));
        } else {
          console.log(options.message);
        }
        return;
      }

      if (options.dryRun) {
        console.log('📋 Dry run — staged files:');
        const status = await getGitStatus(true);
        if (status) {
          status.split('\n').forEach(line => console.log('  ' + line));
        } else {
          console.log('  (nothing staged)');
        }
        return;
      }

      let diffText = '';

      if (options.diff) {
        const fs = await import('fs');
        diffText = fs.readFileSync(options.diff, 'utf-8');
        if (!options.json) console.log(`📄 Analyzing diff from file: ${options.diff}`);
      } else {
        if (!options.json) console.log('🔍 Reading git diff...');
        diffText = await getGitDiff(options.staged);
      }

      if (!diffText || diffText.trim().length === 0) {
        console.log('⚠️  No changes detected. Make sure you have staged/working directory changes.');
        return;
      }

      if (!options.json) console.log(`🎨 Generating ${options.vibe} commit message...`);

      let extraPrompt = '';
      if (options.prompt) {
        extraPrompt = `\n\nCUSTOM INSTRUCTION: ${options.prompt}`;
      }

      const message = await generateCommitMessage(diffText, options.vibe, options.lang, extraPrompt);

      // Also generate a subject-line only version
      const subjectMessage = await generateCommitMessage(diffText, 'minimal', options.lang);

      if (options.json) {
        console.log(JSON.stringify({
          vibe: options.vibe,
          language: options.lang,
          subject: subjectMessage.split('\n')[0] || subjectMessage,
          full: message,
          diff_length: diffText.length,
        }, null, 2));
      } else {
        console.log('\n✨ Full message:');
        console.log('─'.repeat(50));
        console.log(message);
        console.log('─'.repeat(50));
        console.log('\n📝 Subject line only:');
        console.log(subjectMessage);
        console.log('\n💡 Tip: use --json for machine-readable output');
      }

    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// ── Web Demo ────────────────────────────────────────────────

program
  .command('web')
  .description('Start the interactive web demo server')
  .option('-p, --port <number>', 'Port to run on', '3000')
  .action(async (options) => {
    const { startWebServer } = await import('./web-demo');
    startWebServer(parseInt(options.port));
  });

// ── Pre-commit Hook ─────────────────────────────────────────

program
  .command('hook')
  .description('Set up or manage pre-commit hooks')
  .addCommand(new Command()
    .name('install')
    .description('Install pre-commit hook')
    .action(async () => {
      const { execSync } = await import('child_process');
      try {
        const hookPath = '.git/hooks/pre-commit';
        const hookScript = `#!/bin/sh
# VibeCommit pre-commit hook
# Auto-generates and displays a suggested commit message before committing
# Use VIBECOMMIT_SKIP=1 to bypass

if [ "\${VIBECOMMIT_SKIP}" = "1" ]; then
  exit 0
fi

echo "🎨 VibeCommit: Generating suggested commit message..."
message=$(npx vibecommit --staged --json 2>/dev/null)
if [ $? -eq 0 ]; then
  subject=$(echo "$message" | python3 -c "import sys,json; print(json.load(sys.stdin).get('subject',''))" 2>/dev/null || echo "")
  if [ -n "$subject" ]; then
    echo "✨ Suggested subject: $subject"
  fi
else
  echo "⚠️  VibeCommit unavailable, continuing..."
fi
`;
        const fs = await import('fs');
        fs.writeFileSync(hookPath, hookScript);
        execSync(`chmod +x ${hookPath}`);
        console.log('✅ Pre-commit hook installed at .git/hooks/pre-commit');
        console.log('   Bypass with: VIBECOMMIT_SKIP=1 git commit');
      } catch (error) {
        console.error('❌ Failed to install hook:', error instanceof Error ? error.message : error);
      }
    })
  )
  .addCommand(new Command()
    .name('remove')
    .description('Remove pre-commit hook')
    .action(async () => {
      try {
        const fs = await import('fs');
        const hookPath = '.git/hooks/pre-commit';
        if (fs.existsSync(hookPath)) {
          fs.unlinkSync(hookPath);
          console.log('✅ Pre-commit hook removed');
        } else {
          console.log('⚠️  No hook found to remove');
        }
      } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
      }
    })
  )
  .addCommand(new Command()
    .name('show')
    .description('Show current hook status')
    .action(() => {
      try {
        const fs = await import('fs');
        const hookPath = '.git/hooks/pre-commit';
        if (fs.existsSync(hookPath)) {
          const content = fs.readFileSync(hookPath, 'utf-8');
          if (content.includes('vibecommit')) {
            console.log('✅ Pre-commit hook active (VibeCommit enabled)');
          } else {
            console.log('⚠️  Hook exists but not managed by VibeCommit');
          }
        } else {
          console.log('❌ No pre-commit hook installed');
        }
      } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
      }
    })
  );

// ── Templates ───────────────────────────────────────────────

program
  .command('templates')
  .description('Manage custom prompt templates')
  .addCommand(new Command()
    .name('list')
    .description('List all available templates')
    .action(() => {
      console.log('📋 Available templates:');
      console.log('  professional  — Conventional Commits style');
      console.log('  funny         — Humorous but clear');
      console.log('  minimal       — Shortest possible');
      console.log('  creative      — Metaphors and analogies');
      console.log('  enterprise    — Formal, detailed, ticket refs');
      console.log('  sarcastic     — Witty, slightly sarcastic');
      console.log('  concise       — One-liner, subject only');
    })
  )
  .addCommand(new Command()
    .name('add')
    .description('Add a custom template from stdin')
    .option('-n, --name <name>', 'Template name (required)')
    .option('-f, --file <path>', 'Read template from file instead of stdin')
    .action(async (options) => {
      if (!options.name) {
        console.error('❌ --name is required');
        process.exit(1);
      }
      const fs = await import('fs');
      const path = await import('path');
      const templatesDir = '.vibecommit/templates';
      try {
        if (!fs.existsSync(templatesDir)) {
          fs.mkdirSync(templatesDir, { recursive: true });
        }
        let content;
        if (options.file) {
          content = fs.readFileSync(options.file, 'utf-8');
        } else {
          console.log('Enter template content (end with Ctrl+D):');
          const stdin = await new Promise<string>((resolve) => {
            const chunks: string[] = [];
            process.stdin.on('data', (d: Buffer) => chunks.push(d.toString()));
            process.stdin.on('end', () => resolve(chunks.join('')));
          });
          content = stdin.trim();
        }
        const filePath = path.join(templatesDir, `${options.name}.md`);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Template saved to ${filePath}`);
      } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
      }
    })
  );

// ── Init ────────────────────────────────────────────────────

program
  .command('init')
  .description('Initialize VibeCommit in current project')
  .option('--skip-git', 'Skip git repository check')
  .action(async (options) => {
    try {
      if (!options.skipGit) {
        const { execSync } = await import('child_process');
        try {
          execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
        } catch {
          console.error('❌ Not a git repository. Run: git init');
          process.exit(1);
        }
      }

      const fs = await import('fs');
      const path = await import('path');
      const templatesDir = '.vibecommit/templates';
      const configPath = '.vibecommit/config.yaml';

      // Create templates directory
      if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
        console.log('📁 Created .vibecommit/templates/');
      }

      // Create default config
      const defaultConfig = `# VibeCommit configuration
# Default vibe mode
default_vibe: professional
# Default language
default_lang: en
# Auto-install pre-commit hook
auto_hook: false
# Custom instructions for all generations
custom_instructions: |
  Follow Conventional Commits specification.
  Keep subject lines under 72 characters.
  Use clear, descriptive language.
`;
      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, defaultConfig);
        console.log('📝 Created .vibecommit/config.yaml');
      }

      console.log('\n✅ VibeCommit initialized!');
      console.log('\nQuick start:');
      console.log('  vibecommit --staged          # Generate commit message');
      console.log('  vibecommit hook install       # Install pre-commit hook');
      console.log('  vibecommit templates list     # List templates');
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
