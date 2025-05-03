import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { SocialPublisher, PublisherConfig, SocialNetwork } from 'polyglot-social-publisher';

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
	publisher: SocialPublisher | null = null;

	async onload() {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new PolyglotSettingTab(this.app, this));

		// Add command to manually publish current note
		this.addCommand({
			id: 'publish-note',
			name: 'Publish current note',
			checkCallback: (checking: boolean) => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					if (!checking) {
						this.publishCurrentNote(activeView);
					}
					return true;
				}
				return false;
			}
		});

		// Register for file events
		this.registerEvent(
			this.app.vault.on('modify', (file) => {
				if (this.settings.autoPublish) {
					this.handleFileModified(file);
				}
			})
		);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		await this.initializePublisher();
	}

	async saveSettings() {
		await this.saveData(this.settings);
		await this.initializePublisher();
	}

	async initializePublisher() {
		const config: PublisherConfig = {};
		
		if (this.settings.bluesky) {
			config.bluesky = this.settings.bluesky;
		}
		
		if (this.settings.mastodon) {
			config.mastodon = this.settings.mastodon;
		}

		try {
			this.publisher = new SocialPublisher(config);
			await this.publisher.initialize();
		} catch (error) {
			console.error('Failed to initialize publisher:', error);
			this.publisher = null;
		}
	}

	async publishCurrentNote(view: MarkdownView) {
		if (!this.publisher) {
			new Notice('Publisher not initialized. Please check your settings.');
			return;
		}

		try {
			const content = view.getViewData();
			const networks = this.settings.defaultNetworks;

			const results = await this.publisher.publish({
				content,
				metadata: {
					title: view.file.basename,
					source: 'obsidian'
				}
			}, networks);

			let successCount = 0;
			for (const [network, result] of results.entries()) {
				if (result.success) {
					successCount++;
				} else {
					new Notice(`Failed to publish to ${network}: ${result.error}`);
				}
			}

			if (successCount > 0) {
				new Notice(`Successfully published to ${successCount} network(s)`);
			}
		} catch (error) {
			new Notice(`Failed to publish: ${error.message}`);
		}
	}

	async handleFileModified(file: TFile) {
		// TODO: Check for #smallpost tag and publish if present
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

		// Bluesky settings
		containerEl.createEl('h3', { text: 'Bluesky' });
		new Setting(containerEl)
			.setName('Identifier')
			.setDesc('Your Bluesky handle (e.g. user.bsky.social)')
			.addText(text => text
				.setPlaceholder('handle.bsky.social')
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
				.setPlaceholder('Enter your app password')
				.setValue(this.plugin.settings.bluesky?.password || '')
				.onChange(async (value) => {
					if (!this.plugin.settings.bluesky) {
						this.plugin.settings.bluesky = { identifier: '', password: '' };
					}
					this.plugin.settings.bluesky.password = value;
					await this.plugin.saveSettings();
				}));

		// Mastodon settings
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
				.setPlaceholder('Enter your access token')
				.setValue(this.plugin.settings.mastodon?.accessToken || '')
				.onChange(async (value) => {
					if (!this.plugin.settings.mastodon) {
						this.plugin.settings.mastodon = { instanceUrl: '', accessToken: '' };
					}
					this.plugin.settings.mastodon.accessToken = value;
					await this.plugin.saveSettings();
				}));

		// General settings
		containerEl.createEl('h3', { text: 'General Settings' });
		new Setting(containerEl)
			.setName('Auto-publish')
			.setDesc('Automatically publish notes when #smallpost tag is added')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoPublish)
				.onChange(async (value) => {
					this.plugin.settings.autoPublish = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default Networks')
			.setDesc('Networks to publish to by default')
			.addDropdown(dropdown => {
				dropdown
					.addOption('bluesky', 'Bluesky')
					.addOption('mastodon', 'Mastodon')
					.setValue(this.plugin.settings.defaultNetworks[0])
					.onChange(async (value) => {
						this.plugin.settings.defaultNetworks = [value as SocialNetwork];
						await this.plugin.saveSettings();
					});
			});
	}
} 