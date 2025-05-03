#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = require("commander");
const inquirer_1 = require("inquirer");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const ora_1 = tslib_1.__importDefault(require("ora"));
const dotenv = tslib_1.__importStar(require("dotenv"));
const publisher_1 = require("./publisher");
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("./config");
dotenv.config();
const program = new commander_1.Command();
const configManager = new config_1.ConfigManager();
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
    .action((options) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        let content = options.content;
        if (options.file) {
            content = (0, fs_1.readFileSync)((0, path_1.resolve)(options.file), 'utf-8');
        }
        if (!content) {
            console.error(chalk_1.default.red('Error: No content provided. Use --content or --file option.'));
            process.exit(1);
        }
        const networks = options.networks || ['bluesky', 'mastodon', 'linkedin'];
        const spinner = (0, ora_1.default)('Publishing content...').start();
        const config = loadConfig();
        // Check if any networks are configured
        const configuredNetworks = Object.keys(config);
        if (configuredNetworks.length === 0) {
            spinner.stop();
            console.error(chalk_1.default.red('\nError: No networks configured. Run `polyglot configure` first.'));
            process.exit(1);
        }
        // Check if requested networks are configured
        const unconfiguredNetworks = networks.filter(n => !configuredNetworks.includes(n));
        if (unconfiguredNetworks.length > 0) {
            spinner.stop();
            console.error(chalk_1.default.red(`\nError: The following networks are not configured: ${unconfiguredNetworks.join(', ')}`));
            console.error(chalk_1.default.yellow('Run `polyglot configure` to set them up.'));
            process.exit(1);
        }
        const publisher = new publisher_1.Publisher(config);
        if (options.dryRun) {
            spinner.stop();
            console.log(chalk_1.default.blue('\nDry run - would post to:'), networks.join(', '));
            console.log(chalk_1.default.dim('\nContent:'), content);
            return;
        }
        const results = yield publisher.publish({
            content,
            networks: networks
        });
        spinner.stop();
        console.log('\nPublishing results:');
        for (const [network, result] of Object.entries(results)) {
            const typedResult = result;
            if (typedResult.success) {
                console.log(chalk_1.default.green(`✓ ${network}: Posted successfully`));
                if (typedResult.postId) {
                    console.log(chalk_1.default.dim(`  Post ID: ${typedResult.postId}`));
                }
            }
            else {
                console.log(chalk_1.default.red(`✗ ${network}: ${typedResult.error || 'Unknown error'}`));
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('\nError:'), error instanceof Error ? error.message : 'Unknown error occurred');
        process.exit(1);
    }
}));
program
    .command('configure')
    .description('Configure social network credentials')
    .action(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const answers = yield (0, inquirer_1.prompt)([
            {
                type: 'checkbox',
                name: 'networks',
                message: 'Select networks to configure:',
                choices: ['bluesky', 'mastodon', 'linkedin']
            }
        ]);
        const config = {};
        for (const network of answers.networks) {
            const networkAnswers = yield (0, inquirer_1.prompt)(getNetworkQuestions(network));
            config[network] = networkAnswers;
        }
        // Save configuration
        configManager.saveConfig(config);
        console.log(chalk_1.default.green('\nConfiguration saved successfully!'));
        console.log(chalk_1.default.yellow('Note: Credentials are stored in ~/.polyglot/config.json'));
    }
    catch (error) {
        console.error(chalk_1.default.red('\nError:'), error instanceof Error ? error.message : 'Unknown error occurred');
        process.exit(1);
    }
}));
program
    .command('status')
    .description('Show configured networks and their status')
    .action(() => {
    var _a, _b;
    const config = configManager.loadConfig();
    const networks = Object.keys(config);
    if (networks.length === 0) {
        console.log(chalk_1.default.yellow('No networks configured. Run `polyglot configure` to set up networks.'));
        return;
    }
    console.log(chalk_1.default.blue('\nConfigured networks:'));
    for (const network of networks) {
        console.log(chalk_1.default.green(`✓ ${network}`));
        switch (network) {
            case 'bluesky':
                if ((_a = config.bluesky) === null || _a === void 0 ? void 0 : _a.identifier) {
                    console.log(chalk_1.default.dim(`  Identifier: ${config.bluesky.identifier}`));
                }
                break;
            case 'mastodon':
                if ((_b = config.mastodon) === null || _b === void 0 ? void 0 : _b.instance) {
                    console.log(chalk_1.default.dim(`  Instance: ${config.mastodon.instance}`));
                }
                break;
        }
    }
});
function getNetworkQuestions(network) {
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
function loadConfig() {
    // First try loading from config file
    const fileConfig = configManager.loadConfig();
    if (Object.keys(fileConfig).length > 0) {
        return fileConfig;
    }
    // Fall back to environment variables if no file config
    const config = {};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFFQSx5Q0FBb0M7QUFDcEMsdUNBQWtDO0FBQ2xDLDBEQUEwQjtBQUMxQixzREFBc0I7QUFDdEIsdURBQWlDO0FBQ2pDLDJDQUF1RjtBQUN2RiwyQkFBa0M7QUFDbEMsK0JBQStCO0FBQy9CLHFDQUF5QztBQUV6QyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFTaEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxtQkFBTyxFQUFFLENBQUM7QUFDOUIsTUFBTSxhQUFhLEdBQUcsSUFBSSxzQkFBYSxFQUFFLENBQUM7QUFFMUMsT0FBTztLQUNKLElBQUksQ0FBQyxVQUFVLENBQUM7S0FDaEIsV0FBVyxDQUFDLHVEQUF1RCxDQUFDO0tBQ3BFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUVwQixPQUFPO0tBQ0osT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUNmLFdBQVcsQ0FBQyw0Q0FBNEMsQ0FBQztLQUN6RCxNQUFNLENBQUMseUJBQXlCLEVBQUUsaUJBQWlCLENBQUM7S0FDcEQsTUFBTSxDQUFDLG1CQUFtQixFQUFFLGlDQUFpQyxDQUFDO0tBQzlELE1BQU0sQ0FBQyw4QkFBOEIsRUFBRSw0REFBNEQsQ0FBQztLQUNwRyxNQUFNLENBQUMsV0FBVyxFQUFFLG9EQUFvRCxDQUFDO0tBQ3pFLE1BQU0sQ0FBQyxDQUFPLE9BQW9CLEVBQUUsRUFBRTtJQUNyQyxJQUFJLENBQUM7UUFDSCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQzlCLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pCLE9BQU8sR0FBRyxJQUFBLGlCQUFZLEVBQUMsSUFBQSxjQUFPLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxFQUFF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T0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxRQUFRLEdBQUc7WUFDaEIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCO1NBQy9DLENBQUM7SUFDSixDQUFDO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVELE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gJ2NvbW1hbmRlcic7XG5pbXBvcnQgeyBwcm9tcHQgfSBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0IG9yYSBmcm9tICdvcmEnO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgeyBQdWJsaXNoZXIsIFB1Ymxpc2hlckNvbmZpZywgU29jaWFsTmV0d29yaywgUHVibGlzaFJlc3VsdCB9IGZyb20gJy4vcHVibGlzaGVyJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IENvbmZpZ01hbmFnZXIgfSBmcm9tICcuL2NvbmZpZyc7XG5cbmRvdGVudi5jb25maWcoKTtcblxuaW50ZXJmYWNlIFBvc3RPcHRpb25zIHtcbiAgY29udGVudD86IHN0cmluZztcbiAgZmlsZT86IHN0cmluZztcbiAgbmV0d29ya3M/OiBzdHJpbmdbXTtcbiAgZHJ5UnVuPzogYm9vbGVhbjtcbn1cblxuY29uc3QgcHJvZ3JhbSA9IG5ldyBDb21tYW5kKCk7XG5jb25zdCBjb25maWdNYW5hZ2VyID0gbmV3IENvbmZpZ01hbmFnZXIoKTtcblxucHJvZ3JhbVxuICAubmFtZSgncG9seWdsb3QnKVxuICAuZGVzY3JpcHRpb24oJ0Nyb3NzLXBvc3QgY29udGVudCB0byBtdWx0aXBsZSBzb2NpYWwgbWVkaWEgcGxhdGZvcm1zJylcbiAgLnZlcnNpb24oJzEuMC4wJyk7XG5cbnByb2dyYW1cbiAgLmNvbW1hbmQoJ3Bvc3QnKVxuICAuZGVzY3JpcHRpb24oJ1Bvc3QgY29udGVudCB0byBjb25maWd1cmVkIHNvY2lhbCBuZXR3b3JrcycpXG4gIC5vcHRpb24oJy1jLCAtLWNvbnRlbnQgPGNvbnRlbnQ+JywgJ0NvbnRlbnQgdG8gcG9zdCcpXG4gIC5vcHRpb24oJy1mLCAtLWZpbGUgPGZpbGU+JywgJ0ZpbGUgY29udGFpbmluZyBjb250ZW50IHRvIHBvc3QnKVxuICAub3B0aW9uKCctbiwgLS1uZXR3b3JrcyA8bmV0d29ya3MuLi4+JywgJ1NwZWNpZmljIG5ldHdvcmtzIHRvIHBvc3QgdG8gKGJsdWVza3ksIG1hc3RvZG9uLCBsaW5rZWRpbiknKVxuICAub3B0aW9uKCctLWRyeS1ydW4nLCAnU2hvdyB3aGF0IHdvdWxkIGJlIHBvc3RlZCB3aXRob3V0IGFjdHVhbGx5IHBvc3RpbmcnKVxuICAuYWN0aW9uKGFzeW5jIChvcHRpb25zOiBQb3N0T3B0aW9ucykgPT4ge1xuICAgIHRyeSB7XG4gICAgICBsZXQgY29udGVudCA9IG9wdGlvbnMuY29udGVudDtcbiAgICAgIGlmIChvcHRpb25zLmZpbGUpIHtcbiAgICAgICAgY29udGVudCA9IHJlYWRGaWxlU3luYyhyZXNvbHZlKG9wdGlvbnMuZmlsZSksICd1dGYtOCcpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIWNvbnRlbnQpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ0Vycm9yOiBObyBjb250ZW50IHByb3ZpZGVkLiBVc2UgLS1jb250ZW50IG9yIC0tZmlsZSBvcHRpb24uJykpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5ldHdvcmtzID0gb3B0aW9ucy5uZXR3b3JrcyB8fCBbJ2JsdWVza3knLCAnbWFzdG9kb24nLCAnbGlua2VkaW4nXTtcbiAgICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEoJ1B1Ymxpc2hpbmcgY29udGVudC4uLicpLnN0YXJ0KCk7XG5cbiAgICAgIGNvbnN0IGNvbmZpZyA9IGxvYWRDb25maWcoKTtcbiAgICAgIFxuICAgICAgLy8gQ2hlY2sgaWYgYW55IG5ldHdvcmtzIGFyZSBjb25maWd1cmVkXG4gICAgICBjb25zdCBjb25maWd1cmVkTmV0d29ya3MgPSBPYmplY3Qua2V5cyhjb25maWcpO1xuICAgICAgaWYgKGNvbmZpZ3VyZWROZXR3b3Jrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKCdcXG5FcnJvcjogTm8gbmV0d29ya3MgY29uZmlndXJlZC4gUnVuIGBwb2x5Z2xvdCBjb25maWd1cmVgIGZpcnN0LicpKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiByZXF1ZXN0ZWQgbmV0d29ya3MgYXJlIGNvbmZpZ3VyZWRcbiAgICAgIGNvbnN0IHVuY29uZmlndXJlZE5ldHdvcmtzID0gbmV0d29ya3MuZmlsdGVyKG4gPT4gIWNvbmZpZ3VyZWROZXR3b3Jrcy5pbmNsdWRlcyhuKSk7XG4gICAgICBpZiAodW5jb25maWd1cmVkTmV0d29ya3MubGVuZ3RoID4gMCkge1xuICAgICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoYFxcbkVycm9yOiBUaGUgZm9sbG93aW5nIG5ldHdvcmtzIGFyZSBub3QgY29uZmlndXJlZDogJHt1bmNvbmZpZ3VyZWROZXR3b3Jrcy5qb2luKCcsICcpfWApKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay55ZWxsb3coJ1J1biBgcG9seWdsb3QgY29uZmlndXJlYCB0byBzZXQgdGhlbSB1cC4nKSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHVibGlzaGVyID0gbmV3IFB1Ymxpc2hlcihjb25maWcpO1xuXG4gICAgICBpZiAob3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmJsdWUoJ1xcbkRyeSBydW4gLSB3b3VsZCBwb3N0IHRvOicpLCBuZXR3b3Jrcy5qb2luKCcsICcpKTtcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZGltKCdcXG5Db250ZW50OicpLCBjb250ZW50KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgcHVibGlzaGVyLnB1Ymxpc2goe1xuICAgICAgICBjb250ZW50LFxuICAgICAgICBuZXR3b3JrczogbmV0d29ya3MgYXMgU29jaWFsTmV0d29ya1tdXG4gICAgICB9KTtcblxuICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICBcbiAgICAgIGNvbnNvbGUubG9nKCdcXG5QdWJsaXNoaW5nIHJlc3VsdHM6Jyk7XG4gICAgICBmb3IgKGNvbnN0IFtuZXR3b3JrLCByZXN1bHRdIG9mIE9iamVjdC5lbnRyaWVzKHJlc3VsdHMpKSB7XG4gICAgICAgIGNvbnN0IHR5cGVkUmVzdWx0ID0gcmVzdWx0IGFzIFB1Ymxpc2hSZXN1bHQ7XG4gICAgICAgIGlmICh0eXBlZFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oYOKckyAke25ldHdvcmt9OiBQb3N0ZWQgc3VjY2Vzc2Z1bGx5YCkpO1xuICAgICAgICAgIGlmICh0eXBlZFJlc3VsdC5wb3N0SWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmRpbShgICBQb3N0IElEOiAke3R5cGVkUmVzdWx0LnBvc3RJZH1gKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLnJlZChg4pyXICR7bmV0d29ya306ICR7dHlwZWRSZXN1bHQuZXJyb3IgfHwgJ1Vua25vd24gZXJyb3InfWApKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZCgnXFxuRXJyb3I6JyksIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0pO1xuXG5wcm9ncmFtXG4gIC5jb21tYW5kKCdjb25maWd1cmUnKVxuICAuZGVzY3JpcHRpb24oJ0NvbmZpZ3VyZSBzb2NpYWwgbmV0d29yayBjcmVkZW50aWFscycpXG4gIC5hY3Rpb24oYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBhbnN3ZXJzID0gYXdhaXQgcHJvbXB0KFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgbmFtZTogJ25ldHdvcmtzJyxcbiAgICAgICAgICBtZXNzYWdlOiAnU2VsZWN0IG5ldHdvcmtzIHRvIGNvbmZpZ3VyZTonLFxuICAgICAgICAgIGNob2ljZXM6IFsnYmx1ZXNreScsICdtYXN0b2RvbicsICdsaW5rZWRpbiddXG4gICAgICAgIH1cbiAgICAgIF0pO1xuXG4gICAgICBjb25zdCBjb25maWc6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblxuICAgICAgZm9yIChjb25zdCBuZXR3b3JrIG9mIGFuc3dlcnMubmV0d29ya3MpIHtcbiAgICAgICAgY29uc3QgbmV0d29ya0Fuc3dlcnMgPSBhd2FpdCBwcm9tcHQoZ2V0TmV0d29ya1F1ZXN0aW9ucyhuZXR3b3JrKSk7XG4gICAgICAgIGNvbmZpZ1tuZXR3b3JrXSA9IG5ldHdvcmtBbnN3ZXJzO1xuICAgICAgfVxuXG4gICAgICAvLyBTYXZlIGNvbmZpZ3VyYXRpb25cbiAgICAgIGNvbmZpZ01hbmFnZXIuc2F2ZUNvbmZpZyhjb25maWcpO1xuICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oJ1xcbkNvbmZpZ3VyYXRpb24gc2F2ZWQgc3VjY2Vzc2Z1bGx5IScpKTtcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLnllbGxvdygnTm90ZTogQ3JlZGVudGlhbHMgYXJlIHN0b3JlZCBpbiB+Ly5wb2x5Z2xvdC9jb25maWcuanNvbicpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ1xcbkVycm9yOicpLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJyk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9KTtcblxucHJvZ3JhbVxuICAuY29tbWFuZCgnc3RhdHVzJylcbiAgLmRlc2NyaXB0aW9uKCdTaG93IGNvbmZpZ3VyZWQgbmV0d29ya3MgYW5kIHRoZWlyIHN0YXR1cycpXG4gIC5hY3Rpb24oKCkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ01hbmFnZXIubG9hZENvbmZpZygpO1xuICAgIGNvbnN0IG5ldHdvcmtzID0gT2JqZWN0LmtleXMoY29uZmlnKTtcblxuICAgIGlmIChuZXR3b3Jrcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLnllbGxvdygnTm8gbmV0d29ya3MgY29uZmlndXJlZC4gUnVuIGBwb2x5Z2xvdCBjb25maWd1cmVgIHRvIHNldCB1cCBuZXR3b3Jrcy4nKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coY2hhbGsuYmx1ZSgnXFxuQ29uZmlndXJlZCBuZXR3b3JrczonKSk7XG4gICAgZm9yIChjb25zdCBuZXR3b3JrIG9mIG5ldHdvcmtzKSB7XG4gICAgICBjb25zb2xlLmxvZyhjaGFsay5ncmVlbihg4pyTICR7bmV0d29ya31gKSk7XG4gICAgICBzd2l0Y2ggKG5ldHdvcmspIHtcbiAgICAgICAgY2FzZSAnYmx1ZXNreSc6XG4gICAgICAgICAgaWYgKGNvbmZpZy5ibHVlc2t5Py5pZGVudGlmaWVyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5kaW0oYCAgSWRlbnRpZmllcjogJHtjb25maWcuYmx1ZXNreS5pZGVudGlmaWVyfWApKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21hc3RvZG9uJzpcbiAgICAgICAgICBpZiAoY29uZmlnLm1hc3RvZG9uPy5pbnN0YW5jZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZGltKGAgIEluc3RhbmNlOiAke2NvbmZpZy5tYXN0b2Rvbi5pbnN0YW5jZX1gKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbmZ1bmN0aW9uIGdldE5ldHdvcmtRdWVzdGlvbnMobmV0d29yazogc3RyaW5nKSB7XG4gIHN3aXRjaCAobmV0d29yaykge1xuICAgIGNhc2UgJ2JsdWVza3knOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgbmFtZTogJ2lkZW50aWZpZXInLFxuICAgICAgICAgIG1lc3NhZ2U6ICdFbnRlciB5b3VyIEJsdWVza3kgaWRlbnRpZmllciAoZS5nLiwgdXNlci5ic2t5LnNvY2lhbCk6J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICBuYW1lOiAncGFzc3dvcmQnLFxuICAgICAgICAgIG1lc3NhZ2U6ICdFbnRlciB5b3VyIEJsdWVza3kgYXBwIHBhc3N3b3JkOidcbiAgICAgICAgfVxuICAgICAgXTtcbiAgICBjYXNlICdtYXN0b2Rvbic6XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICBuYW1lOiAnaW5zdGFuY2UnLFxuICAgICAgICAgIG1lc3NhZ2U6ICdFbnRlciB5b3VyIE1hc3RvZG9uIGluc3RhbmNlIFVSTDonXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAncGFzc3dvcmQnLFxuICAgICAgICAgIG5hbWU6ICdhY2Nlc3NUb2tlbicsXG4gICAgICAgICAgbWVzc2FnZTogJ0VudGVyIHlvdXIgTWFzdG9kb24gYWNjZXNzIHRva2VuOidcbiAgICAgICAgfVxuICAgICAgXTtcbiAgICBjYXNlICdsaW5rZWRpbic6XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICBuYW1lOiAnYWNjZXNzVG9rZW4nLFxuICAgICAgICAgIG1lc3NhZ2U6ICdFbnRlciB5b3VyIExpbmtlZEluIGFjY2VzcyB0b2tlbjonXG4gICAgICAgIH1cbiAgICAgIF07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsb2FkQ29uZmlnKCk6IFB1Ymxpc2hlckNvbmZpZyB7XG4gIC8vIEZpcnN0IHRyeSBsb2FkaW5nIGZyb20gY29uZmlnIGZpbGVcbiAgY29uc3QgZmlsZUNvbmZpZyA9IGNvbmZpZ01hbmFnZXIubG9hZENvbmZpZygpO1xuICBpZiAoT2JqZWN0LmtleXMoZmlsZUNvbmZpZykubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBmaWxlQ29uZmlnO1xuICB9XG5cbiAgLy8gRmFsbCBiYWNrIHRvIGVudmlyb25tZW50IHZhcmlhYmxlcyBpZiBubyBmaWxlIGNvbmZpZ1xuICBjb25zdCBjb25maWc6IFB1Ymxpc2hlckNvbmZpZyA9IHt9O1xuXG4gIGlmIChwcm9jZXNzLmVudi5CTFVFU0tZX0lERU5USUZJRVIgJiYgcHJvY2Vzcy5lbnYuQkxVRVNLWV9QQVNTV09SRCkge1xuICAgIGNvbmZpZy5ibHVlc2t5ID0ge1xuICAgICAgaWRlbnRpZmllcjogcHJvY2Vzcy5lbnYuQkxVRVNLWV9JREVOVElGSUVSLFxuICAgICAgcGFzc3dvcmQ6IHByb2Nlc3MuZW52LkJMVUVTS1lfUEFTU1dPUkRcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk1BU1RPRE9OX0lOU1RBTkNFICYmIHByb2Nlc3MuZW52Lk1BU1RPRE9OX0FDQ0VTU19UT0tFTikge1xuICAgIGNvbmZpZy5tYXN0b2RvbiA9IHtcbiAgICAgIGluc3RhbmNlOiBwcm9jZXNzLmVudi5NQVNUT0RPTl9JTlNUQU5DRSxcbiAgICAgIGFjY2Vzc1Rva2VuOiBwcm9jZXNzLmVudi5NQVNUT0RPTl9BQ0NFU1NfVE9LRU5cbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52LkxJTktFRElOX0FDQ0VTU19UT0tFTikge1xuICAgIGNvbmZpZy5saW5rZWRpbiA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuOiBwcm9jZXNzLmVudi5MSU5LRURJTl9BQ0NFU1NfVE9LRU5cbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNvbmZpZztcbn1cblxucHJvZ3JhbS5wYXJzZSgpOyAiXX0=