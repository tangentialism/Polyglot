// Export main publisher
export { SocialPublisher } from './publisher';

// Export types
export { Post, PostResult, MediaAttachment } from './types/post';
export {
  PublisherConfig,
  BlueskyConfig,
  MastodonConfig,
  LinkedInConfig,
  PlatformSpecificOptions
} from './types/config';

// Export clients
export { BlueskyClient } from './clients/bluesky';
export { MastodonClient } from './clients/mastodon';
export { SocialPlatformClient } from './clients/base-client'; 