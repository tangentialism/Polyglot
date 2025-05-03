export interface BlueskyConfig {
  identifier: string;
  password: string;
  apiEndpoint?: string;
}

export interface MastodonConfig {
  accessToken: string;
  instanceUrl: string;
}

export interface LinkedInConfig {
  accessToken: string;
  organizationId?: string; // Optional: for posting as an organization
}

export interface PublisherConfig {
  bluesky?: BlueskyConfig;
  mastodon?: MastodonConfig;
  linkedin?: LinkedInConfig;
  defaultVisibility?: 'public' | 'private';
  retryAttempts?: number;
  retryDelay?: number; // milliseconds
}

export interface PlatformSpecificOptions {
  visibility?: 'public' | 'private';
  sensitive?: boolean;
  language?: string;
  customFields?: Record<string, unknown>;
} 