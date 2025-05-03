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
    .option('-n, --networks <networks...>', 'Specific networks to post to (bluesky, mastodon)')
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
        const networks = options.networks || ['bluesky', 'mastodon'];
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
                choices: ['bluesky', 'mastodon']
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
    return config;
}
program.parse();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFFQSx5Q0FBb0M7QUFDcEMsdUNBQWtDO0FBQ2xDLDBEQUEwQjtBQUMxQixzREFBc0I7QUFDdEIsdURBQWlDO0FBQ2pDLDJDQUF1RjtBQUN2RiwyQkFBa0M7QUFDbEMsK0JBQStCO0FBQy9CLHFDQUF5QztBQUV6QyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFTaEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxtQkFBTyxFQUFFLENBQUM7QUFDOUIsTUFBTSxhQUFhLEdBQUcsSUFBSSxzQkFBYSxFQUFFLENBQUM7QUFFMUMsT0FBTztLQUNKLElBQUksQ0FBQyxVQUFVLENBQUM7S0FDaEIsV0FBVyxDQUFDLHVEQUF1RCxDQUFDO0tBQ3BFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUVwQixPQUFPO0tBQ0osT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUNmLFdBQVcsQ0FBQyw0Q0FBNEMsQ0FBQztLQUN6RCxNQUFNLENBQUMseUJBQXlCLEVBQUUsaUJBQWlCLENBQUM7S0FDcEQsTUFBTSxDQUFDLG1CQUFtQixFQUFFLGlDQUFpQyxDQUFDO0tBQzlELE1BQU0sQ0FBQyw4QkFBOEIsRUFBRSxrREFBa0QsQ0FBQztLQUMxRixNQUFNLENBQUMsV0FBVyxFQUFFLG9EQUFvRCxDQUFDO0tBQ3pFLE1BQU0sQ0FBQyxDQUFPLE9BQW9CLEVBQUUsRUFBRTtJQUNyQyxJQUFJLENBQUM7UUFDSCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQzlCLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2pCLE9BQU8sR0FBRyxJQUFBLGlCQUFZLEVBQUMsSUFBQSxjQUFPLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxJQUFJLENBQUMsT0FBTyxFQUFF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VTtvQkFDaEIsSUFBSSxFQUFFLGFBQWE7b0JBQ25CLE9BQU8sRUFBRSxtQ0FBbUM7aUJBQzdDO2FBQ0YsQ0FBQztRQUNKO1lBQ0UsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsVUFBVTtJQUNqQixxQ0FBcUM7SUFDckMsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzlDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDdkMsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVELHVEQUF1RDtJQUN2RCxNQUFNLE1BQU0sR0FBb0IsRUFBRSxDQUFDO0lBRW5DLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDbkUsTUFBTSxDQUFDLE9BQU8sR0FBRztZQUNmLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQjtZQUMxQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0I7U0FDdkMsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3ZFLE1BQU0sQ0FBQyxRQUFRLEdBQUc7WUFDaEIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCO1lBQ3ZDLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQjtTQUMvQyxDQUFDO0lBQ0osQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tICdjb21tYW5kZXInO1xuaW1wb3J0IHsgcHJvbXB0IH0gZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCBvcmEgZnJvbSAnb3JhJztcbmltcG9ydCAqIGFzIGRvdGVudiBmcm9tICdkb3RlbnYnO1xuaW1wb3J0IHsgUHVibGlzaGVyLCBQdWJsaXNoZXJDb25maWcsIFNvY2lhbE5ldHdvcmssIFB1Ymxpc2hSZXN1bHQgfSBmcm9tICcuL3B1Ymxpc2hlcic7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBDb25maWdNYW5hZ2VyIH0gZnJvbSAnLi9jb25maWcnO1xuXG5kb3RlbnYuY29uZmlnKCk7XG5cbmludGVyZmFjZSBQb3N0T3B0aW9ucyB7XG4gIGNvbnRlbnQ/OiBzdHJpbmc7XG4gIGZpbGU/OiBzdHJpbmc7XG4gIG5ldHdvcmtzPzogc3RyaW5nW107XG4gIGRyeVJ1bj86IGJvb2xlYW47XG59XG5cbmNvbnN0IHByb2dyYW0gPSBuZXcgQ29tbWFuZCgpO1xuY29uc3QgY29uZmlnTWFuYWdlciA9IG5ldyBDb25maWdNYW5hZ2VyKCk7XG5cbnByb2dyYW1cbiAgLm5hbWUoJ3BvbHlnbG90JylcbiAgLmRlc2NyaXB0aW9uKCdDcm9zcy1wb3N0IGNvbnRlbnQgdG8gbXVsdGlwbGUgc29jaWFsIG1lZGlhIHBsYXRmb3JtcycpXG4gIC52ZXJzaW9uKCcxLjAuMCcpO1xuXG5wcm9ncmFtXG4gIC5jb21tYW5kKCdwb3N0JylcbiAgLmRlc2NyaXB0aW9uKCdQb3N0IGNvbnRlbnQgdG8gY29uZmlndXJlZCBzb2NpYWwgbmV0d29ya3MnKVxuICAub3B0aW9uKCctYywgLS1jb250ZW50IDxjb250ZW50PicsICdDb250ZW50IHRvIHBvc3QnKVxuICAub3B0aW9uKCctZiwgLS1maWxlIDxmaWxlPicsICdGaWxlIGNvbnRhaW5pbmcgY29udGVudCB0byBwb3N0JylcbiAgLm9wdGlvbignLW4sIC0tbmV0d29ya3MgPG5ldHdvcmtzLi4uPicsICdTcGVjaWZpYyBuZXR3b3JrcyB0byBwb3N0IHRvIChibHVlc2t5LCBtYXN0b2RvbiknKVxuICAub3B0aW9uKCctLWRyeS1ydW4nLCAnU2hvdyB3aGF0IHdvdWxkIGJlIHBvc3RlZCB3aXRob3V0IGFjdHVhbGx5IHBvc3RpbmcnKVxuICAuYWN0aW9uKGFzeW5jIChvcHRpb25zOiBQb3N0T3B0aW9ucykgPT4ge1xuICAgIHRyeSB7XG4gICAgICBsZXQgY29udGVudCA9IG9wdGlvbnMuY29udGVudDtcbiAgICAgIGlmIChvcHRpb25zLmZpbGUpIHtcbiAgICAgICAgY29udGVudCA9IHJlYWRGaWxlU3luYyhyZXNvbHZlKG9wdGlvbnMuZmlsZSksICd1dGYtOCcpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoIWNvbnRlbnQpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ0Vycm9yOiBObyBjb250ZW50IHByb3ZpZGVkLiBVc2UgLS1jb250ZW50IG9yIC0tZmlsZSBvcHRpb24uJykpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5ldHdvcmtzID0gb3B0aW9ucy5uZXR3b3JrcyB8fCBbJ2JsdWVza3knLCAnbWFzdG9kb24nXTtcbiAgICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEoJ1B1Ymxpc2hpbmcgY29udGVudC4uLicpLnN0YXJ0KCk7XG5cbiAgICAgIGNvbnN0IGNvbmZpZyA9IGxvYWRDb25maWcoKTtcbiAgICAgIFxuICAgICAgLy8gQ2hlY2sgaWYgYW55IG5ldHdvcmtzIGFyZSBjb25maWd1cmVkXG4gICAgICBjb25zdCBjb25maWd1cmVkTmV0d29ya3MgPSBPYmplY3Qua2V5cyhjb25maWcpO1xuICAgICAgaWYgKGNvbmZpZ3VyZWROZXR3b3Jrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKCdcXG5FcnJvcjogTm8gbmV0d29ya3MgY29uZmlndXJlZC4gUnVuIGBwb2x5Z2xvdCBjb25maWd1cmVgIGZpcnN0LicpKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiByZXF1ZXN0ZWQgbmV0d29ya3MgYXJlIGNvbmZpZ3VyZWRcbiAgICAgIGNvbnN0IHVuY29uZmlndXJlZE5ldHdvcmtzID0gbmV0d29ya3MuZmlsdGVyKG4gPT4gIWNvbmZpZ3VyZWROZXR3b3Jrcy5pbmNsdWRlcyhuKSk7XG4gICAgICBpZiAodW5jb25maWd1cmVkTmV0d29ya3MubGVuZ3RoID4gMCkge1xuICAgICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoYFxcbkVycm9yOiBUaGUgZm9sbG93aW5nIG5ldHdvcmtzIGFyZSBub3QgY29uZmlndXJlZDogJHt1bmNvbmZpZ3VyZWROZXR3b3Jrcy5qb2luKCcsICcpfWApKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay55ZWxsb3coJ1J1biBgcG9seWdsb3QgY29uZmlndXJlYCB0byBzZXQgdGhlbSB1cC4nKSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHVibGlzaGVyID0gbmV3IFB1Ymxpc2hlcihjb25maWcpO1xuXG4gICAgICBpZiAob3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmJsdWUoJ1xcbkRyeSBydW4gLSB3b3VsZCBwb3N0IHRvOicpLCBuZXR3b3Jrcy5qb2luKCcsICcpKTtcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZGltKCdcXG5Db250ZW50OicpLCBjb250ZW50KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgcHVibGlzaGVyLnB1Ymxpc2goe1xuICAgICAgICBjb250ZW50LFxuICAgICAgICBuZXR3b3JrczogbmV0d29ya3MgYXMgU29jaWFsTmV0d29ya1tdXG4gICAgICB9KTtcblxuICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICBcbiAgICAgIGNvbnNvbGUubG9nKCdcXG5QdWJsaXNoaW5nIHJlc3VsdHM6Jyk7XG4gICAgICBmb3IgKGNvbnN0IFtuZXR3b3JrLCByZXN1bHRdIG9mIE9iamVjdC5lbnRyaWVzKHJlc3VsdHMpKSB7XG4gICAgICAgIGNvbnN0IHR5cGVkUmVzdWx0ID0gcmVzdWx0IGFzIFB1Ymxpc2hSZXN1bHQ7XG4gICAgICAgIGlmICh0eXBlZFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oYOKckyAke25ldHdvcmt9OiBQb3N0ZWQgc3VjY2Vzc2Z1bGx5YCkpO1xuICAgICAgICAgIGlmICh0eXBlZFJlc3VsdC5wb3N0SWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmRpbShgICBQb3N0IElEOiAke3R5cGVkUmVzdWx0LnBvc3RJZH1gKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLnJlZChg4pyXICR7bmV0d29ya306ICR7dHlwZWRSZXN1bHQuZXJyb3IgfHwgJ1Vua25vd24gZXJyb3InfWApKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZCgnXFxuRXJyb3I6JyksIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0pO1xuXG5wcm9ncmFtXG4gIC5jb21tYW5kKCdjb25maWd1cmUnKVxuICAuZGVzY3JpcHRpb24oJ0NvbmZpZ3VyZSBzb2NpYWwgbmV0d29yayBjcmVkZW50aWFscycpXG4gIC5hY3Rpb24oYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBhbnN3ZXJzID0gYXdhaXQgcHJvbXB0KFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgbmFtZTogJ25ldHdvcmtzJyxcbiAgICAgICAgICBtZXNzYWdlOiAnU2VsZWN0IG5ldHdvcmtzIHRvIGNvbmZpZ3VyZTonLFxuICAgICAgICAgIGNob2ljZXM6IFsnYmx1ZXNreScsICdtYXN0b2RvbiddXG4gICAgICAgIH1cbiAgICAgIF0pO1xuXG4gICAgICBjb25zdCBjb25maWc6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblxuICAgICAgZm9yIChjb25zdCBuZXR3b3JrIG9mIGFuc3dlcnMubmV0d29ya3MpIHtcbiAgICAgICAgY29uc3QgbmV0d29ya0Fuc3dlcnMgPSBhd2FpdCBwcm9tcHQoZ2V0TmV0d29ya1F1ZXN0aW9ucyhuZXR3b3JrKSk7XG4gICAgICAgIGNvbmZpZ1tuZXR3b3JrXSA9IG5ldHdvcmtBbnN3ZXJzO1xuICAgICAgfVxuXG4gICAgICAvLyBTYXZlIGNvbmZpZ3VyYXRpb25cbiAgICAgIGNvbmZpZ01hbmFnZXIuc2F2ZUNvbmZpZyhjb25maWcpO1xuICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oJ1xcbkNvbmZpZ3VyYXRpb24gc2F2ZWQgc3VjY2Vzc2Z1bGx5IScpKTtcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLnllbGxvdygnTm90ZTogQ3JlZGVudGlhbHMgYXJlIHN0b3JlZCBpbiB+Ly5wb2x5Z2xvdC9jb25maWcuanNvbicpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ1xcbkVycm9yOicpLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJyk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9KTtcblxucHJvZ3JhbVxuICAuY29tbWFuZCgnc3RhdHVzJylcbiAgLmRlc2NyaXB0aW9uKCdTaG93IGNvbmZpZ3VyZWQgbmV0d29ya3MgYW5kIHRoZWlyIHN0YXR1cycpXG4gIC5hY3Rpb24oKCkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ01hbmFnZXIubG9hZENvbmZpZygpO1xuICAgIGNvbnN0IG5ldHdvcmtzID0gT2JqZWN0LmtleXMoY29uZmlnKTtcblxuICAgIGlmIChuZXR3b3Jrcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLnllbGxvdygnTm8gbmV0d29ya3MgY29uZmlndXJlZC4gUnVuIGBwb2x5Z2xvdCBjb25maWd1cmVgIHRvIHNldCB1cCBuZXR3b3Jrcy4nKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coY2hhbGsuYmx1ZSgnXFxuQ29uZmlndXJlZCBuZXR3b3JrczonKSk7XG4gICAgZm9yIChjb25zdCBuZXR3b3JrIG9mIG5ldHdvcmtzKSB7XG4gICAgICBjb25zb2xlLmxvZyhjaGFsay5ncmVlbihg4pyTICR7bmV0d29ya31gKSk7XG4gICAgICBzd2l0Y2ggKG5ldHdvcmspIHtcbiAgICAgICAgY2FzZSAnYmx1ZXNreSc6XG4gICAgICAgICAgaWYgKGNvbmZpZy5ibHVlc2t5Py5pZGVudGlmaWVyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5kaW0oYCAgSWRlbnRpZmllcjogJHtjb25maWcuYmx1ZXNreS5pZGVudGlmaWVyfWApKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21hc3RvZG9uJzpcbiAgICAgICAgICBpZiAoY29uZmlnLm1hc3RvZG9uPy5pbnN0YW5jZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZGltKGAgIEluc3RhbmNlOiAke2NvbmZpZy5tYXN0b2Rvbi5pbnN0YW5jZX1gKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbmZ1bmN0aW9uIGdldE5ldHdvcmtRdWVzdGlvbnMobmV0d29yazogc3RyaW5nKSB7XG4gIHN3aXRjaCAobmV0d29yaykge1xuICAgIGNhc2UgJ2JsdWVza3knOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgbmFtZTogJ2lkZW50aWZpZXInLFxuICAgICAgICAgIG1lc3NhZ2U6ICdFbnRlciB5b3VyIEJsdWVza3kgaWRlbnRpZmllciAoZS5nLiwgdXNlci5ic2t5LnNvY2lhbCk6J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICBuYW1lOiAncGFzc3dvcmQnLFxuICAgICAgICAgIG1lc3NhZ2U6ICdFbnRlciB5b3VyIEJsdWVza3kgYXBwIHBhc3N3b3JkOidcbiAgICAgICAgfVxuICAgICAgXTtcbiAgICBjYXNlICdtYXN0b2Rvbic6XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICBuYW1lOiAnaW5zdGFuY2UnLFxuICAgICAgICAgIG1lc3NhZ2U6ICdFbnRlciB5b3VyIE1hc3RvZG9uIGluc3RhbmNlIFVSTDonXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAncGFzc3dvcmQnLFxuICAgICAgICAgIG5hbWU6ICdhY2Nlc3NUb2tlbicsXG4gICAgICAgICAgbWVzc2FnZTogJ0VudGVyIHlvdXIgTWFzdG9kb24gYWNjZXNzIHRva2VuOidcbiAgICAgICAgfVxuICAgICAgXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFtdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvYWRDb25maWcoKTogUHVibGlzaGVyQ29uZmlnIHtcbiAgLy8gRmlyc3QgdHJ5IGxvYWRpbmcgZnJvbSBjb25maWcgZmlsZVxuICBjb25zdCBmaWxlQ29uZmlnID0gY29uZmlnTWFuYWdlci5sb2FkQ29uZmlnKCk7XG4gIGlmIChPYmplY3Qua2V5cyhmaWxlQ29uZmlnKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIGZpbGVDb25maWc7XG4gIH1cblxuICAvLyBGYWxsIGJhY2sgdG8gZW52aXJvbm1lbnQgdmFyaWFibGVzIGlmIG5vIGZpbGUgY29uZmlnXG4gIGNvbnN0IGNvbmZpZzogUHVibGlzaGVyQ29uZmlnID0ge307XG5cbiAgaWYgKHByb2Nlc3MuZW52LkJMVUVTS1lfSURFTlRJRklFUiAmJiBwcm9jZXNzLmVudi5CTFVFU0tZX1BBU1NXT1JEKSB7XG4gICAgY29uZmlnLmJsdWVza3kgPSB7XG4gICAgICBpZGVudGlmaWVyOiBwcm9jZXNzLmVudi5CTFVFU0tZX0lERU5USUZJRVIsXG4gICAgICBwYXNzd29yZDogcHJvY2Vzcy5lbnYuQkxVRVNLWV9QQVNTV09SRFxuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5lbnYuTUFTVE9ET05fSU5TVEFOQ0UgJiYgcHJvY2Vzcy5lbnYuTUFTVE9ET05fQUNDRVNTX1RPS0VOKSB7XG4gICAgY29uZmlnLm1hc3RvZG9uID0ge1xuICAgICAgaW5zdGFuY2U6IHByb2Nlc3MuZW52Lk1BU1RPRE9OX0lOU1RBTkNFLFxuICAgICAgYWNjZXNzVG9rZW46IHByb2Nlc3MuZW52Lk1BU1RPRE9OX0FDQ0VTU19UT0tFTlxuICAgIH07XG4gIH1cblxuICByZXR1cm4gY29uZmlnO1xufVxuXG5wcm9ncmFtLnBhcnNlKCk7ICJdfQ==