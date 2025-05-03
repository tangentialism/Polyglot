import Mastodon from 'mastodon-api';
import { BaseSocialClient } from './base-client';
import { Post, PostResult } from '../types/post';
import { MastodonConfig, PlatformSpecificOptions } from '../types/config';

export class MastodonClient extends BaseSocialClient {
  private client: any; // Mastodon client type is not well defined in the package
  private config: MastodonConfig;

  constructor(config: MastodonConfig) {
    super();
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      this.client = new Mastodon({
        access_token: this.config.accessToken,
        api_url: `${this.config.instanceUrl}/api/v1/`
      });
      this.isInitialized = true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize Mastodon client: ${errorMessage}`);
    }
  }

  async verifyCredentials(): Promise<boolean> {
    try {
      this.checkInitialized();
      const response = await this.client.get('accounts/verify_credentials');
      return !!response.data;
    } catch (error) {
      return false;
    }
  }

  async publish(post: Post, options?: PlatformSpecificOptions): Promise<PostResult> {
    try {
      this.checkInitialized();

      const status = this.formatContent(post);
      const visibility = options?.visibility || 'public';

      const params: any = {
        status,
        visibility
      };

      if (post.attachments?.length) {
        const mediaIds = await this.uploadMedia(post.attachments);
        if (mediaIds.length > 0) {
          params.media_ids = mediaIds;
        }
      }

      const response = await this.client.post('statuses', params);
      const postData = response.data;

      return this.createPostResult(
        true,
        'mastodon',
        postData.id,
        postData.url
      );
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      return this.createPostResult(false, 'mastodon', undefined, undefined, errorObj);
    }
  }

  private async uploadMedia(attachments: Post['attachments']): Promise<string[]> {
    if (!attachments) return [];

    const mediaIds: string[] = [];
    for (const attachment of attachments) {
      try {
        const response = await this.client.post('media', {
          file: attachment.url,
          description: attachment.altText
        });
        mediaIds.push(response.data.id);
      } catch (error) {
        console.error('Failed to upload media:', error);
      }
    }
    return mediaIds;
  }

  private formatContent(post: Post): string {
    let content = post.content;

    // Add tags if present
    if (post.metadata.tags.length > 0) {
      content += '\n\n' + post.metadata.tags.map(tag => `#${tag}`).join(' ');
    }

    // Add source attribution if present
    if (post.metadata.originalUrl) {
      content += `\n\nOriginally posted at: ${post.metadata.originalUrl}`;
    }

    // Mastodon has a 500 character limit
    if (content.length > 500) {
      content = content.substring(0, 497) + '...';
    }

    return content;
  }
} 