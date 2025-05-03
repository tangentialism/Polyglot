# Obsidian Polyglot Publisher

A powerful cross-posting plugin for Obsidian that lets you publish your notes to multiple social networks simultaneously. Currently supports Bluesky, Mastodon, and LinkedIn.

## Features

- 📝 Publish notes to multiple social networks with a single tag
- 🔄 Smart content adaptation for each platform
- 🎯 Selective publishing to specific networks
- 📊 Real-time publishing status in the status bar
- 🔐 Secure credential management
- ✨ Preserves markdown formatting where supported
- 🏷️ Intelligent tag handling

## Installation

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Polyglot Publisher"
4. Install the plugin
5. Enable the plugin in your list of installed plugins

## Configuration

### Plugin Settings

1. Open Obsidian Settings
2. Navigate to the "Polyglot Publisher" section
3. Configure your social network credentials:

#### Bluesky
- Enable/disable Bluesky integration
- Enter your identifier (handle)
- Enter your password/app password

#### Mastodon
- Enable/disable Mastodon integration
- Enter your instance URL
- Enter your access token

#### LinkedIn
- Enable/disable LinkedIn integration
- Enter your access token
- (Optional) Enter organization ID for posting as an organization

### Global Settings
- Set default post visibility (public/private)
- Configure retry attempts and delay
- Enable/disable networks globally

## Usage

### Basic Publishing

1. Add the `#smallpost` tag to any note you want to publish
2. The plugin will automatically process and publish the note to all enabled networks

### Frontmatter Configuration

Control publishing behavior with YAML frontmatter:

```yaml
---
title: "Your Post Title"
tags: [smallpost, tech, discussion]
networks: [bluesky, mastodon]  # Optional: specify target networks
visibility: public             # Optional: override default visibility
---
```

### Network Selection

You can control which networks receive your post in two ways:

1. **Global Settings**: Enable/disable networks in plugin settings
2. **Per-Post Selection**: Use the `networks` frontmatter field

Available networks:
- `bluesky`
- `mastodon`
- `linkedin`

Posts will only publish to networks that are both:
- Specified in the post's `networks` field (if present)
- Enabled in plugin settings

### Content Formatting

The plugin automatically:
- Converts Obsidian-specific links (`[[]]`) to plain text
- Handles images and external links appropriately
- Preserves hashtags
- Adapts content length for platform limits:
  - Bluesky: 300 characters
  - Mastodon: 500 characters
  - LinkedIn: Varies by post type

### Status Indicators

The plugin shows publishing status in the Obsidian status bar:
- 🔄 Publishing in progress
- ✅ Successfully published
- ❌ Publishing failed

## Example Notes

See the `examples/` directory for sample notes demonstrating:
1. Simple posts
2. Posts with media
3. Thread/long-form content
4. Network-selective posting

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify your credentials in plugin settings
   - Check network connectivity
   - Ensure API endpoints are accessible

2. **Content Not Publishing**
   - Confirm the `#smallpost` tag is present
   - Check enabled networks in settings
   - Verify frontmatter syntax

3. **Formatting Issues**
   - Review platform-specific limitations
   - Check for unsupported markdown features
   - Verify media file formats and sizes

### Error Messages

The plugin provides detailed error messages in:
- The status bar
- Obsidian's console (Ctrl/Cmd + Shift + I)
- Plugin settings debug section

## Privacy & Security

- Credentials are stored securely in Obsidian's encrypted storage
- No data is sent to third parties beyond the selected social networks
- All network communication is done directly with official APIs

## Contributing

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- [GitHub Issues](https://github.com/yourusername/obsidian-polyglot-publisher/issues)
- [Plugin Discussions](https://github.com/yourusername/obsidian-polyglot-publisher/discussions) 