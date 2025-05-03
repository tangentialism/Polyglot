import { SocialPublisher, PublisherConfig, SocialNetwork, Post, PublishResult } from './types';

export class MockPublisher implements SocialPublisher {
  private config: PublisherConfig;

  constructor(config: PublisherConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('Mock publisher initialized with config:', this.config);
  }

  async publish(post: Post, networks: SocialNetwork[]): Promise<Map<SocialNetwork, PublishResult>> {
    console.log('Publishing post:', post);
    console.log('To networks:', networks);

    const results = new Map<SocialNetwork, PublishResult>();

    for (const network of networks) {
      // Simulate successful publishing
      results.set(network, {
        success: true,
        postId: `mock-${network}-${Date.now()}`
      });
    }

    return results;
  }

  async cleanup(): Promise<void> {
    console.log('Mock publisher cleaned up');
  }
} 