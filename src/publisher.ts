import { BlueskyClient } from './clients/bluesky';
import { MastodonClient } from './clients/mastodon';
import { Post, PostResult } from './types/post';
import { PublisherConfig, PlatformSpecificOptions } from './types/config';
import { SocialPlatformClient } from './clients/base-client';

export class SocialPublisher {
  private clients: Map<string, SocialPlatformClient> = new Map();
  private config: PublisherConfig;

  constructor(config: PublisherConfig) {
    this.config = config;
    this.initializeClients();
  }

  private initializeClients(): void {
    if (this.config.bluesky) {
      this.clients.set('bluesky', new BlueskyClient(this.config.bluesky));
    }
    if (this.config.mastodon) {
      this.clients.set('mastodon', new MastodonClient(this.config.mastodon));
    }
    // LinkedIn client will be added here
  }

  async initialize(): Promise<void> {
    const initPromises = Array.from(this.clients.values()).map(client => 
      client.initialize().catch(error => {
        throw new Error(`Failed to initialize client: ${error.message}`);
      })
    );
    await Promise.all(initPromises);
  }

  async verifyCredentials(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const [platform, client] of this.clients) {
      try {
        const isValid = await client.verifyCredentials();
        results.set(platform, isValid);
      } catch (error) {
        results.set(platform, false);
      }
    }

    return results;
  }

  async publish(
    post: Post,
    platforms?: string[],
    options?: Record<string, PlatformSpecificOptions>
  ): Promise<Map<string, PostResult>> {
    const results = new Map<string, PostResult>();
    const clientsToUse = platforms
      ? Array.from(this.clients.entries()).filter(([platform]) => platforms.includes(platform))
      : Array.from(this.clients.entries());

    const publishPromises = clientsToUse.map(async ([platform, client]) => {
      try {
        const platformOptions = options?.[platform];
        const result = await client.publish(post, platformOptions);
        results.set(platform, result);
      } catch (error) {
        results.set(platform, {
          platform,
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          timestamp: new Date()
        });
      }
    });

    await Promise.all(publishPromises);
    return results;
  }

  async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.clients.values()).map(client => 
      client.cleanup().catch(error => {
        console.error(`Failed to cleanup client: ${error.message}`);
      })
    );
    await Promise.all(cleanupPromises);
    this.clients.clear();
  }
} 