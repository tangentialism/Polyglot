import { BskyAgent } from '@atproto/api';
import { createRestAPIClient } from 'masto';

export type SocialNetwork = 'bluesky' | 'mastodon';

export interface PublisherConfig {
  bluesky?: {
    identifier: string;
    password: string;
  };
  mastodon?: {
    instance: string;
    accessToken: string;
  };
}

export interface PublishResult {
  success: boolean;
  error?: string;
  postId?: string;
  url?: string;
}

export interface PublishOptions {
  content: string;
  networks: SocialNetwork[];
}

export class Publisher {
  private config: PublisherConfig;

  constructor(config: PublisherConfig) {
    this.config = config;
  }

  async publish(options: PublishOptions): Promise<Record<SocialNetwork, PublishResult>> {
    const results: Partial<Record<SocialNetwork, PublishResult>> = {};

    for (const network of options.networks) {
      try {
        switch (network) {
          case 'bluesky':
            results[network] = await this.postToBluesky(options.content);
            break;
          case 'mastodon':
            results[network] = await this.postToMastodon(options.content);
            break;
        }
      } catch (error) {
        results[network] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }

    return results as Record<SocialNetwork, PublishResult>;
  }

  private async postToBluesky(content: string): Promise<PublishResult> {
    if (!this.config.bluesky) {
      return { success: false, error: 'Bluesky credentials not configured' };
    }

    try {
      console.log('Attempting to post to Bluesky...');
      const agent = new BskyAgent({ service: 'https://bsky.social' });
      await agent.login({
        identifier: this.config.bluesky.identifier,
        password: this.config.bluesky.password,
      });
      console.log('Successfully logged in to Bluesky');

      const response = await agent.post({
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
    } catch (error) {
      console.error('Bluesky API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post to Bluesky'
      };
    }
  }

  private async postToMastodon(content: string): Promise<PublishResult> {
    if (!this.config.mastodon) {
      return { success: false, error: 'Mastodon credentials not configured' };
    }

    try {
      console.log('Attempting to post to Mastodon...');
      console.log('Creating Mastodon client with instance:', this.config.mastodon.instance);
      
      const masto = createRestAPIClient({
        url: this.config.mastodon.instance,
        accessToken: this.config.mastodon.accessToken,
      });

      const status = await masto.v1.statuses.create({
        status: content,
        visibility: 'public'
      });
      console.log('Mastodon API response:', status);

      return {
        success: true,
        postId: status.id,
        url: status.url || undefined
      };
    } catch (error) {
      console.error('Mastodon API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post to Mastodon'
      };
    }
  }
} 