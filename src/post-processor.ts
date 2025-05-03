import { TFile, MetadataCache } from 'obsidian';
import { SocialPublisher, Post, PublisherConfig, SocialNetwork } from 'polyglot-social-publisher';
import { PolyglotPublisherSettings } from './settings';

interface PostFrontmatter {
  title?: string;
  tags?: string[];
  networks?: SocialNetwork[];
  originalUrl?: string;
}

export class PostProcessor {
  private publisher: SocialPublisher | null = null;

  constructor(
    private settings: PolyglotPublisherSettings,
    private metadataCache: MetadataCache
  ) {}

  async initialize(): Promise<void> {
    const config: PublisherConfig = {
      bluesky: this.settings.bluesky.enabled ? {
        identifier: this.settings.bluesky.identifier,
        password: this.settings.bluesky.password
      } : undefined,
      mastodon: this.settings.mastodon.enabled ? {
        accessToken: this.settings.mastodon.accessToken,
        instanceUrl: this.settings.mastodon.instanceUrl
      } : undefined,
      defaultVisibility: this.settings.defaultVisibility
    };

    this.publisher = new SocialPublisher(config);
    await this.publisher.initialize();
  }

  async processFile(file: TFile, content: string): Promise<boolean> {
    const metadata = this.metadataCache.getFileCache(file)?.frontmatter as PostFrontmatter | undefined;
    if (!metadata || !metadata.tags?.includes('smallpost')) {
      return false;
    }

    if (!this.publisher) {
      throw new Error('Publisher not initialized');
    }

    const post: Post = {
      content: this.extractContent(content),
      metadata: {
        title: metadata.title || file.basename,
        tags: this.extractTags(metadata.tags),
        createdAt: new Date(),
        source: 'Obsidian',
        originalUrl: metadata.originalUrl
      }
    };

    // Get enabled networks from frontmatter or use all enabled networks
    const networks = this.getTargetNetworks(metadata);
    if (networks.length === 0) {
      throw new Error('No networks enabled');
    }

    const results = await this.publisher.publish(post, networks);
    return Array.from(results.values()).every(result => result.success);
  }

  private getTargetNetworks(metadata: PostFrontmatter): SocialNetwork[] {
    // If networks are specified in frontmatter, use those (if they're enabled in settings)
    if (metadata.networks) {
      return metadata.networks.filter(network => {
        switch (network) {
          case 'bluesky':
            return this.settings.bluesky.enabled;
          case 'mastodon':
            return this.settings.mastodon.enabled;
          case 'linkedin':
            return this.settings.linkedin.enabled;
          default:
            return false;
        }
      });
    }

    // Otherwise, use all enabled networks from settings
    const networks: SocialNetwork[] = [];
    if (this.settings.bluesky.enabled) networks.push('bluesky');
    if (this.settings.mastodon.enabled) networks.push('mastodon');
    if (this.settings.linkedin.enabled) networks.push('linkedin');
    return networks;
  }

  private extractContent(content: string): string {
    // Remove YAML frontmatter
    const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
    
    // Remove Obsidian-specific formatting
    return contentWithoutFrontmatter
      .replace(/\[\[([^\]]+)\]\]/g, '$1') // Remove wiki links
      .replace(/\!?\[[^\]]*\]\([^\)]+\)/g, '') // Remove images and links
      .trim();
  }

  private extractTags(tags: string[]): string[] {
    return tags
      .filter(tag => tag !== 'smallpost')
      .map(tag => tag.replace(/^#/, '')); // Remove leading #
  }

  async cleanup(): Promise<void> {
    if (this.publisher) {
      await this.publisher.cleanup();
      this.publisher = null;
    }
  }
} 