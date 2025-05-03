export type SocialNetwork = 'bluesky' | 'mastodon';

export interface BlueskyConfig {
  identifier: string;
  password: string;
}

export interface MastodonConfig {
  instanceUrl: string;
  accessToken: string;
}

export interface PublisherConfig {
  bluesky?: BlueskyConfig;
  mastodon?: MastodonConfig;
  defaultVisibility?: 'public' | 'private';
}

export interface PostMetadata {
  title?: string;
  tags?: string[];
  createdAt?: Date;
  source?: string;
  originalUrl?: string;
}

export interface Post {
  content: string;
  metadata?: PostMetadata;
}

export interface PublishResult {
  success: boolean;
  error?: string;
  postId?: string;
}

export interface SocialPublisher {
  initialize(): Promise<void>;
  publish(post: Post, networks: SocialNetwork[]): Promise<Map<SocialNetwork, PublishResult>>;
  cleanup(): Promise<void>;
} 