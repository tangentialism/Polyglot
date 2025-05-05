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
                console.log('Attempting to post to Bluesky...');
                const agent = new api_1.BskyAgent({ service: 'https://bsky.social' });
                yield agent.login({
                    identifier: this.config.bluesky.identifier,
                    password: this.config.bluesky.password,
                });
                console.log('Successfully logged in to Bluesky');
                const response = yield agent.post({
                    text: content,
                });
                console.log('Bluesky API response:', response);
                const postId = response.uri;
                const url = `https://bsky.app/profile/${postId.split('/')[2]}/post/${postId.split('/').pop()}`;
                console.log('Bluesky post URL:', url);
                return {
                    success: true,
                    postId: postId,
                    url: url
                };
            }
            catch (error) {
                console.error('Bluesky API error:', error);
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
                console.log('Attempting to post to Mastodon...');
                console.log('Creating Mastodon client with instance:', this.config.mastodon.instance);
                const mastodon = new mastodon_api_1.default({
                    access_token: this.config.mastodon.accessToken,
                    api_url: `${this.config.mastodon.instance}/api/v1/`
                });
                const response = yield mastodon.post('statuses', {
                    status: content
                });
                console.log('Mastodon API response:', response);
                const url = response.data.url;
                console.log('Mastodon post URL:', url);
                return {
                    success: true,
                    postId: response.data.id,
                    url: url
                };
            }
            catch (error) {
                console.error('Mastodon API error:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to post to Mastodon'
                };
            }
        });
    }
}
exports.Publisher = Publisher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3B1Ymxpc2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsc0NBQXlDO0FBQ3pDLHdFQUFvQztBQTJCcEMsTUFBYSxTQUFTO0lBR3BCLFlBQVksTUFBdUI7UUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVLLE9BQU8sQ0FBQyxPQUF1Qjs7WUFDbkMsTUFBTSxPQUFPLEdBQWtELEVBQUUsQ0FBQztZQUVsRSxLQUFLLE1BQU0sT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDO29CQUNILFFBQVEsT0FBTyxFQUFFLENBQUM7d0JBQ2hCLEtBQUssU0FBUzs0QkFDWixPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDN0QsTUFBTTt3QkFDUixLQUFLLFVBQVU7NEJBQ2IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBQzlELE1BQU07b0JBQ1YsQ0FBQztnQkFDSCxDQUFDO2dCQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7b0JBQ2YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHO3dCQUNqQixPQUFPLEVBQUUsS0FBSzt3QkFDZCxLQUFLLEVBQUUsS0FBSyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsd0JBQXdCO3FCQUN6RSxDQUFDO2dCQUNKLENBQUM7WUFDSCxDQUFDO1lBRUQsT0FBTyxPQUErQyxDQUFDO1FBQ3pELENBQUM7S0FBQTtJQUVhLGFBQWEsQ0FBQyxPQUFlOztZQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFP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LEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRXZDLE9BQU87b0JBQ0wsT0FBTyxFQUFFLElBQUk7b0JBQ2IsTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDeEIsR0FBRyxFQUFFLEdBQUc7aUJBQ1QsQ0FBQztZQUNKLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzVDLE9BQU87b0JBQ0wsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsS0FBSyxFQUFFLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLDRCQUE0QjtpQkFDN0UsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDO0tBQUE7Q0FDRjtBQXRHRCw4QkFzR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCc2t5QWdlbnQgfSBmcm9tICdAYXRwcm90by9hcGknO1xuaW1wb3J0IE1hc3RvZG9uIGZyb20gJ21hc3RvZG9uLWFwaSc7XG5cbmV4cG9ydCB0eXBlIFNvY2lhbE5ldHdvcmsgPSAnYmx1ZXNreScgfCAnbWFzdG9kb24nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFB1Ymxpc2hlckNvbmZpZyB7XG4gIGJsdWVza3k/OiB7XG4gICAgaWRlbnRpZmllcjogc3RyaW5nO1xuICAgIHBhc3N3b3JkOiBzdHJpbmc7XG4gIH07XG4gIG1hc3RvZG9uPzoge1xuICAgIGluc3RhbmNlOiBzdHJpbmc7XG4gICAgYWNjZXNzVG9rZW46IHN0cmluZztcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQdWJsaXNoUmVzdWx0IHtcbiAgc3VjY2VzczogYm9vbGVhbjtcbiAgZXJyb3I/OiBzdHJpbmc7XG4gIHBvc3RJZD86IHN0cmluZztcbiAgdXJsPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1Ymxpc2hPcHRpb25zIHtcbiAgY29udGVudDogc3RyaW5nO1xuICBuZXR3b3JrczogU29jaWFsTmV0d29ya1tdO1xufVxuXG5leHBvcnQgY2xhc3MgUHVibGlzaGVyIHtcbiAgcHJpdmF0ZSBjb25maWc6IFB1Ymxpc2hlckNvbmZpZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IFB1Ymxpc2hlckNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgYXN5bmMgcHVibGlzaChvcHRpb25zOiBQdWJsaXNoT3B0aW9ucyk6IFByb21pc2U8UmVjb3JkPFNvY2lhbE5ldHdvcmssIFB1Ymxpc2hSZXN1bHQ+PiB7XG4gICAgY29uc3QgcmVzdWx0czogUGFydGlhbDxSZWNvcmQ8U29jaWFsTmV0d29yaywgUHVibGlzaFJlc3VsdD4+ID0ge307XG5cbiAgICBmb3IgKGNvbnN0IG5ldHdvcmsgb2Ygb3B0aW9ucy5uZXR3b3Jrcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgc3dpdGNoIChuZXR3b3JrKSB7XG4gICAgICAgICAgY2FzZSAnYmx1ZXNreSc6XG4gICAgICAgICAgICByZXN1bHRzW25ldHdvcmtdID0gYXdhaXQgdGhpcy5wb3N0VG9CbHVlc2t5KG9wdGlvbnMuY29udGVudCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdtYXN0b2Rvbic6XG4gICAgICAgICAgICByZXN1bHRzW25ldHdvcmtdID0gYXdhaXQgdGhpcy5wb3N0VG9NYXN0b2RvbihvcHRpb25zLmNvbnRlbnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlc3VsdHNbbmV0d29ya10gPSB7XG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHMgYXMgUmVjb3JkPFNvY2lhbE5ldHdvcmssIFB1Ymxpc2hSZXN1bHQ+O1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwb3N0VG9CbHVlc2t5KGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8UHVibGlzaFJlc3VsdD4ge1xuICAgIGlmICghdGhpcy5jb25maWcuYmx1ZXNreSkge1xuICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQmx1ZXNreSBjcmVkZW50aWFscyBub3QgY29uZmlndXJlZCcgfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc29sZS5sb2coJ0F0dGVtcHRpbmcgdG8gcG9zdCB0byBCbHVlc2t5Li4uJyk7XG4gICAgICBjb25zdCBhZ2VudCA9IG5ldyBCc2t5QWdlbnQoeyBzZXJ2aWNlOiAnaHR0cHM6Ly9ic2t5LnNvY2lhbCcgfSk7XG4gICAgICBhd2FpdCBhZ2VudC5sb2dpbih7XG4gICAgICAgIGlkZW50aWZpZXI6IHRoaXMuY29uZmlnLmJsdWVza3kuaWRlbnRpZmllcixcbiAgICAgICAgcGFzc3dvcmQ6IHRoaXMuY29uZmlnLmJsdWVza3kucGFzc3dvcmQsXG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKCdTdWNjZXNzZnVsbHkgbG9nZ2VkIGluIHRvIEJsdWVza3knKTtcblxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhZ2VudC5wb3N0KHtcbiAgICAgICAgdGV4dDogY29udGVudCxcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ0JsdWVza3kgQVBJIHJlc3BvbnNlOicsIHJlc3BvbnNlKTtcblxuICAgICAgY29uc3QgcG9zdElkID0gcmVzcG9uc2UudXJpO1xuICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYnNreS5hcHAvcHJvZmlsZS8ke3Bvc3RJZC5zcGxpdCgnLycpWzJdfS9wb3N0LyR7cG9zdElkLnNwbGl0KCcvJykucG9wKCl9YDtcbiAgICAgIGNvbnNvbGUubG9nKCdCbHVlc2t5IHBvc3QgVVJMOicsIHVybCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIHBvc3RJZDogcG9zdElkLFxuICAgICAgICB1cmw6IHVybFxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignQmx1ZXNreSBBUEkgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdGYWlsZWQgdG8gcG9zdCB0byBCbHVlc2t5J1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHBvc3RUb01hc3RvZG9uKGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8UHVibGlzaFJlc3VsdD4ge1xuICAgIGlmICghdGhpcy5jb25maWcubWFzdG9kb24pIHtcbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ01hc3RvZG9uIGNyZWRlbnRpYWxzIG5vdCBjb25maWd1cmVkJyB9O1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZygnQXR0ZW1wdGluZyB0byBwb3N0IHRvIE1hc3RvZG9uLi4uJyk7XG4gICAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgTWFzdG9kb24gY2xpZW50IHdpdGggaW5zdGFuY2U6JywgdGhpcy5jb25maWcubWFzdG9kb24uaW5zdGFuY2UpO1xuICAgICAgY29uc3QgbWFzdG9kb24gPSBuZXcgTWFzdG9kb24oe1xuICAgICAgICBhY2Nlc3NfdG9rZW46IHRoaXMuY29uZmlnLm1hc3RvZG9uLmFjY2Vzc1Rva2VuLFxuICAgICAgICBhcGlfdXJsOiBgJHt0aGlzLmNvbmZpZy5tYXN0b2Rvbi5pbnN0YW5jZX0vYXBpL3YxL2BcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG1hc3RvZG9uLnBvc3QoJ3N0YXR1c2VzJywge1xuICAgICAgICBzdGF0dXM6IGNvbnRlbnRcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ01hc3RvZG9uIEFQSSByZXNwb25zZTonLCByZXNwb25zZSk7XG5cbiAgICAgIGNvbnN0IHVybCA9IHJlc3BvbnNlLmRhdGEudXJsO1xuICAgICAgY29uc29sZS5sb2coJ01hc3RvZG9uIHBvc3QgVVJMOicsIHVybCk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIHBvc3RJZDogcmVzcG9uc2UuZGF0YS5pZCxcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ01hc3RvZG9uIEFQSSBlcnJvcjonLCBlcnJvcik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ0ZhaWxlZCB0byBwb3N0IHRvIE1hc3RvZG9uJ1xuICAgICAgfTtcbiAgICB9XG4gIH1cbn0gIl19