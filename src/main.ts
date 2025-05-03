import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { SocialPublisher, PublisherConfig, SocialNetwork, Post } from 'polyglot-social-publisher';

interface PolyglotSettings {
  bluesky?: {
    identifier: string;
    password: string;
  };
  mastodon?: {
    instanceUrl: string;
    accessToken: string;
  };
  defaultNetworks: SocialNetwork[];
  autoPublish: boolean;
}

const DEFAULT_SETTINGS: PolyglotSettings = {
  defaultNetworks: ['bluesky', 'mastodon'],
  autoPublish: true
};

export default class PolyglotPlugin extends Plugin {
  settings: PolyglotSettings;
  statusBarItem: HTMLElement;
  publisher: SocialPublisher | null = null;

  async onload() {
    await this.loadSettings();
    await this.initializePublisher();

    // Add settings tab
    this.addSettingTab(new PolyglotSettingTab(this.app, this));

    // Add status bar item
    this.statusBarItem = this.addStatusBarItem();
    this.updateStatusBar('Ready');

    // Register the command to publish notes with #smallpost tag
    this.registerEvent(
      this.app.metadataCache.on('changed', (file) => {
        const cache = this.app.metadataCache.getFileCache(file);
        if (cache?.frontmatter?.tags?.includes('smallpost') && this.settings.autoPublish) {
          this.handleSmallPost(file);
        }
      })
    );

    // Add command to manually trigger publishing
    this.addCommand({
      id: 'publish-to-social',
      name: 'Publish current note to social networks',
      editorCallback: (_editor: Editor, view: MarkdownView) => {
        const file = view.file;
        if (file) {
          this.publishNote(file);
        } else {
          new Notice('No active file to publish');
        }
      }
    });
  }

  async onunload() {
    if (this.publisher) {
      await this.publisher.cleanup();
      this.publisher = null;
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    await this.initializePublisher();
  }

  private async initializePublisher() {
    const config: PublisherConfig = {
      bluesky: this.settings.bluesky,
      mastodon: this.settings.mastodon && {
        accessToken: this.settings.mastodon.accessToken,
        instanceUrl: this.settings.mastodon.instanceUrl
      },
      defaultVisibility: 'public'
    };

    if (this.publisher) {
      await this.publisher.cleanup();
    }

    this.publisher = new SocialPublisher(config);
    await this.publisher.initialize();
  }

  private updateStatusBar(message: string, timeout = 5000) {
    this.statusBarItem.setText(message);
    if (timeout > 0) {
      setTimeout(() => {
        this.statusBarItem.setText('');
      }, timeout);
    }
  }

  private async handleSmallPost(file: TFile) {
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    
    // Check if already published
    if (frontmatter?.published) {
      return;
    }

    await this.publishNote(file);
  }

  private async publishNote(file: TFile) {
    if (!this.publisher) {
      new Notice('Publisher not initialized');
      return;
    }

    try {
      const content = await this.app.vault.read(file);
      const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
      
      // Get networks from frontmatter or default settings
      const networks = (frontmatter?.networks as SocialNetwork[]) || this.settings.defaultNetworks;

      // Process content
      const processedContent = this.processContent(content);

      this.updateStatusBar('Publishing...', 0);

      const post: Post = {
        content: processedContent,
        metadata: {
          title: frontmatter?.title || file.basename,
          tags: this.extractTags(frontmatter?.tags || []),
          createdAt: new Date(),
          source: 'Obsidian',
          originalUrl: frontmatter?.originalUrl
        }
      };

      const results = await this.publisher.publish(post, networks);
      
      // Handle results
      let success = true;
      let message = '';
      
      for (const [network, result] of results.entries()) {
        if (result.success) {
          message += `✓ ${network} `;
        } else {
          success = false;
          message += `✗ ${network} `;
          new Notice(`Failed to publish to ${network}: ${result.error}`);
        }
      }

      this.updateStatusBar(message);

      if (success) {
        // Mark as published in frontmatter
        await this.app.fileManager.processFrontMatter(file, (fm) => {
          fm.published = true;
          fm.publishedDate = new Date().toISOString();
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      new Notice(`Error publishing note: ${errorMessage}`);
      this.updateStatusBar('Publishing failed');
    }
  }

  private processContent(content: string): string {
    // Remove YAML frontmatter
    content = content.replace(/^---\n[\s\S]*?\n---\n/, '');

    // Convert wiki-links to plain text
    content = content.replace(/\[\[(.*?)\]\]/g, '$1');

    // Remove Obsidian-specific formatting
    content = content.replace(/==(.*?)==/g, '$1'); // highlights
    content = content.replace(/\^(.*?)\^/g, '$1'); // superscript

    // Preserve hashtags
    content = content.replace(/(?<!\[)#(\w+)/g, '#$1');

    return content.trim();
  }

  private extractTags(tags: string[]): string[] {
    return tags
      .filter(tag => tag !== 'smallpost')
      .map(tag => tag.replace(/^#/, '')); // Remove leading #
  }
}

class PolyglotSettingTab extends PluginSettingTab {
  plugin: PolyglotPlugin;

  constructor(app: App, plugin: PolyglotPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Polyglot Publisher Settings' });

    // Bluesky Settings
    containerEl.createEl('h3', { text: 'Bluesky' });
    new Setting(containerEl)
      .setName('Identifier')
      .setDesc('Your Bluesky identifier (e.g., user.bsky.social)')
      .addText(text => text
        .setPlaceholder('user.bsky.social')
        .setValue(this.plugin.settings.bluesky?.identifier || '')
        .onChange(async (value) => {
          if (!this.plugin.settings.bluesky) {
            this.plugin.settings.bluesky = { identifier: '', password: '' };
          }
          this.plugin.settings.bluesky.identifier = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('App Password')
      .setDesc('Your Bluesky app password')
      .addText(text => text
        .setPlaceholder('Enter app password')
        .setValue(this.plugin.settings.bluesky?.password || '')
        .onChange(async (value) => {
          if (!this.plugin.settings.bluesky) {
            this.plugin.settings.bluesky = { identifier: '', password: '' };
          }
          this.plugin.settings.bluesky.password = value;
          await this.plugin.saveSettings();
        }));

    // Mastodon Settings
    containerEl.createEl('h3', { text: 'Mastodon' });
    new Setting(containerEl)
      .setName('Instance URL')
      .setDesc('Your Mastodon instance URL')
      .addText(text => text
        .setPlaceholder('https://mastodon.social')
        .setValue(this.plugin.settings.mastodon?.instanceUrl || '')
        .onChange(async (value) => {
          if (!this.plugin.settings.mastodon) {
            this.plugin.settings.mastodon = { instanceUrl: '', accessToken: '' };
          }
          this.plugin.settings.mastodon.instanceUrl = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Access Token')
      .setDesc('Your Mastodon access token')
      .addText(text => text
        .setPlaceholder('Enter access token')
        .setValue(this.plugin.settings.mastodon?.accessToken || '')
        .onChange(async (value) => {
          if (!this.plugin.settings.mastodon) {
            this.plugin.settings.mastodon = { instanceUrl: '', accessToken: '' };
          }
          this.plugin.settings.mastodon.accessToken = value;
          await this.plugin.saveSettings();
        }));

    // Auto Publish Setting
    new Setting(containerEl)
      .setName('Auto Publish')
      .setDesc('Automatically publish notes when #smallpost tag is added')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoPublish)
        .onChange(async (value) => {
          this.plugin.settings.autoPublish = value;
          await this.plugin.saveSettings();
        }));

    // Default Networks
    containerEl.createEl('h3', { text: 'Default Networks' });
    new Setting(containerEl)
      .setName('Default Networks')
      .setDesc('Select which networks to publish to by default')
      .addDropdown(dropdown => {
        dropdown
          .addOption('bluesky', 'Bluesky')
          .addOption('mastodon', 'Mastodon')
          .setValue(this.plugin.settings.defaultNetworks.join(','))
          .onChange(async (value) => {
            this.plugin.settings.defaultNetworks = value.split(',') as SocialNetwork[];
            await this.plugin.saveSettings();
          });
      });
  }
} 