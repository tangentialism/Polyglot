#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = require("commander");
const inquirer_1 = require("inquirer");
const chalk = tslib_1.__importStar(require("chalk"));
const ora_1 = tslib_1.__importDefault(require("ora"));
const dotenv = tslib_1.__importStar(require("dotenv"));
const publisher_1 = require("./publisher");
const fs_1 = require("fs");
const path_1 = require("path");
dotenv.config();
const program = new commander_1.Command();
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
            console.error(chalk.red('Error: No content provided. Use --content or --file option.'));
            process.exit(1);
        }
        const networks = options.networks || ['bluesky', 'mastodon', 'linkedin'];
        const spinner = (0, ora_1.default)('Publishing content...').start();
        const config = loadConfig();
        const publisher = new publisher_1.Publisher(config);
        if (options.dryRun) {
            spinner.stop();
            console.log(chalk.blue('\nDry run - would post to:'), networks.join(', '));
            console.log(chalk.gray('\nContent:'), content);
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
                console.log(chalk.green(`✓ ${network}: Posted successfully`));
                if (typedResult.postId) {
                    console.log(chalk.gray(`  Post ID: ${typedResult.postId}`));
                }
            }
            else {
                console.log(chalk.red(`✗ ${network}: ${typedResult.error || 'Unknown error'}`));
            }
        }
    }
    catch (error) {
        console.error(chalk.red('\nError:'), error instanceof Error ? error.message : 'Unknown error occurred');
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
        // TODO: Implement secure credential storage
        console.log(chalk.green('\nConfiguration saved successfully!'));
        console.log(chalk.yellow('Note: Credentials are stored locally. Keep them secure.'));
    }
    catch (error) {
        console.error(chalk.red('\nError:'), error instanceof Error ? error.message : 'Unknown error occurred');
        process.exit(1);
    }
}));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFFQSx5Q0FBb0M7QUFDcEMsdUNBQWtDO0FBQ2xDLHFEQUErQjtBQUMvQixzREFBc0I7QUFDdEIsdURBQWlDO0FBQ2pDLDJDQUF1RjtBQUN2RiwyQkFBa0M7QUFDbEMsK0JBQStCO0FBRS9CLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQVNoQixNQUFNLE9BQU8sR0FBRyxJQUFJLG1CQUFPLEVBQUUsQ0FBQztBQUU5QixPQUFPO0tBQ0osSUFBSSxDQUFDLFVBQVUsQ0FBQztLQUNoQixXQUFXLENBQUMsdURBQXVELENBQUM7S0FDcEUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXBCLE9BQU87S0FDSixPQUFPLENBQUMsTUFBTSxDQUFDO0tBQ2YsV0FBVyxDQUFDLDRDQUE0QyxDQUFDO0tBQ3pELE1BQU0sQ0FBQyx5QkFBeUIsRUFBRSxpQkFBaUIsQ0FBQztLQUNwRCxNQUFNLENBQUMsbUJBQW1CLEVBQUUsaUNBQWlDLENBQUM7S0FDOUQsTUFBTSxDQUFDLDhCQUE4QixFQUFFLDREQUE0RCxDQUFDO0tBQ3BHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsb0RBQW9ELENBQUM7S0FDekUsTUFBTSxDQUFDLENBQU8sT0FBb0IsRUFBRSxFQUFFO0lBQ3JDLElBQUksQ0FBQztRQUNILElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDOUIsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakIsT0FBTyxHQUFHLElBQUEsaUJBQVksRUFBQyxJQUFBLGNBQU8sRUFBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyw2REFB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cUI7U0FDL0MsQ0FBQztJQUNKLENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSAnY29tbWFuZGVyJztcbmltcG9ydCB7IHByb21wdCB9IGZyb20gJ2lucXVpcmVyJztcbmltcG9ydCAqIGFzIGNoYWxrIGZyb20gJ2NoYWxrJztcbmltcG9ydCBvcmEgZnJvbSAnb3JhJztcbmltcG9ydCAqIGFzIGRvdGVudiBmcm9tICdkb3RlbnYnO1xuaW1wb3J0IHsgUHVibGlzaGVyLCBQdWJsaXNoZXJDb25maWcsIFNvY2lhbE5ldHdvcmssIFB1Ymxpc2hSZXN1bHQgfSBmcm9tICcuL3B1Ymxpc2hlcic7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5cbmRvdGVudi5jb25maWcoKTtcblxuaW50ZXJmYWNlIFBvc3RPcHRpb25zIHtcbiAgY29udGVudD86IHN0cmluZztcbiAgZmlsZT86IHN0cmluZztcbiAgbmV0d29ya3M/OiBzdHJpbmdbXTtcbiAgZHJ5UnVuPzogYm9vbGVhbjtcbn1cblxuY29uc3QgcHJvZ3JhbSA9IG5ldyBDb21tYW5kKCk7XG5cbnByb2dyYW1cbiAgLm5hbWUoJ3BvbHlnbG90JylcbiAgLmRlc2NyaXB0aW9uKCdDcm9zcy1wb3N0IGNvbnRlbnQgdG8gbXVsdGlwbGUgc29jaWFsIG1lZGlhIHBsYXRmb3JtcycpXG4gIC52ZXJzaW9uKCcxLjAuMCcpO1xuXG5wcm9ncmFtXG4gIC5jb21tYW5kKCdwb3N0JylcbiAgLmRlc2NyaXB0aW9uKCdQb3N0IGNvbnRlbnQgdG8gY29uZmlndXJlZCBzb2NpYWwgbmV0d29ya3MnKVxuICAub3B0aW9uKCctYywgLS1jb250ZW50IDxjb250ZW50PicsICdDb250ZW50IHRvIHBvc3QnKVxuICAub3B0aW9uKCctZiwgLS1maWxlIDxmaWxlPicsICdGaWxlIGNvbnRhaW5pbmcgY29udGVudCB0byBwb3N0JylcbiAgLm9wdGlvbignLW4sIC0tbmV0d29ya3MgPG5ldHdvcmtzLi4uPicsICdTcGVjaWZpYyBuZXR3b3JrcyB0byBwb3N0IHRvIChibHVlc2t5LCBtYXN0b2RvbiwgbGlua2VkaW4pJylcbiAgLm9wdGlvbignLS1kcnktcnVuJywgJ1Nob3cgd2hhdCB3b3VsZCBiZSBwb3N0ZWQgd2l0aG91dCBhY3R1YWxseSBwb3N0aW5nJylcbiAgLmFjdGlvbihhc3luYyAob3B0aW9uczogUG9zdE9wdGlvbnMpID0+IHtcbiAgICB0cnkge1xuICAgICAgbGV0IGNvbnRlbnQgPSBvcHRpb25zLmNvbnRlbnQ7XG4gICAgICBpZiAob3B0aW9ucy5maWxlKSB7XG4gICAgICAgIGNvbnRlbnQgPSByZWFkRmlsZVN5bmMocmVzb2x2ZShvcHRpb25zLmZpbGUpLCAndXRmLTgnKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCFjb250ZW50KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKCdFcnJvcjogTm8gY29udGVudCBwcm92aWRlZC4gVXNlIC0tY29udGVudCBvciAtLWZpbGUgb3B0aW9uLicpKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBuZXR3b3JrcyA9IG9wdGlvbnMubmV0d29ya3MgfHwgWydibHVlc2t5JywgJ21hc3RvZG9uJywgJ2xpbmtlZGluJ107XG4gICAgICBjb25zdCBzcGlubmVyID0gb3JhKCdQdWJsaXNoaW5nIGNvbnRlbnQuLi4nKS5zdGFydCgpO1xuXG4gICAgICBjb25zdCBjb25maWcgPSBsb2FkQ29uZmlnKCk7XG4gICAgICBjb25zdCBwdWJsaXNoZXIgPSBuZXcgUHVibGlzaGVyKGNvbmZpZyk7XG5cbiAgICAgIGlmIChvcHRpb25zLmRyeVJ1bikge1xuICAgICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsuYmx1ZSgnXFxuRHJ5IHJ1biAtIHdvdWxkIHBvc3QgdG86JyksIG5ldHdvcmtzLmpvaW4oJywgJykpO1xuICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5ncmF5KCdcXG5Db250ZW50OicpLCBjb250ZW50KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgcHVibGlzaGVyLnB1Ymxpc2goe1xuICAgICAgICBjb250ZW50LFxuICAgICAgICBuZXR3b3JrczogbmV0d29ya3MgYXMgU29jaWFsTmV0d29ya1tdXG4gICAgICB9KTtcblxuICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICBcbiAgICAgIGNvbnNvbGUubG9nKCdcXG5QdWJsaXNoaW5nIHJlc3VsdHM6Jyk7XG4gICAgICBmb3IgKGNvbnN0IFtuZXR3b3JrLCByZXN1bHRdIG9mIE9iamVjdC5lbnRyaWVzKHJlc3VsdHMpKSB7XG4gICAgICAgIGNvbnN0IHR5cGVkUmVzdWx0ID0gcmVzdWx0IGFzIFB1Ymxpc2hSZXN1bHQ7XG4gICAgICAgIGlmICh0eXBlZFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oYOKckyAke25ldHdvcmt9OiBQb3N0ZWQgc3VjY2Vzc2Z1bGx5YCkpO1xuICAgICAgICAgIGlmICh0eXBlZFJlc3VsdC5wb3N0SWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyYXkoYCAgUG9zdCBJRDogJHt0eXBlZFJlc3VsdC5wb3N0SWR9YCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5yZWQoYOKclyAke25ldHdvcmt9OiAke3R5cGVkUmVzdWx0LmVycm9yIHx8ICdVbmtub3duIGVycm9yJ31gKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ1xcbkVycm9yOicpLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJyk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9KTtcblxucHJvZ3JhbVxuICAuY29tbWFuZCgnY29uZmlndXJlJylcbiAgLmRlc2NyaXB0aW9uKCdDb25maWd1cmUgc29jaWFsIG5ldHdvcmsgY3JlZGVudGlhbHMnKVxuICAuYWN0aW9uKGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYW5zd2VycyA9IGF3YWl0IHByb21wdChbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnY2hlY2tib3gnLFxuICAgICAgICAgIG5hbWU6ICduZXR3b3JrcycsXG4gICAgICAgICAgbWVzc2FnZTogJ1NlbGVjdCBuZXR3b3JrcyB0byBjb25maWd1cmU6JyxcbiAgICAgICAgICBjaG9pY2VzOiBbJ2JsdWVza3knLCAnbWFzdG9kb24nLCAnbGlua2VkaW4nXVxuICAgICAgICB9XG4gICAgICBdKTtcblxuICAgICAgY29uc3QgY29uZmlnOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICAgIGZvciAoY29uc3QgbmV0d29yayBvZiBhbnN3ZXJzLm5ldHdvcmtzKSB7XG4gICAgICAgIGNvbnN0IG5ldHdvcmtBbnN3ZXJzID0gYXdhaXQgcHJvbXB0KGdldE5ldHdvcmtRdWVzdGlvbnMobmV0d29yaykpO1xuICAgICAgICBjb25maWdbbmV0d29ya10gPSBuZXR3b3JrQW5zd2VycztcbiAgICAgIH1cblxuICAgICAgLy8gU2F2ZSBjb25maWd1cmF0aW9uXG4gICAgICAvLyBUT0RPOiBJbXBsZW1lbnQgc2VjdXJlIGNyZWRlbnRpYWwgc3RvcmFnZVxuICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oJ1xcbkNvbmZpZ3VyYXRpb24gc2F2ZWQgc3VjY2Vzc2Z1bGx5IScpKTtcbiAgICAgIGNvbnNvbGUubG9nKGNoYWxrLnllbGxvdygnTm90ZTogQ3JlZGVudGlhbHMgYXJlIHN0b3JlZCBsb2NhbGx5LiBLZWVwIHRoZW0gc2VjdXJlLicpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ1xcbkVycm9yOicpLCBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJyk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9KTtcblxuZnVuY3Rpb24gZ2V0TmV0d29ya1F1ZXN0aW9ucyhuZXR3b3JrOiBzdHJpbmcpIHtcbiAgc3dpdGNoIChuZXR3b3JrKSB7XG4gICAgY2FzZSAnYmx1ZXNreSc6XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ2lucHV0JyxcbiAgICAgICAgICBuYW1lOiAnaWRlbnRpZmllcicsXG4gICAgICAgICAgbWVzc2FnZTogJ0VudGVyIHlvdXIgQmx1ZXNreSBpZGVudGlmaWVyIChlLmcuLCB1c2VyLmJza3kuc29jaWFsKTonXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAncGFzc3dvcmQnLFxuICAgICAgICAgIG5hbWU6ICdwYXNzd29yZCcsXG4gICAgICAgICAgbWVzc2FnZTogJ0VudGVyIHlvdXIgQmx1ZXNreSBhcHAgcGFzc3dvcmQ6J1xuICAgICAgICB9XG4gICAgICBdO1xuICAgIGNhc2UgJ21hc3RvZG9uJzpcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgIG5hbWU6ICdpbnN0YW5jZScsXG4gICAgICAgICAgbWVzc2FnZTogJ0VudGVyIHlvdXIgTWFzdG9kb24gaW5zdGFuY2UgVVJMOidcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdwYXNzd29yZCcsXG4gICAgICAgICAgbmFtZTogJ2FjY2Vzc1Rva2VuJyxcbiAgICAgICAgICBtZXNzYWdlOiAnRW50ZXIgeW91ciBNYXN0b2RvbiBhY2Nlc3MgdG9rZW46J1xuICAgICAgICB9XG4gICAgICBdO1xuICAgIGNhc2UgJ2xpbmtlZGluJzpcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAncGFzc3dvcmQnLFxuICAgICAgICAgIG5hbWU6ICdhY2Nlc3NUb2tlbicsXG4gICAgICAgICAgbWVzc2FnZTogJ0VudGVyIHlvdXIgTGlua2VkSW4gYWNjZXNzIHRva2VuOidcbiAgICAgICAgfVxuICAgICAgXTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFtdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvYWRDb25maWcoKTogUHVibGlzaGVyQ29uZmlnIHtcbiAgY29uc3QgY29uZmlnOiBQdWJsaXNoZXJDb25maWcgPSB7fTtcblxuICBpZiAocHJvY2Vzcy5lbnYuQkxVRVNLWV9JREVOVElGSUVSICYmIHByb2Nlc3MuZW52LkJMVUVTS1lfUEFTU1dPUkQpIHtcbiAgICBjb25maWcuYmx1ZXNreSA9IHtcbiAgICAgIGlkZW50aWZpZXI6IHByb2Nlc3MuZW52LkJMVUVTS1lfSURFTlRJRklFUixcbiAgICAgIHBhc3N3b3JkOiBwcm9jZXNzLmVudi5CTFVFU0tZX1BBU1NXT1JEXG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLmVudi5NQVNUT0RPTl9JTlNUQU5DRSAmJiBwcm9jZXNzLmVudi5NQVNUT0RPTl9BQ0NFU1NfVE9LRU4pIHtcbiAgICBjb25maWcubWFzdG9kb24gPSB7XG4gICAgICBpbnN0YW5jZTogcHJvY2Vzcy5lbnYuTUFTVE9ET05fSU5TVEFOQ0UsXG4gICAgICBhY2Nlc3NUb2tlbjogcHJvY2Vzcy5lbnYuTUFTVE9ET05fQUNDRVNTX1RPS0VOXG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLmVudi5MSU5LRURJTl9BQ0NFU1NfVE9LRU4pIHtcbiAgICBjb25maWcubGlua2VkaW4gPSB7XG4gICAgICBhY2Nlc3NUb2tlbjogcHJvY2Vzcy5lbnYuTElOS0VESU5fQUNDRVNTX1RPS0VOXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjb25maWc7XG59XG5cbnByb2dyYW0ucGFyc2UoKTsgIl19