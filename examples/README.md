# Polyglot Publisher Example Notes

This directory contains example notes demonstrating different ways to use the Polyglot Publisher plugin for Obsidian.

## Examples

### 1. Simple Post (`simple-post.md`)
- Basic post with tags
- Shows minimal frontmatter configuration
- Demonstrates hashtag handling
- Posts to all enabled networks

### 2. Post with Media (`post-with-media.md`)
- Includes images and links
- Shows how the plugin handles Obsidian-specific formatting
- Demonstrates cross-linking between notes
- Posts to all enabled networks

### 3. Thread Post (`thread-post.md`)
- Longer-form content
- Shows how content is split across platforms
- Demonstrates markdown formatting preservation
- Posts to all enabled networks

### 4. Selective Post (`selective-post.md`)
- Demonstrates network selection
- Shows how to post to specific platforms only
- Uses the `networks` frontmatter field

## Frontmatter Configuration

Each note uses YAML frontmatter with the following options:

```yaml
---
title: "Your Post Title"
tags: [smallpost, other, tags]  # 'smallpost' tag triggers publishing
thread: true/false             # Optional: indicates if this should be posted as a thread
networks: [bluesky, mastodon]  # Optional: specify which networks to post to
---
```

## Network Selection

You can control which networks your post is published to in two ways:

1. **Global Settings**: In the plugin settings, enable/disable networks globally
2. **Per-Post Selection**: Use the `networks` field in frontmatter to specify networks for a particular post

The `networks` field can include any combination of:
- `bluesky`
- `mastodon`
- `linkedin`

If the `networks` field is omitted, the post will be published to all networks that are enabled in your plugin settings.

Note: Posts will only be published to networks that are both:
1. Specified in the post's `networks` field (if present)
2. Enabled in the plugin settings

## Usage Tips

1. Always include the `smallpost` tag to mark a note for publishing
2. Use standard Markdown formatting - it will be adapted for each platform
3. Keep platform-specific limitations in mind:
   - Bluesky: 300 characters per post
   - Mastodon: 500 characters per post
   - LinkedIn: Varies by post type

4. Images and links:
   - Images will be uploaded to each platform directly
   - Links will be preserved but may be counted against character limits
   - Obsidian-specific links (`[[]]`) will be converted to plain text

5. Tags:
   - Use standard hashtags in your content
   - Tags in the frontmatter will be added to the post
   - The `smallpost` tag is removed from the published content 