import { Plugin, TFile, Notice } from 'obsidian';
import { PolyglotPublisherSettings, PolyglotPublisherSettingTab, DEFAULT_SETTINGS } from './src/settings';
import { PostProcessor } from './src/post-processor';

export default class PolyglotPublisherPlugin extends Plugin {
  settings: PolyglotPublisherSettings;
  postProcessor: PostProcessor;
  statusBarItem: HTMLElement;

  async onload() {
    await this.loadSettings();

    this.postProcessor = new PostProcessor(this.settings, this.app.metadataCache);
    await this.postProcessor.initialize();

    // Add settings tab
    this.addSettingTab(new PolyglotPublisherSettingTab(this.app, this));

    // Add status bar item
    this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.setText('Polyglot Publisher: Ready');

    // Register file menu item
    this.addCommand({
      id: 'publish-to-social',
      name: 'Publish to Social Media',
      checkCallback: (checking: boolean) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          if (!checking) {
            this.publishCurrentFile(activeFile);
          }
          return true;
        }
        return false;
      }
    });

    // Watch for file changes
    this.registerEvent(
      this.app.metadataCache.on('changed', (file: TFile) => {
        if (this.settings.autoPublish) {
          this.handleFileChange(file);
        }
      })
    );

    // Watch for frontmatter changes
    this.registerEvent(
      this.app.metadataCache.on('changed', (file: TFile) => {
        const cache = this.app.metadataCache.getFileCache(file);
        if (cache?.frontmatter?.tags?.includes('smallpost')) {
          if (this.settings.autoPublish) {
            this.publishCurrentFile(file);
          }
        }
      })
    );
  }

  async onunload() {
    await this.postProcessor.cleanup();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    await this.postProcessor.initialize(); // Reinitialize with new settings
  }

  private async publishCurrentFile(file: TFile) {
    try {
      this.statusBarItem.setText('Polyglot Publisher: Publishing...');
      
      const content = await this.app.vault.read(file);
      const success = await this.postProcessor.processFile(file, content);

      if (success) {
        new Notice('Successfully published to social media platforms');
        this.statusBarItem.setText('Polyglot Publisher: Published');
      } else {
        new Notice('Failed to publish to some platforms. Check console for details.');
        this.statusBarItem.setText('Polyglot Publisher: Error');
      }
    } catch (error) {
      console.error('Failed to publish:', error);
      new Notice(`Failed to publish: ${error.message}`);
      this.statusBarItem.setText('Polyglot Publisher: Error');
    }
  }

  private async handleFileChange(file: TFile) {
    const cache = this.app.metadataCache.getFileCache(file);
    if (cache?.frontmatter?.tags?.includes('smallpost')) {
      await this.publishCurrentFile(file);
    }
  }
} 