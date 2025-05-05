import { Publisher } from './src/publisher';
import * as dotenv from 'dotenv';

dotenv.config();

async function testPublisher() {
  // Create test configuration from environment variables
  const config = {
    mastodon: process.env.MASTODON_INSTANCE && process.env.MASTODON_ACCESS_TOKEN ? {
      instance: process.env.MASTODON_INSTANCE,
      accessToken: process.env.MASTODON_ACCESS_TOKEN
    } : undefined,
    bluesky: process.env.BLUESKY_IDENTIFIER && process.env.BLUESKY_PASSWORD ? {
      identifier: process.env.BLUESKY_IDENTIFIER,
      password: process.env.BLUESKY_PASSWORD
    } : undefined
  };

  const publisher = new Publisher(config);
  
  // Test content
  const testContent = `Test post from Polyglot Publisher [${new Date().toISOString()}]`;
  
  console.log('Test configuration:', {
    mastodon: config.mastodon ? {
      instance: config.mastodon.instance,
      hasToken: !!config.mastodon.accessToken
    } : undefined,
    bluesky: config.bluesky ? {
      identifier: config.bluesky.identifier,
      hasPassword: !!config.bluesky.password
    } : undefined
  });

  console.log('\nAttempting to publish test content:', testContent);

  try {
    const results = await publisher.publish({
      content: testContent,
      networks: ['mastodon', 'bluesky']
    });

    console.log('\nResults:');
    for (const [network, result] of Object.entries(results)) {
      console.log(`\n${network.toUpperCase()}:`);
      if (result.success) {
        console.log('✓ Posted successfully');
        console.log('Post ID:', result.postId);
        console.log('URL:', result.url);
      } else {
        console.log('✗ Failed to post');
        console.log('Error:', result.error);
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPublisher().catch(console.error); 