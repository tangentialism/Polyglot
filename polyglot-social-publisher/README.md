# Polyglot Social Publisher

A command-line tool and library for cross-posting content to multiple social media platforms. Currently supports Bluesky, Mastodon, and LinkedIn (coming soon).

## Installation

```bash
npm install -g polyglot-social-publisher
```

## Configuration

Before using the tool, you'll need to configure your social media credentials. You can do this in two ways:

### 1. Using the Interactive Configuration

Run the following command and follow the interactive prompts:

```bash
polyglot configure
```

### 2. Using Environment Variables

Create a `.env` file in your working directory with the following variables:

```env
# Bluesky
BLUESKY_IDENTIFIER=your.identifier.bsky.social
BLUESKY_PASSWORD=your-app-password

# Mastodon
MASTODON_INSTANCE=https://mastodon.social
MASTODON_ACCESS_TOKEN=your-access-token

# LinkedIn
LINKEDIN_ACCESS_TOKEN=your-access-token
```

## Usage

### Sending Posts

Send content directly to your configured social networks:

```bash
# Send using inline content
polyglot post -c "Hello, world! 👋"

# Send from a file
polyglot post -f content.txt

# Send to specific networks
polyglot post -c "Hello!" -n bluesky mastodon

# Preview without sending (dry run)
polyglot post -c "Hello!" --dry-run
```

### Command Options

- `-c, --content <content>`: Content to send
- `-f, --file <file>`: File containing content to send
- `-n, --networks <networks...>`: Specific networks to send to (bluesky, mastodon, linkedin)
- `--dry-run`: Preview what would be sent without actually sending

## Using as a Library

You can also use Polyglot Social Publisher as a library in your TypeScript/JavaScript projects:

```typescript
import { Publisher } from 'polyglot-social-publisher';

const publisher = new Publisher({
  bluesky: {
    identifier: 'user.bsky.social',
    password: 'app-password'
  },
  mastodon: {
    instance: 'https://mastodon.social',
    accessToken: 'access-token'
  }
});

// Send to all configured networks
const results = await publisher.publish({
  content: 'Hello from Polyglot!',
  networks: ['bluesky', 'mastodon']
});

console.log(results);
```

## Platform-Specific Notes

### Bluesky
- Requires an account identifier and app password
- Maximum post length: 300 characters

### Mastodon
- Requires instance URL and access token
- Maximum post length: 500 characters (may vary by instance)

### LinkedIn
- Support coming soon
- Will require OAuth2 access token

## Error Handling

The tool provides detailed error messages for common issues:
- Network connectivity problems
- Authentication failures
- Content length violations
- Rate limiting

## Development

To run the tool locally during development:

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the package
npm run build

# Run the built version
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC 