# AlgoForge for Visual Studio Code

AlgoForge's visual algorithm editor creates `.af` files by default and continues
to open existing `.algoforge` files. Legacy root-array JSON documents are treated
as format version 0 and are upgraded to the version 1
`{ "version": 1, "algorithm": [...] }` envelope on the next visual edit or
Save As. `.json` files remain available through the Import command.

## Development

```sh
bun install
bun run check
bun run package
```

Open this directory in VS Code and use the included **Run AlgoForge Extension** launch configuration. The extension build invokes `../front-editeur/build.ts` directly; editor source code is not copied into this package.

The first release supports local files and VS Code Remote files. Cloud accounts and PDF export are intentionally not available inside the extension.

## Marketplace release

The release command checks the extension, builds and verifies the versioned VSIX,
requires a clean commit that matches its upstream branch, and publishes that exact
artifact:

```sh
VSCE_PAT="..." bun run publish:marketplace
```

Use `bun run publish:marketplace --dry-run` to exercise the complete build without
publishing. For Microsoft Entra-based environments, use
`bun run publish:marketplace --azure-credential` after authenticating the Azure
credential chain. Never store a PAT in this repository or in a committed `.env` file.
