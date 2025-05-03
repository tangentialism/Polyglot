# Polyglot Social Publisher

A TypeScript library for publishing content to multiple social media platforms simultaneously. Currently supports Bluesky and Mastodon, with LinkedIn support coming soon.

## Installation

```bash
npm install polyglot-social-publisher
```

## Usage

```typescript
import { SocialPublisher, PublisherConfig, Post } from 'polyglot-social-publisher';

// Configure your social media credentials
const config: PublisherConfig = {
  bluesky: {
    identifier: 'your-handle.bsky.social',
    password: 'your-password'
  },
  mastodon: {
    accessToken: 'your-access-token',
    instanceUrl: 'https://mastodon.social'
  }
};

// Create a publisher instance
const publisher = new SocialPublisher(config);

// Initialize the clients
await publisher.initialize();

// Create a post
const post: Post = {
  content: 'Hello from Polyglot Social Publisher!',
  metadata: {
    tags: ['hello', 'test'],
    createdAt: new Date(),
    source: 'Polyglot Publisher'
  }
};

// Publish to all configured platforms
const results = await publisher.publish(post);

// Or publish to specific platforms
const results = await publisher.publish(post, ['bluesky']);

// Clean up
await publisher.cleanup();
```

## Features

- Publish to multiple social media platforms with a single API
- Support for text content and media attachments
- Platform-specific formatting and character limits
- Configurable post visibility and options
- Error handling and retry mechanisms
- TypeScript support with full type definitions

## Supported Platforms

- Bluesky
- Mastodon
- LinkedIn (coming soon)

## Configuration

### Bluesky

```typescript
{
  identifier: string; // Your Bluesky handle
  password: string;  // Your Bluesky password
  apiEndpoint?: string; // Optional custom API endpoint
}
```

### Mastodon

```typescript
{
  accessToken: string;  // Your Mastodon access token
  instanceUrl: string;  // Your Mastodon instance URL
}
```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 