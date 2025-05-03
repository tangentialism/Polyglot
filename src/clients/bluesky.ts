import { BskyAgent } from '@atproto/api';
import { BaseSocialClient } from './base-client';
import { Post, PostResult } from '../types/post';
import { BlueskyConfig, PlatformSpecificOptions } from '../types/config';

export class BlueskyClient extends BaseSocialClient {
  private agent: BskyAgent;
  private config: BlueskyConfig;

  constructor(config: BlueskyConfig) {
    super();
    this.config = config;
    this.agent = new BskyAgent({
      service: config.apiEndpoint || 'https://bsky.social'
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.agent.login({
        identifier: this.config.identifier,
        password: this.config.password
      });
      this.isInitialized = true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize Bluesky client: ${errorMessage}`);
    }
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      await this.checkInitialized();
      const response = await this.agent.getProfile({
        actor: this.config.identifier
      });
      return !!response.success;
    } catch (error) {
      return false;
    }
  }

  async publish(post: Post, options?: PlatformSpecificOptions): Promise<PostResult> {
    try {
      this.checkInitialized();

      // Format content according to Bluesky's requirements
      const text = this.formatContent(post);

      const response = await this.agent.post({
        text,
        // Add facets for mentions and links if needed
        // Add embeds for images if present
      });

      const postId = response.uri.split('/').pop();
      const url = `https://bsky.app/profile/${this.config.identifier}/post/${postId}`;

      return this.createPostResult(true, 'bluesky', postId, url);
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      return this.createPostResult(false, 'bluesky', undefined, undefined, errorObj);
    }
  }

  private formatContent(post: Post): string {
    let content = post.content;

    // Add tags if present
    if (post.metadata.tags.length > 0) {
      content += '\n\n' + post.metadata.tags.map(tag => `#${tag}`).join(' ');
    }

    // Ensure content meets Bluesky's length requirements
    if (content.length > 300) {
      content = content.substring(0, 297) + '...';
    }

    return content;
  }
} 