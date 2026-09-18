#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 || $# -gt 4 ]]; then
  echo "Usage: publish-tag.sh STAGED_DIR REMOTE VERSION [WORKSPACE]" >&2
  exit 2
fi

staged_dir="$(cd "$1" && pwd)"
remote="$2"
version="$3"
workspace="${4:-$(mktemp -d)}"
mirror="$workspace/mirror"

if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Release version must be numeric SemVer: $version" >&2
  exit 2
fi
if [[ -e "$mirror" ]]; then
  echo "Mirror worktree already exists: $mirror" >&2
  exit 2
fi
for file in README.md LICENSE manifest.json versions.json main.js styles.css .github/workflows/release.yml; do
  if [[ ! -s "$staged_dir/$file" ]]; then
    echo "Missing staged release file: $file" >&2
    exit 2
  fi
done

mkdir -p "$workspace"
git clone --branch main --single-branch "$remote" "$mirror"
cd "$mirror"
git rm -r --ignore-unmatch . >/dev/null
git clean -fdx >/dev/null
cp -a "$staged_dir/." .
git add --all
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
source_sha="${GITHUB_SHA:-local}"
if ! git diff --cached --quiet; then
  git commit -m "Release AlgoForge Obsidian $version from Algoforge-main@$source_sha" >/dev/null
fi

remote_sha="$(git ls-remote --tags origin "refs/tags/$version" | awk 'NR == 1 { print $1 }')"
if [[ -n "$remote_sha" ]]; then
  git fetch --quiet origin "refs/tags/$version"
  local_tree="$(git rev-parse 'HEAD^{tree}')"
  remote_tree="$(git rev-parse 'FETCH_HEAD^{tree}')"
  if [[ "$local_tree" == "$remote_tree" ]]; then
    echo "Destination tag $version already contains the same release tree; nothing to publish."
    exit 0
  fi
  echo "Destination tag $version already exists with different contents." >&2
  exit 1
fi

git push origin "HEAD:refs/tags/$version"
echo "Published destination tag $version from commit $(git rev-parse HEAD)."
