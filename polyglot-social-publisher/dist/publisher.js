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
}
exports.Publisher = Publisher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3B1Ymxpc2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsc0NBQXlDO0FBQ3pDLHdFQUFvQztBQTBCcEMsTUFBYSxTQUFTO0lBR3BCLFlBQVksTUFBdUI7UUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVLLE9BQU8sQ0FBQyxPQUF1Qjs7WUFDbkMsTUFBTSxPQUFPLEdBQWtELEVBQUUsQ0FBQztZQUVsRSxLQUFLLE1BQU0sT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDO29CQUNILFFBQVEsT0FBTyxFQUFFLENBQUM7d0JBQ2hCLEtBQUssU0FBUzs0QkFDWixPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDN0QsTUFBTTt3QkFDUixLQUFLLFVBQVU7NEJBQ2IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBQzlELE1BQU07b0JBQ1YsQ0FBQztnQkFDSCxDQUFDO2dCQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7b0JBQ2YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHO3dCQUNqQixPQUFPLEVBQUUsS0FBSzt3QkFDZCxLQUFLLEVBQUUsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsd0JBQXdCO3FCQUN6RSxDQUFDO2dCQUNKLENBQUM7WUFDSCxDQUFDO1lBRUQsT0FBTyxPQUErQyxDQUFDO1FBQ3pELENBQUM7S0FBQTtJQUVhLGFBQWEsQ0FBQyxPQUFlOztZQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDekIsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLG9DQUFvQyxFQUFFLENBQUM7WUFDekUsQ0FBQztZQUVELElBQUksQ0FBQztnQkFDSCxNQUFNLEtBQUssR0FBRyxJQUFJLGVBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxDQUFDLENBQUM7Z0JBQ2hFLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztvQkFDaEIsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVU7b0JBQzFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRO2lCQUN2QyxDQUFDLENBQUM7Z0JBRUgsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNoQyxJQUFJLEVBQUUsT0FBTztpQkFDZCxDQUFDLENBQUM7Z0JBRUgsT0FBTztvQkFDTCxPQUFPLEVBQUUsSUFBSTtvQkFDYixNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUc7aUJBQ3JCLENBQUM7WUFDSixDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDZixPQUFPO29CQUNMLE9BQU8sRUFBRSxLQUFLO29CQUNkLEtBQUssRUFBRSxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQywyQkFBMkI7aUJBQzVFLENBQUM7WUFDSixDQUFDO1FBQ0gsQ0FBQztLQUFBO0lBRWEsY0FBYyxDQUFDLE9BQWU7O1lBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUMxQixPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUscUNBQXFDLEVBQUUsQ0FBQztZQUMxRSxDQUFDO1lBRUQsSUFBSSxDQUFDO2dCQUNILE1BQU0sUUFBUSxHQUFHLElBQUksc0JBQVEsQ0FBQztvQkFDNUIsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVc7b0JBQzlDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsVUFBVTtpQkFDcEQsQ0FBQyxDQUFDO2dCQUVILE1BQU0sUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQy9DLE1BQU0sRUFBRSxPQUFPO2lCQUNoQixDQUFDLENBQUM7Z0JBRUgsT0FBTztvQkFDTCxPQUFPLEVBQUUsSUFBSTtvQkFDYixNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO2lCQUN6QixDQUFDO1lBQ0osQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2YsT0FBTztvQkFDTCxPQUFPLEVBQUUsS0FBSztvQkFDZCxLQUFLLEVBQUUsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsNEJBQTRCO2lCQUM3RSxDQUFDO1lBQ0osQ0FBQztRQUNILENBQUM7S0FBQTtDQUNGO0FBckZELDhCQXFGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJza3lBZ2VudCB9IGZyb20gJ0BhdHByb3RvL2FwaSc7XG5pbXBvcnQgTWFzdG9kb24gZnJvbSAnbWFzdG9kb24tYXBpJztcblxuZXhwb3J0IHR5cGUgU29jaWFsTmV0d29yayA9ICdibHVlc2t5JyB8ICdtYXN0b2Rvbic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVibGlzaGVyQ29uZmlnIHtcbiAgYmx1ZXNreT86IHtcbiAgICBpZGVudGlmaWVyOiBzdHJpbmc7XG4gICAgcGFzc3dvcmQ6IHN0cmluZztcbiAgfTtcbiAgbWFzdG9kb24/OiB7XG4gICAgaW5zdGFuY2U6IHN0cmluZztcbiAgICBhY2Nlc3NUb2tlbjogc3RyaW5nO1xuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1Ymxpc2hSZXN1bHQge1xuICBzdWNjZXNzOiBib29sZWFuO1xuICBlcnJvcj86IHN0cmluZztcbiAgcG9zdElkPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1Ymxpc2hPcHRpb25zIHtcbiAgY29udGVudDogc3RyaW5nO1xuICBuZXR3b3JrczogU29jaWFsTmV0d29ya1tdO1xufVxuXG5leHBvcnQgY2xhc3MgUHVibGlzaGVyIHtcbiAgcHJpdmF0ZSBjb25maWc6IFB1Ymxpc2hlckNvbmZpZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IFB1Ymxpc2hlckNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgYXN5bmMgcHVibGlzaChvcHRpb25zOiBQdWJsaXNoT3B0aW9ucyk6IFByb21pc2U8UmVjb3JkPFNvY2lhbE5ldHdvcmssIFB1Ymxpc2hSZXN1bHQ+PiB7XG4gICAgY29uc3QgcmVzdWx0czogUGFydGlhbDxSZWNvcmQ8U29jaWFsTmV0d29yaywgUHVibGlzaFJlc3VsdD4+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IG5ldHdvcmsgb2Ygb3B0aW9ucy5uZXR3b3Jrcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3dpdGNoIChuZXR3b3JrKSB7XG4gICAgICAgICAgY2FzZSAnYmx1ZXNreSc6XG4gICAgICAgICAgICByZXN1bHRzW25ldHdvcmtdID0gYXdhaXQgdGhpcy5wb3N0VG9CbHVlc2t5KG9wdGlvbnMuY29udGVudCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdtYXN0b2Rvbic6XG4gICAgICAgICAgICByZXN1bHRzW25ldHdvcmtdID0gYXdhaXQgdGhpcy5wb3N0VG9NYXN0b2RvbihvcHRpb25zLmNvbnRlbnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlc3VsdHNbbmV0d29ya10gPSB7XG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHMgYXMgUmVjb3JkPFNvY2lhbE5ldHdvcmssIFB1Ymxpc2hSZXN1bHQ+O1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwb3N0VG9CbHVlc2t5KGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8UHVibGlzaFJlc3VsdD4ge1xuICAgIGlmICghdGhpcy5jb25maWcuYmx1ZXNreSkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQmx1ZXNreSBjcmVkZW50aWFscyBub3QgY29uZmlndXJlZCcgfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgYWdlbnQgPSBuZXcgQnNreUFnZW50KHsgc2VydmljZTogJ2h0dHBzOi8vYnNreS5zb2NpYWwnIH0pO1xuICAgICAgYXdhaXQgYWdlbnQubG9naW4oe1xuICAgICAgICBpZGVudGlmaWVyOiB0aGlzLmNvbmZpZy5ibHVlc2t5LmlkZW50aWZpZXIsXG4gICAgICAgIHBhc3N3b3JkOiB0aGlzLmNvbmZpZy5ibHVlc2t5LnBhc3N3b3JkLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYWdlbnQucG9zdCh7XG4gICAgICAgIHRleHQ6IGNvbnRlbnQsXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgcG9zdElkOiByZXNwb25zZS51cmlcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnRmFpbGVkIHRvIHBvc3QgdG8gQmx1ZXNreSdcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwb3N0VG9NYXN0b2Rvbihjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPFB1Ymxpc2hSZXN1bHQ+IHtcbiAgICBpZiAoIXRoaXMuY29uZmlnLm1hc3RvZG9uKSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdNYXN0b2RvbiBjcmVkZW50aWFscyBub3QgY29uZmlndXJlZCcgfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgbWFzdG9kb24gPSBuZXcgTWFzdG9kb24oe1xuICAgICAgICBhY2Nlc3NfdG9rZW46IHRoaXMuY29uZmlnLm1hc3RvZG9uLmFjY2Vzc1Rva2VuLFxuICAgICAgICBhcGlfdXJsOiBgJHt0aGlzLmNvbmZpZy5tYXN0b2Rvbi5pbnN0YW5jZX0vYXBpL3YxL2BcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG1hc3RvZG9uLnBvc3QoJ3N0YXR1c2VzJywge1xuICAgICAgICBzdGF0dXM6IGNvbnRlbnRcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBwb3N0SWQ6IHJlc3BvbnNlLmRhdGEuaWRcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnRmFpbGVkIHRvIHBvc3QgdG8gTWFzdG9kb24nXG4gICAgICB9O1xuICAgIH1cbiAgfVxufSAiXX0=