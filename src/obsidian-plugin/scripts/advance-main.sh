#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: advance-main.sh MIRROR_WORKTREE VERSION" >&2
  exit 2
fi

mirror="$1"
version="$2"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Release version must be numeric SemVer: $version" >&2
  exit 2
fi

git -C "$mirror" fetch --quiet origin main "refs/tags/$version:refs/tags/$version"
release_sha="$(git -C "$mirror" rev-parse "refs/tags/$version^{commit}")"
main_sha="$(git -C "$mirror" rev-parse refs/remotes/origin/main)"
if git -C "$mirror" merge-base --is-ancestor "$release_sha" "$main_sha"; then
  echo "Destination main already contains release $version."
  exit 0
fi
if ! git -C "$mirror" merge-base --is-ancestor "$main_sha" "$release_sha"; then
  echo "Destination main has diverged from release $version." >&2
  exit 1
fi

git -C "$mirror" push origin "$release_sha:refs/heads/main"
echo "Advanced destination main to release $version."
