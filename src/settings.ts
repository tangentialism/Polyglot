import { App, PluginSettingTab, Setting } from 'obsidian';
import type PolyglotPublisherPlugin from '../main';

export interface PolyglotPublisherSettings {
  bluesky: {
    enabled: boolean;
    identifier: string;
    password: string;
  };
  mastodon: {
    enabled: boolean;
    accessToken: string;
    instanceUrl: string;
  };
  linkedin: {
    enabled: boolean;
    accessToken: string;
  };
  defaultVisibility: 'public' | 'private';
  autoPublish: boolean;
}

export const DEFAULT_SETTINGS: PolyglotPublisherSettings = {
  bluesky: {
    enabled: false,
    identifier: '',
    password: ''
  },
  mastodon: {
    enabled: false,
    accessToken: '',
    instanceUrl: 'https://mastodon.social'
  },
  linkedin: {
    enabled: false,
    accessToken: ''
  },
  defaultVisibility: 'public',
  autoPublish: true
};

export class PolyglotPublisherSettingTab extends PluginSettingTab {
  plugin: PolyglotPublisherPlugin;

  constructor(app: App, plugin: PolyglotPublisherPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('polyglot-publisher-settings');

    containerEl.createEl('h2', { text: 'Polyglot Publisher Settings' });

    // Bluesky Settings
    containerEl.createEl('h3', { text: 'Bluesky' });
    new Setting(containerEl)
      .setName('Enable Bluesky')
      .setDesc('Enable publishing to Bluesky')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.bluesky.enabled)
        .onChange(async (value: boolean) => {
          this.plugin.settings.bluesky.enabled = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Identifier')
      .setDesc('Your Bluesky handle (e.g., username.bsky.social)')
      .addText(text => text
        .setPlaceholder('handle.bsky.social')
        .setValue(this.plugin.settings.bluesky.identifier)
        .onChange(async (value: string) => {
          this.plugin.settings.bluesky.identifier = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Password')
      .setDesc('Your Bluesky app password')
      .addText(text => text
        .setPlaceholder('Enter your password')
        .setValue(this.plugin.settings.bluesky.password)
        .onChange(async (value: string) => {
          this.plugin.settings.bluesky.password = value;
          await this.plugin.saveSettings();
        }));

    // Mastodon Settings
    containerEl.createEl('h3', { text: 'Mastodon' });
    new Setting(containerEl)
      .setName('Enable Mastodon')
      .setDesc('Enable publishing to Mastodon')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.mastodon.enabled)
        .onChange(async (value: boolean) => {
          this.plugin.settings.mastodon.enabled = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Instance URL')
      .setDesc('Your Mastodon instance URL')
      .addText(text => text
        .setPlaceholder('https://mastodon.social')
        .setValue(this.plugin.settings.mastodon.instanceUrl)
        .onChange(async (value: string) => {
          this.plugin.settings.mastodon.instanceUrl = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Access Token')
      .setDesc('Your Mastodon access token')
      .addText(text => text
        .setPlaceholder('Enter your access token')
        .setValue(this.plugin.settings.mastodon.accessToken)
        .onChange(async (value: string) => {
          this.plugin.settings.mastodon.accessToken = value;
          await this.plugin.saveSettings();
        }));

    // General Settings
    containerEl.createEl('h3', { text: 'General Settings' });
    new Setting(containerEl)
      .setName('Default Visibility')
      .setDesc('Default visibility for posts')
      .addDropdown(dropdown => dropdown
        .addOption('public', 'Public')
        .addOption('private', 'Private')
        .setValue(this.plugin.settings.defaultVisibility)
        .onChange(async (value: 'public' | 'private') => {
          this.plugin.settings.defaultVisibility = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Auto Publish')
      .setDesc('Automatically publish when #smallpost tag is added')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoPublish)
        .onChange(async (value: boolean) => {
          this.plugin.settings.autoPublish = value;
          await this.plugin.saveSettings();
        }));
  }
} 