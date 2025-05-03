"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publisher = void 0;
const tslib_1 = require("tslib");
const api_1 = require("@atproto/api");
const mastodon_api_1 = tslib_1.__importDefault(require("mastodon-api"));
class Publisher {
    constructor(config) {
        this.config = config;
    }
    publish(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const results = {};
            for (const network of options.networks) {
                try {
                    switch (network) {
                        case 'bluesky':
                            results[network] = yield this.postToBluesky(options.content);
                            break;
                        case 'mastodon':
                            results[network] = yield this.postToMastodon(options.content);
                            break;
                        case 'linkedin':
                            results[network] = yield this.postToLinkedIn(options.content);
                            break;
                    }
                }
                catch (error) {
                    results[network] = {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    };
                }
            }
            return results;
        });
    }
    postToBluesky(content) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.config.bluesky) {
                return { success: false, error: 'Bluesky credentials not configured' };
            }
            try {
                const agent = new api_1.BskyAgent({ service: 'https://bsky.social' });
                yield agent.login({
                    identifier: this.config.bluesky.identifier,
                    password: this.config.bluesky.password,
                });
                const response = yield agent.post({
                    text: content,
                });
                return {
                    success: true,
                    postId: response.uri
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to post to Bluesky'
                };
            }
        });
    }
    postToMastodon(content) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.config.mastodon) {
                return { success: false, error: 'Mastodon credentials not configured' };
            }
            try {
                const mastodon = new mastodon_api_1.default({
                    access_token: this.config.mastodon.accessToken,
                    api_url: `${this.config.mastodon.instance}/api/v1/`
                });
                const response = yield mastodon.post('statuses', {
                    status: content
                });
                return {
                    success: true,
                    postId: response.data.id
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to post to Mastodon'
                };
            }
        });
    }
    postToLinkedIn(content) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.config.linkedin) {
                return { success: false, error: 'LinkedIn credentials not configured' };
            }
            // TODO: Implement LinkedIn API integration
            return {
                success: false,
                error: 'LinkedIn integration not yet implemented'
            };
        });
    }
}
exports.Publisher = Publisher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3B1Ymxpc2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsc0NBQXlDO0FBQ3pDLHdFQUFvQztBQTZCcEMsTUFBYSxTQUFTO0lBR3BCLFlBQVksTUFBdUI7UUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVLLE9BQU8sQ0FBQyxPQUF1Qjs7WUFDbkMsTUFBTSxPQUFPLEdBQWtELEVBQUUsQ0FBQztZQUVsRSxLQUFLLE1BQU0sT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDO29CQUNILFFBQVEsT0FBTyxFQUFFLENBQUM7d0JBQ2hCLEtBQUssU0FBUzs0QkFDWixPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDN0QsTUFBTTt3QkFDUixLQUFLLFVBQVU7NEJBQ2IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBQzlELE1BQU07d0JBQ1IsS0FBSyxVQUFVOzRCQUNiLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUM5RCxNQUFNO29CQUNWLENBQUM7Z0JBQ0gsQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO29CQUNmLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRzt3QkFDakIsT0FBTyxFQUFFLEtBQUs7d0JBQ2QsS0FBSyxFQUFFLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHdCQUF3QjtxQkFDekUsQ0FBQztnQkFDSixDQUFD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aW1wb3J0IE1hc3RvZG9uIGZyb20gJ21hc3RvZG9uLWFwaSc7XG5cbmV4cG9ydCB0eXBlIFNvY2lhbE5ldHdvcmsgPSAnYmx1ZXNreScgfCAnbWFzdG9kb24nIHwgJ2xpbmtlZGluJztcblxuZXhwb3J0IGludGVyZmFjZSBQdWJsaXNoZXJDb25maWcge1xuICBibHVlc2t5Pzoge1xuICAgIGlkZW50aWZpZXI6IHN0cmluZztcbiAgICBwYXNzd29yZDogc3RyaW5nO1xuICB9O1xuICBtYXN0b2Rvbj86IHtcbiAgICBpbnN0YW5jZTogc3RyaW5nO1xuICAgIGFjY2Vzc1Rva2VuOiBzdHJpbmc7XG4gIH07XG4gIGxpbmtlZGluPzoge1xuICAgIGFjY2Vzc1Rva2VuOiBzdHJpbmc7XG4gIH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVibGlzaFJlc3VsdCB7XG4gIHN1Y2Nlc3M6IGJvb2xlYW47XG4gIGVycm9yPzogc3RyaW5nO1xuICBwb3N0SWQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVibGlzaE9wdGlvbnMge1xuICBjb250ZW50OiBzdHJpbmc7XG4gIG5ldHdvcmtzOiBTb2NpYWxOZXR3b3JrW107XG59XG5cbmV4cG9ydCBjbGFzcyBQdWJsaXNoZXIge1xuICBwcml2YXRlIGNvbmZpZzogUHVibGlzaGVyQ29uZmlnO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogUHVibGlzaGVyQ29uZmlnKSB7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gIH1cblxuICBhc3luYyBwdWJsaXNoKG9wdGlvbnM6IFB1Ymxpc2hPcHRpb25zKTogUHJvbWlzZTxSZWNvcmQ8U29jaWFsTmV0d29yaywgUHVibGlzaFJlc3VsdD4+IHtcbiAgICBjb25zdCByZXN1bHRzOiBQYXJ0aWFsPFJlY29yZDxTb2NpYWxOZXR3b3JrLCBQdWJsaXNoUmVzdWx0Pj4gPSB7fTtcblxuICAgIGZvciAoY29uc3QgbmV0d29yayBvZiBvcHRpb25zLm5ldHdvcmtzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBzd2l0Y2ggKG5ldHdvcmspIHtcbiAgICAgICAgICBjYXNlICdibHVlc2t5JzpcbiAgICAgICAgICAgIHJlc3VsdHNbbmV0d29ya10gPSBhd2FpdCB0aGlzLnBvc3RUb0JsdWVza3kob3B0aW9ucy5jb250ZW50KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ21hc3RvZG9uJzpcbiAgICAgICAgICAgIHJlc3VsdHNbbmV0d29ya10gPSBhd2FpdCB0aGlzLnBvc3RUb01hc3RvZG9uKG9wdGlvbnMuY29udGVudCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdsaW5rZWRpbic6XG4gICAgICAgICAgICByZXN1bHRzW25ldHdvcmtdID0gYXdhaXQgdGhpcy5wb3N0VG9MaW5rZWRJbihvcHRpb25zLmNvbnRlbnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlc3VsdHNbbmV0d29ya10gPSB7XG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHMgYXMgUmVjb3JkPFNvY2lhbE5ldHdvcmssIFB1Ymxpc2hSZXN1bHQ+O1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwb3N0VG9CbHVlc2t5KGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8UHVibGlzaFJlc3VsdD4ge1xuICAgIGlmICghdGhpcy5jb25maWcuYmx1ZXNreSkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQmx1ZXNreSBjcmVkZW50aWFscyBub3QgY29uZmlndXJlZCcgfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgYWdlbnQgPSBuZXcgQnNreUFnZW50KHsgc2VydmljZTogJ2h0dHBzOi8vYnNreS5zb2NpYWwnIH0pO1xuICAgICAgYXdhaXQgYWdlbnQubG9naW4oe1xuICAgICAgICBpZGVudGlmaWVyOiB0aGlzLmNvbmZpZy5ibHVlc2t5LmlkZW50aWZpZXIsXG4gICAgICAgIHBhc3N3b3JkOiB0aGlzLmNvbmZpZy5ibHVlc2t5LnBhc3N3b3JkLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYWdlbnQucG9zdCh7XG4gICAgICAgIHRleHQ6IGNvbnRlbnQsXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgcG9zdElkOiByZXNwb25zZS51cmlcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnRmFpbGVkIHRvIHBvc3QgdG8gQmx1ZXNreSdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwb3N0VG9NYXN0b2Rvbihjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPFB1Ymxpc2hSZXN1bHQ+IHtcbiAgICBpZiAoIXRoaXMuY29uZmlnLm1hc3RvZG9uKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdNYXN0b2RvbiBjcmVkZW50aWFscyBub3QgY29uZmlndXJlZCcgfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbWFzdG9kb24gPSBuZXcgTWFzdG9kb24oe1xuICAgICAgICBhY2Nlc3NfdG9rZW46IHRoaXMuY29uZmlnLm1hc3RvZG9uLmFjY2Vzc1Rva2VuLFxuICAgICAgICBhcGlfdXJsOiBgJHt0aGlzLmNvbmZpZy5tYXN0b2Rvbi5pbnN0YW5jZX0vYXBpL3YxL2BcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG1hc3RvZG9uLnBvc3QoJ3N0YXR1c2VzJywge1xuICAgICAgICBzdGF0dXM6IGNvbnRlbnRcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBwb3N0SWQ6IHJlc3BvbnNlLmRhdGEuaWRcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnRmFpbGVkIHRvIHBvc3QgdG8gTWFzdG9kb24nXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgcG9zdFRvTGlua2VkSW4oY29udGVudDogc3RyaW5nKTogUHJvbWlzZTxQdWJsaXNoUmVzdWx0PiB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZy5saW5rZWRpbikge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTGlua2VkSW4gY3JlZGVudGlhbHMgbm90IGNvbmZpZ3VyZWQnIH07XG4gICAgfVxuXG4gICAgLy8gVE9ETzogSW1wbGVtZW50IExpbmtlZEluIEFQSSBpbnRlZ3JhdGlvblxuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiAnTGlua2VkSW4gaW50ZWdyYXRpb24gbm90IHlldCBpbXBsZW1lbnRlZCdcbiAgICB9O1xuICB9XG59ICJdfQ==