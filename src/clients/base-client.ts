import { Post, PostResult } from '../types/post';
import { PlatformSpecificOptions } from '../types/config';

export interface SocialPlatformClient {
  /**
   * Initialize the client with necessary credentials and configuration
   */
  initialize(): Promise<void>;

  /**
   * Publish a post to the platform
   * @param post The post to publish
   * @param options Platform-specific options
   */
  publish(post: Post, options?: PlatformSpecificOptions): Promise<PostResult>;

  /**
   * Verify the client's credentials and connection
   */
  verifyCredentials(): Promise<boolean>;

  /**
   * Clean up any resources or connections
   */
  cleanup(): Promise<void>;
}

export abstract class BaseSocialClient implements SocialPlatformClient {
  protected isInitialized = false;

  abstract initialize(): Promise<void>;
  abstract publish(post: Post, options?: PlatformSpecificOptions): Promise<PostResult>;
  abstract verifyCredentials(): Promise<boolean>;
  
  async cleanup(): Promise<void> {
    this.isInitialized = false;
  }

  protected checkInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }
  }

  protected createPostResult(
    success: boolean,
    platform: string,
    postId?: string,
    url?: string,
    error?: Error
  ): PostResult {
    return {
      success,
      platform,
      postId,
      url,
      error,
      timestamp: new Date()
    };
  }
} 