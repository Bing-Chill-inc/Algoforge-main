# Publishing the Obsidian plugin

The canonical source lives in `Algoforge-main`. The
`Bing-Chill-inc/algoforge-obsidian` repository is an automated release mirror
and must not be edited by hand after its one-time bootstrap.

## One-time GitHub configuration

1. Generate a passwordless Ed25519 key dedicated to this repository pair.
2. Add the public key under **algoforge-obsidian → Settings → Deploy keys**
   with **Allow write access** enabled.
3. Add the private key verbatim as the `OBSIDIAN_DEPLOY_KEY` Actions secret in
   `Algoforge-main`, preferably on the protected `obsidian-release` environment.
4. Protect source tags matching `obsidian-v*` so only release maintainers can
   create them.
5. Ensure the destination `main` ruleset allows its GitHub Actions workflow to
   fast-forward the branch, and enable Issues for Community support.

The destination was bootstrapped with the workflow stored at
`release-repo/.github/workflows/release.yml`. Every publication stages that
workflow again, keeping the mirror self-hosting. The tagged mirror commit also
contains the TypeScript source snapshot under `src/`; the monorepo remains the
canonical source and build environment.

## Publish a version

1. Update `package.json`, `manifest.json`, and `versions.json` to the same
   numeric SemVer version.
2. Merge the release commit into `main` and wait for normal CI to pass.
3. Tag that commit as `obsidian-vX.Y.Z` and push the tag.
4. The monorepo workflow builds, attests the three assets, and pushes
   destination tag `X.Y.Z` using the deploy key.
5. The destination workflow verifies the canonical attestations, attests the
   mirrored assets, and creates release `X.Y.Z` with only `main.js`,
   `manifest.json`, and `styles.css`.
6. The source workflow checks the published bytes, then uses the same deploy
   key to fast-forward destination `main`. GitHub's repository-local
   `GITHUB_TOKEN` cannot update `main` when a release changes the mirrored
   workflow file.

Verify a downloaded asset with
`gh attestation verify main.js -R Bing-Chill-inc/algoforge-obsidian`.
The same digest should also verify against `Bing-Chill-inc/Algoforge-main`.

Never reuse a published version. If destination release creation fails, rerun
its workflow, then rerun the source workflow. `main` deliberately remains on
the previous good version until the release succeeds.
