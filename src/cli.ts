/**
 * CLI interface for VibeCommit.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import figures from 'figures';
import { generateCommitMessage } from './commit-generator.js';
import { loadConfig, validateConfig } from './config.js';
import { formatConventionalCommit, validateCommitMessage } from './formatter.js';
import { hasStagedChanges } from './git-parser.js';
import { CommitType } from './types.js';

const program = new Command();

program
  .name('vibecommit')
  .description('AI-powered git commit message generator')
  .version('2.0.0');

program
  .command('commit')
  .description('Generate and optionally commit a message for staged changes')
  .option('-m, --message <text>', 'Use custom prompt instead of staged diff')
  .option('-a, --auto', 'Auto-commit with first suggestion')
  .option('--no-review', 'Skip review and use first suggestion')
  .option('-n, --number <n>', 'Number of suggestions', '3')
  .action(async (options) => {
    // Check staged changes
    if (!options.message && !hasStagedChanges()) {
      console.error(chalk.red(`\n${figures.cross} No staged changes found.`));
      console.error(chalk.yellow('Stage changes with: git add <files>'));
      process.exit(1);
    }

    // Load config
    const config = loadConfig();
    config.maxSuggestions = parseInt(options.number) || 3;

    // Validate config
    const errors = validateConfig(config);
    if (errors.length > 0) {
      console.error(chalk.red(`\n${figures.cross} Configuration error:`));
      for (const error of errors) {
        console.error(chalk.red(`  - ${error}`));
      }
      console.error(chalk.yellow('\nSet the environment variable or create a .vibecommitrc file'));
      process.exit(1);
    }

    console.log(chalk.cyan(`\n${figures.info} Generating commit messages...`));

    try {
      // Generate suggestions
      const messages = await generateCommitMessage(options.message, config);

      if (messages.length === 0) {
        throw new Error('No valid suggestions generated');
      }

      // Display suggestions
      console.log(chalk.green(`\n${figures.tick} ${messages.length} suggestion${messages.length > 1 ? 's' : ''} generated:\n`));

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const validation = validateCommitMessage(msg);

        const indicator = validation.valid ? chalk.green(figures.tick) : chalk.yellow(figures.warning);
        console.log(`${indicator} ${chalk.bold(`Suggestion ${i + 1}:`)} ${msg}`);

        if (!validation.valid) {
          for (const error of validation.errors) {
            console.log(chalk.dim(`  ⚠ ${error}`));
          }
        }

        if (i < messages.length - 1) {
          console.log();
        }
      }

      // Auto-commit if requested
      if (options.auto || (options.review === false && messages.length > 0)) {
        const chosen = messages[0];

        if (options.review !== false) {
          console.log(chalk.cyan(`\nUsing: ${chosen}`));
        }

        try {
          const { execSync } = await import('child_process');
          execSync(`git commit -m "${chosen}"`, { stdio: 'inherit' });
          console.log(chalk.green(`\n${figures.tick} Committed!`));
        } catch (error: any) {
          console.error(chalk.red(`\n${figures.cross} Git commit failed: ${error.message || 'Unknown error'}`));
          process.exit(1);
        }
      }

    } catch (error: any) {
      console.error(chalk.red(`\n${figures.cross} Error: ${error.message || 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('suggest')
  .description('Generate commit message suggestions without committing')
  .option('-m, --message <text>', 'Use custom prompt instead of staged diff')
  .option('-n, --number <n>', 'Number of suggestions', '3')
  .action(async (options) => {
    const config = loadConfig();
    config.maxSuggestions = parseInt(options.number) || 3;

    try {
      const messages = await generateCommitMessage(options.message, config);

      if (messages.length === 0) {
        console.error(chalk.red('No suggestions generated.'));
        process.exit(1);
      }

      for (const msg of messages) {
        console.log(msg);
      }

    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message || 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('validate <message>')
  .description('Validate a commit message')
  .action((message: string) => {
    const validation = validateCommitMessage(message);

    if (validation.valid) {
      console.log(chalk.green(`${figures.tick} Valid conventional commit message`));
    } else {
      console.log(chalk.red(`${figures.cross} Invalid commit message:`));
      for (const error of validation.errors) {
        console.log(chalk.red(`  - ${error}`));
      }
      process.exit(1);
    }
  });

program
  .command('format <message>')
  .description('Format a commit message')
  .action((message: string) => {
    try {
      console.log(chalk.cyan(formatConventionalCommit({
        type: CommitType.FEAT,
        subject: message,
      })));
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message || 'Unknown error'}`));
      process.exit(1);
    }
  });

program.parse();
