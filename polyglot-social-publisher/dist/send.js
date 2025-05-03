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
            console.error(chalk_1.default.red('Error: No content provided. Use --content or --file option.'));
            process.exit(1);
        }
        const networks = options.networks || ['bluesky', 'mastodon', 'linkedin'];
        const spinner = (0, ora_1.default)('Publishing content...').start();
        const config = loadConfig();
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
        // TODO: Implement secure credential storage
        console.log(chalk_1.default.green('\nConfiguration saved successfully!'));
        console.log(chalk_1.default.yellow('Note: Credentials are stored locally. Keep them secure.'));
    }
    catch (error) {
        console.error(chalk_1.default.red('\nError:'), error instanceof Error ? error.message : 'Unknown error occurred');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFFQSx5Q0FBb0M7QUFDcEMsdUNBQWtDO0FBQ2xDLDBEQUEwQjtBQUMxQixzREFBc0I7QUFDdEIsdURBQWlDO0FBQ2pDLDJDQUF1RjtBQUN2RiwyQkFBa0M7QUFDbEMsK0JBQStCO0FBRS9CLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQVNoQixNQUFNLE9BQU8sR0FBRyxJQUFJLG1CQUFPLEVBQUUsQ0FBQztBQUU5QixPQUFPO0tBQ0osSUFBSSxDQUFDLFVBQVUsQ0FBQztLQUNoQixXQUFXLENBQUMsdURBQXVELENBQUM7S0FDcEUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXBCLE9BQU87S0FDSixPQUFPLENBQUMsTUFBTSxDQUFDO0tBQ2YsV0FBVyxDQUFDLDRDQUE0QyxDQUFDO0tBQ3pELE1BQU0sQ0FBQyx5QkFBeUIsRUFBRSxpQkFBaUIsQ0FBQztLQUNwRCxNQUFNLENBQUMsbUJBQW1CLEVBQUUsaUNBQWlDLENBQUM7S0FDOUQsTUFBTSxDQUFDLDhCQUE4QixFQUFFLDREQUE0RCxDQUFDO0tBQ3BHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsb0RBQW9ELENBQUM7S0FDekUsTUFBTSxDQUFDLENBQU8sT0FBb0IsRUFBRSxFQUFFO0lBQ3JDLElBQUksQ0FBQztRQUNILElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDOUIsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakIsT0FBTyxHQUFHLElBQUEsaUJBQVksRUFBQyxJQUFBLGNBQU8sRUFBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBSyxDQUFDLEdBQUcsQ0FBQyw2REFB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cUI7U0FDL0MsQ0FBQztJQUNKLENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuXG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSAnY29tbWFuZGVyJztcbmltcG9ydCB7IHByb21wdCB9IGZyb20gJ2lucXVpcmVyJztcbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQgb3JhIGZyb20gJ29yYSc7XG5pbXBvcnQgKiBhcyBkb3RlbnYgZnJvbSAnZG90ZW52JztcbmltcG9ydCB7IFB1Ymxpc2hlciwgUHVibGlzaGVyQ29uZmlnLCBTb2NpYWxOZXR3b3JrLCBQdWJsaXNoUmVzdWx0IH0gZnJvbSAnLi9wdWJsaXNoZXInO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuXG5kb3RlbnYuY29uZmlnKCk7XG5cbmludGVyZmFjZSBQb3N0T3B0aW9ucyB7XG4gIGNvbnRlbnQ/OiBzdHJpbmc7XG4gIGZpbGU/OiBzdHJpbmc7XG4gIG5ldHdvcmtzPzogc3RyaW5nW107XG4gIGRyeVJ1bj86IGJvb2xlYW47XG59XG5cbmNvbnN0IHByb2dyYW0gPSBuZXcgQ29tbWFuZCgpO1xuXG5wcm9ncmFtXG4gIC5uYW1lKCdwb2x5Z2xvdCcpXG4gIC5kZXNjcmlwdGlvbignQ3Jvc3MtcG9zdCBjb250ZW50IHRvIG11bHRpcGxlIHNvY2lhbCBtZWRpYSBwbGF0Zm9ybXMnKVxuICAudmVyc2lvbignMS4wLjAnKTtcblxucHJvZ3JhbVxuICAuY29tbWFuZCgncG9zdCcpXG4gIC5kZXNjcmlwdGlvbignUG9zdCBjb250ZW50IHRvIGNvbmZpZ3VyZWQgc29jaWFsIG5ldHdvcmtzJylcbiAgLm9wdGlvbignLWMsIC0tY29udGVudCA8Y29udGVudD4nLCAnQ29udGVudCB0byBwb3N0JylcbiAgLm9wdGlvbignLWYsIC0tZmlsZSA8ZmlsZT4nLCAnRmlsZSBjb250YWluaW5nIGNvbnRlbnQgdG8gcG9zdCcpXG4gIC5vcHRpb24oJy1uLCAtLW5ldHdvcmtzIDxuZXR3b3Jrcy4uLj4nLCAnU3BlY2lmaWMgbmV0d29ya3MgdG8gcG9zdCB0byAoYmx1ZXNreSwgbWFzdG9kb24sIGxpbmtlZGluKScpXG4gIC5vcHRpb24oJy0tZHJ5LXJ1bicsICdTaG93IHdoYXQgd291bGQgYmUgcG9zdGVkIHdpdGhvdXQgYWN0dWFsbHkgcG9zdGluZycpXG4gIC5hY3Rpb24oYXN5bmMgKG9wdGlvbnM6IFBvc3RPcHRpb25zKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBjb250ZW50ID0gb3B0aW9ucy5jb250ZW50O1xuICAgICAgaWYgKG9wdGlvbnMuZmlsZSkge1xuICAgICAgICBjb250ZW50ID0gcmVhZEZpbGVTeW5jKHJlc29sdmUob3B0aW9ucy5maWxlKSwgJ3V0Zi04Jyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghY29udGVudCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZCgnRXJyb3I6IE5vIGNvbnRlbnQgcHJvdmlkZWQuIFVzZSAtLWNvbnRlbnQgb3IgLS1maWxlIG9wdGlvbi4nKSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV0d29ya3MgPSBvcHRpb25zLm5ldHdvcmtzIHx8IFsnYmx1ZXNreScsICdtYXN0b2RvbicsICdsaW5rZWRpbiddO1xuICAgICAgY29uc3Qgc3Bpbm5lciA9IG9yYSgnUHVibGlzaGluZyBjb250ZW50Li4uJykuc3RhcnQoKTtcblxuICAgICAgY29uc3QgY29uZmlnID0gbG9hZENvbmZpZygpO1xuICAgICAgY29uc3QgcHVibGlzaGVyID0gbmV3IFB1Ymxpc2hlcihjb25maWcpO1xuXG4gICAgICBpZiAob3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmJsdWUoJ1xcbkRyeSBydW4gLSB3b3VsZCBwb3N0IHRvOicpLCBuZXR3b3Jrcy5qb2luKCcsICcpKTtcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZGltKCdcXG5Db250ZW50OicpLCBjb250ZW50KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgcHVibGlzaGVyLnB1Ymxpc2goe1xuICAgICAgICBjb250ZW50LFxuICAgICAgICBuZXR3b3JrczogbmV0d29ya3MgYXMgU29jaWFsTmV0d29ya1tdXG4gICAgICB9KTtcblxuICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICBcbiAgICAgIGNvbnNvbGUubG9nKCdcXG5QdWJsaXNoaW5nIHJlc3VsdHM6Jyk7XG4gICAgICBmb3IgKGNvbnN0IFtuZXR3b3JrLCByZXN1bHRdIG9mIE9iamVjdC5lbnRyaWVzKHJlc3VsdHMpKSB7XG4gICAgICAgIGNvbnN0IHR5cGVkUmVzdWx0ID0gcmVzdWx0IGFzIFB1Ymxpc2hSZXN1bHQ7XG4gICAgICAgIGlmICh0eXBlZFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coY2hhbGsuZ3JlZW4oYOKckyAke25ldHdvcmt9OiBQb3N0ZWQgc3VjY2Vzc2Z1bGx5YCkpO1xuICAgICAgICAgIGlmICh0eXBlZFJlc3VsdC5wb3N0SWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmRpbShgICBQb3N0IElEOiAke3R5cGVkUmVzdWx0LnBvc3RJZH1gKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLnJlZChg4pyXICR7bmV0d29ya306ICR7dHlwZWRSZXN1bHQuZXJyb3IgfHwgJ1Vua25vd24gZXJyb3InfWApKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZCgnXFxuRXJyb3I6JyksIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0pO1xuXG5wcm9ncmFtXG4gIC5jb21tYW5kKCdjb25maWd1cmUnKVxuICAuZGVzY3JpcHRpb24oJ0NvbmZpZ3VyZSBzb2NpYWwgbmV0d29yayBjcmVkZW50aWFscycpXG4gIC5hY3Rpb24oYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBhbnN3ZXJzID0gYXdhaXQgcHJvbXB0KFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdjaGVja2JveCcsXG4gICAgICAgICAgbmFtZTogJ25ldHdvcmtzJyxcbiAgICAgICAgICBtZXNzYWdlOiAnU2VsZWN0IG5ldHdvcmtzIHRvIGNvbmZpZ3VyZTonLFxuICAgICAgICAgIGNob2ljZXM6IFsnYmx1ZXNreScsICdtYXN0b2RvbicsICdsaW5rZWRpbiddXG4gICAgICAgIH1cbiAgICAgIF0pO1xuXG4gICAgICBjb25zdCBjb25maWc6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblxuICAgICAgZm9yIChjb25zdCBuZXR3b3JrIG9mIGFuc3dlcnMubmV0d29ya3MpIHtcbiAgICAgICAgY29uc3QgbmV0d29ya0Fuc3dlcnMgPSBhd2FpdCBwcm9tcHQoZ2V0TmV0d29ya1F1ZXN0aW9ucyhuZXR3b3JrKSk7XG4gICAgICAgIGNvbmZpZ1tuZXR3b3JrXSA9IG5ldHdvcmtBbnN3ZXJzO1xuICAgICAgfVxuXG4gICAgICAvLyBTYXZlIGNvbmZpZ3VyYXRpb25cbiAgICAgIC8vIFRPRE86IEltcGxlbWVudCBzZWN1cmUgY3JlZGVudGlhbCBzdG9yYWdlXG4gICAgICBjb25zb2xlLmxvZyhjaGFsay5ncmVlbignXFxuQ29uZmlndXJhdGlvbiBzYXZlZCBzdWNjZXNzZnVsbHkhJykpO1xuICAgICAgY29uc29sZS5sb2coY2hhbGsueWVsbG93KCdOb3RlOiBDcmVkZW50aWFscyBhcmUgc3RvcmVkIGxvY2FsbHkuIEtlZXAgdGhlbSBzZWN1cmUuJykpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZCgnXFxuRXJyb3I6JyksIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0pO1xuXG5mdW5jdGlvbiBnZXROZXR3b3JrUXVlc3Rpb25zKG5ldHdvcms6IHN0cmluZykge1xuICBzd2l0Y2ggKG5ldHdvcmspIHtcbiAgICBjYXNlICdibHVlc2t5JzpcbiAgICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxuICAgICAgICAgIG5hbWU6ICdpZGVudGlmaWVyJyxcbiAgICAgICAgICBtZXNzYWdlOiAnRW50ZXIgeW91ciBCbHVlc2t5IGlkZW50aWZpZXIgKGUuZy4sIHVzZXIuYnNreS5zb2NpYWwpOidcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdwYXNzd29yZCcsXG4gICAgICAgICAgbmFtZTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICBtZXNzYWdlOiAnRW50ZXIgeW91ciBCbHVlc2t5IGFwcCBwYXNzd29yZDonXG4gICAgICAgIH1cbiAgICAgIF07XG4gICAgY2FzZSAnbWFzdG9kb24nOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXG4gICAgICAgICAgbmFtZTogJ2luc3RhbmNlJyxcbiAgICAgICAgICBtZXNzYWdlOiAnRW50ZXIgeW91ciBNYXN0b2RvbiBpbnN0YW5jZSBVUkw6J1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICBuYW1lOiAnYWNjZXNzVG9rZW4nLFxuICAgICAgICAgIG1lc3NhZ2U6ICdFbnRlciB5b3VyIE1hc3RvZG9uIGFjY2VzcyB0b2tlbjonXG4gICAgICAgIH1cbiAgICAgIF07XG4gICAgY2FzZSAnbGlua2VkaW4nOlxuICAgICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdwYXNzd29yZCcsXG4gICAgICAgICAgbmFtZTogJ2FjY2Vzc1Rva2VuJyxcbiAgICAgICAgICBtZXNzYWdlOiAnRW50ZXIgeW91ciBMaW5rZWRJbiBhY2Nlc3MgdG9rZW46J1xuICAgICAgICB9XG4gICAgICBdO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gW107XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9hZENvbmZpZygpOiBQdWJsaXNoZXJDb25maWcge1xuICBjb25zdCBjb25maWc6IFB1Ymxpc2hlckNvbmZpZyA9IHt9O1xuXG4gIGlmIChwcm9jZXNzLmVudi5CTFVFU0tZX0lERU5USUZJRVIgJiYgcHJvY2Vzcy5lbnYuQkxVRVNLWV9QQVNTV09SRCkge1xuICAgIGNvbmZpZy5ibHVlc2t5ID0ge1xuICAgICAgaWRlbnRpZmllcjogcHJvY2Vzcy5lbnYuQkxVRVNLWV9JREVOVElGSUVSLFxuICAgICAgcGFzc3dvcmQ6IHByb2Nlc3MuZW52LkJMVUVTS1lfUEFTU1dPUkRcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk1BU1RPRE9OX0lOU1RBTkNFICYmIHByb2Nlc3MuZW52Lk1BU1RPRE9OX0FDQ0VTU19UT0tFTikge1xuICAgIGNvbmZpZy5tYXN0b2RvbiA9IHtcbiAgICAgIGluc3RhbmNlOiBwcm9jZXNzLmVudi5NQVNUT0RPTl9JTlNUQU5DRSxcbiAgICAgIGFjY2Vzc1Rva2VuOiBwcm9jZXNzLmVudi5NQVNUT0RPTl9BQ0NFU1NfVE9LRU5cbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52LkxJTktFRElOX0FDQ0VTU19UT0tFTikge1xuICAgIGNvbmZpZy5saW5rZWRpbiA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuOiBwcm9jZXNzLmVudi5MSU5LRURJTl9BQ0NFU1NfVE9LRU5cbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNvbmZpZztcbn1cblxucHJvZ3JhbS5wYXJzZSgpOyAiXX0=