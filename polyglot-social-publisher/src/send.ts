#!/usr/bin/env node

import { Command } from 'commander';
import { prompt } from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as dotenv from 'dotenv';
import { Publisher, PublisherConfig, SocialNetwork, PublishResult } from './publisher';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ConfigManager } from './config';

dotenv.config();

interface PostOptions {
  content?: string;
  file?: string;
  networks?: string[];
  dryRun?: boolean;
}

const program = new Command();
const configManager = new ConfigManager();

program
  .name('polyglot')
  .description('Cross-post content to multiple social media platforms')
  .version('1.0.0');

program
  .command('post')
  .description('Post content to configured social networks')
  .option('-c, --content <content>', 'Content to post')
  .option('-f, --file <file>', 'File containing content to post')
  .option('-n, --networks <networks...>', 'Specific networks to post to (bluesky, mastodon, linkedin)')
  .option('--dry-run', 'Show what would be posted without actually posting')
  .action(async (options: PostOptions) => {
    try {
      let content = options.content;
      if (options.file) {
        content = readFileSync(resolve(options.file), 'utf-8');
      }
      
      if (!content) {
        console.error(chalk.red('Error: No content provided. Use --content or --file option.'));
        process.exit(1);
      }

      const networks = options.networks || ['bluesky', 'mastodon', 'linkedin'];
      const spinner = ora('Publishing content...').start();

      const config = loadConfig();
      
      // Check if any networks are configured
      const configuredNetworks = Object.keys(config);
      if (configuredNetworks.length === 0) {
        spinner.stop();
        console.error(chalk.red('\nError: No networks configured. Run `polyglot configure` first.'));
        process.exit(1);
      }

      // Check if requested networks are configured
      const unconfiguredNetworks = networks.filter(n => !configuredNetworks.includes(n));
      if (unconfiguredNetworks.length > 0) {
        spinner.stop();
        console.error(chalk.red(`\nError: The following networks are not configured: ${unconfiguredNetworks.join(', ')}`));
        console.error(chalk.yellow('Run `polyglot configure` to set them up.'));
        process.exit(1);
      }

      const publisher = new Publisher(config);

      if (options.dryRun) {
        spinner.stop();
        console.log(chalk.blue('\nDry run - would post to:'), networks.join(', '));
        console.log(chalk.dim('\nContent:'), content);
        return;
      }

      const results = await publisher.publish({
        content,
        networks: networks as SocialNetwork[]
      });

      spinner.stop();
      
      console.log('\nPublishing results:');
      for (const [network, result] of Object.entries(results)) {
        const typedResult = result as PublishResult;
        if (typedResult.success) {
          console.log(chalk.green(`✓ ${network}: Posted successfully`));
          if (typedResult.postId) {
            console.log(chalk.dim(`  Post ID: ${typedResult.postId}`));
          }
        } else {
          console.log(chalk.red(`✗ ${network}: ${typedResult.error || 'Unknown error'}`));
        }
      }
    } catch (error) {
      console.error(chalk.red('\nError:'), error instanceof Error ? error.message : 'Unknown error occurred');
      process.exit(1);
    }
  });

program
  .command('configure')
  .description('Configure social network credentials')
  .action(async () => {
    try {
      const answers = await prompt([
        {
          type: 'checkbox',
          name: 'networks',
          message: 'Select networks to configure:',
          choices: ['bluesky', 'mastodon', 'linkedin']
        }
      ]);

      const config: Record<string, any> = {};

      for (const network of answers.networks) {
        const networkAnswers = await prompt(getNetworkQuestions(network));
        config[network] = networkAnswers;
      }

      // Save configuration
      configManager.saveConfig(config);
      console.log(chalk.green('\nConfiguration saved successfully!'));
      console.log(chalk.yellow('Note: Credentials are stored in ~/.polyglot/config.json'));
    } catch (error) {
      console.error(chalk.red('\nError:'), error instanceof Error ? error.message : 'Unknown error occurred');
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show configured networks and their status')
  .action(() => {
    const config = configManager.loadConfig();
    const networks = Object.keys(config);

    if (networks.length === 0) {
      console.log(chalk.yellow('No networks configured. Run `polyglot configure` to set up networks.'));
      return;
    }

    console.log(chalk.blue('\nConfigured networks:'));
    for (const network of networks) {
      console.log(chalk.green(`✓ ${network}`));
      switch (network) {
        case 'bluesky':
          if (config.bluesky?.identifier) {
            console.log(chalk.dim(`  Identifier: ${config.bluesky.identifier}`));
          }
          break;
        case 'mastodon':
          if (config.mastodon?.instance) {
            console.log(chalk.dim(`  Instance: ${config.mastodon.instance}`));
          }
          break;
      }
    }
  });

function getNetworkQuestions(network: string) {
  switch (network) {
    case 'bluesky':
      return [
        {
          type: 'input',
          name: 'identifier',
          message: 'Enter your Bluesky identifier (e.g., user.bsky.social):'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Enter your Bluesky app password:'
        }
      ];
    case 'mastodon':
      return [
        {
          type: 'input',
          name: 'instance',
          message: 'Enter your Mastodon instance URL:'
        },
        {
          type: 'password',
          name: 'accessToken',
          message: 'Enter your Mastodon access token:'
        }
      ];
    case 'linkedin':
      return [
        {
          type: 'password',
          name: 'accessToken',
          message: 'Enter your LinkedIn access token:'
        }
      ];
    default:
      return [];
  }
}

function loadConfig(): PublisherConfig {
  // First try loading from config file
  const fileConfig = configManager.loadConfig();
  if (Object.keys(fileConfig).length > 0) {
    return fileConfig;
  }

  // Fall back to environment variables if no file config
  const config: PublisherConfig = {};

  if (process.env.BLUESKY_IDENTIFIER && process.env.BLUESKY_PASSWORD) {
    config.bluesky = {
      identifier: process.env.BLUESKY_IDENTIFIER,
      password: process.env.BLUESKY_PASSWORD
    };
  }

  if (process.env.MASTODON_INSTANCE && process.env.MASTODON_ACCESS_TOKEN) {
    config.mastodon = {
      instance: process.env.MASTODON_INSTANCE,
      accessToken: process.env.MASTODON_ACCESS_TOKEN
    };
  }

  if (process.env.LINKEDIN_ACCESS_TOKEN) {
    config.linkedin = {
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN
    };
  }

  return config;
}

program.parse(); 