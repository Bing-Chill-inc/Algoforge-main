# AlgoForge for Obsidian

Edit AlgoForge `.af` files visually inside Obsidian and embed them in notes.

## Usage

Use **AlgoForge: New algorithm**, right-click a vault file or folder and choose **New Algorithm** to create the next available algorithm.af name immediately, or open an existing `.af`/`.algoforge` file. Embed an algorithm with:

```markdown
![[algorithms/example.af]]
```

Embeds render as full-width, read-only previews in Reading view and Live Preview, using the active Obsidian theme palette. Click a preview to open the source algorithm. Move the cursor into a Live Preview embed to reveal its Markdown source.

## Installation and development

Download `main.js`, `manifest.json`, and `styles.css` from the
[latest release](https://github.com/Bing-Chill-inc/algoforge-obsidian/releases/latest)
into `.obsidian/plugins/algoforge/`, then enable **AlgoForge** under Community
plugins. You can also install the release repository with BRAT.

This repository is an automated release mirror. The canonical source and
development history live in
[Bing-Chill-inc/Algoforge-main](https://github.com/Bing-Chill-inc/Algoforge-main/tree/main/src/obsidian-plugin).
From a checkout of that monorepo:

```sh
cd src/obsidian-plugin
bun install
bun run check
```

## Privacy and limitations

The plugin is desktop-only, works entirely from local vault files, and performs no authentication, telemetry, or network requests. AlgoForge Cloud and interactive editing inside note embeds are not supported. Obsidian Publish and external Markdown renderers do not run the plugin; export SVG or PNG for a portable image.
