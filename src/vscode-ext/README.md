# AlgoForge for Visual Studio Code

AlgoForge's visual algorithm editor for `.algoforge` and `.af` files.

## Development

```sh
bun install
bun run check
bun run package
```

Open this directory in VS Code and use the included **Run AlgoForge Extension** launch configuration. The extension build invokes `../front-editeur/build.ts` directly; editor source code is not copied into this package.

The first release supports local files and VS Code Remote files. Cloud accounts and PDF export are intentionally not available inside the extension.
