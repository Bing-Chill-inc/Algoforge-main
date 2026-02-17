#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "Usage: $0 /path/to/MyApp.app /path/to/output.dmg"
  exit 1
}

if [[ $# -lt 2 ]]; then
  usage
fi

APP_PATH="$1"
OUTPUT_DMG="$2"

if [[ ! -d "$APP_PATH" ]] || [[ "${APP_PATH##*.}" != "app" ]]; then
  echo "ERROR: '$APP_PATH' is not a .app bundle"
  exit 1
fi

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "ERROR: Missing required environment variable: $name"
    exit 1
  fi
}

require_env "MACOS_SIGN_IDENTITY"
require_env "APPLE_ID"
require_env "APPLE_TEAM_ID"
require_env "APPLE_APP_SPECIFIC_PASSWORD"

APP_PATH="$(cd "$(dirname "$APP_PATH")" && pwd)/$(basename "$APP_PATH")"
OUTPUT_DMG="$(cd "$(dirname "$OUTPUT_DMG")" && pwd)/$(basename "$OUTPUT_DMG")"

APP_NAME="$(basename "$APP_PATH" .app)"
VOL_NAME="${APP_NAME} Installer"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

ENT_MAIN="$TMP_DIR/entitlements_main.plist"
ENT_HELPER="$TMP_DIR/entitlements_helper.plist"

cat > "$ENT_MAIN" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key><false/>
    <key>com.apple.security.network.client</key><true/>
    <key>com.apple.security.cs.allow-jit</key><true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
</dict>
</plist>
PLIST

cat > "$ENT_HELPER" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key><true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
    <key>com.apple.security.network.client</key><true/>
</dict>
</plist>
PLIST

sign_one() {
  local target="$1"
  local entitlements="$2"

  echo "   -> codesign: $target"
  codesign --force --options runtime --timestamp \
    --entitlements "$entitlements" \
    --sign "$MACOS_SIGN_IDENTITY" "$target"
}

sign_app_bundle() {
  local app="$1"

  echo "Signing app bundle: $app"

  echo "Signing .dylib files..."
  while IFS= read -r -d '' dylib; do
    sign_one "$dylib" "$ENT_HELPER"
  done < <(find "$app" -type f -name "*.dylib" -print0)

  echo "Signing .node files..."
  while IFS= read -r -d '' nodefile; do
    sign_one "$nodefile" "$ENT_HELPER"
  done < <(find "$app" -type f -name "*.node" -print0)

  local shipit="$app/Contents/Frameworks/Squirrel.framework/Resources/ShipIt"
  if [[ -f "$shipit" ]]; then
    echo "Signing Squirrel ShipIt..."
    sign_one "$shipit" "$ENT_HELPER"
  fi

  if [[ -d "$app/Contents/Frameworks" ]]; then
    echo "Signing helper executables..."
    while IFS= read -r -d '' exe; do
      if [[ "$exe" == *"Helpers/"* ]] && [[ -x "$exe" ]]; then
        sign_one "$exe" "$ENT_HELPER"
      fi
    done < <(find "$app/Contents/Frameworks" -type f -print0)

    echo "Signing helper .app bundles..."
    while IFS= read -r -d '' helper_app; do
      sign_one "$helper_app" "$ENT_HELPER"
    done < <(find "$app/Contents/Frameworks" -type d -name "*Helper*.app" -print0)
  fi

  echo "Signing nested .app bundles..."
  while IFS= read -r nested_app; do
    if [[ "$nested_app" != "$app" ]]; then
      sign_one "$nested_app" "$ENT_HELPER"
    fi
  done < <(find "$app" -type d -name "*.app" | awk '{ print length, $0 }' | sort -rn | cut -d' ' -f2-)

  echo "Signing .framework bundles..."
  while IFS= read -r framework; do
    sign_one "$framework" "$ENT_HELPER"
  done < <(find "$app" -type d -name "*.framework" | awk '{ print length, $0 }' | sort -rn | cut -d' ' -f2-)

  echo "Signing main app..."
  sign_one "$app" "$ENT_MAIN"

  echo "Verifying .app signature..."
  codesign --verify --deep --strict --verbose=2 "$app"
}

create_dmg() {
  local app="$1"
  local output="$2"
  local staging="$TMP_DIR/staging"

  mkdir -p "$staging"
  cp -R "$app" "$staging/"
  ln -s /Applications "$staging/Applications"

  rm -f "$output"

  echo "Creating compressed DMG..."
  hdiutil create \
    -volname "$VOL_NAME" \
    -srcfolder "$staging" \
    -format UDZO \
    -imagekey zlib-level=9 \
    "$output" >/dev/null
}

sign_and_notarize_dmg() {
  local dmg="$1"

  echo "Signing DMG..."
  codesign --force --timestamp --sign "$MACOS_SIGN_IDENTITY" "$dmg"

  echo "Verifying DMG signature..."
  codesign --verify --verbose "$dmg"

  echo "Submitting DMG for notarization..."
  xcrun notarytool submit "$dmg" \
    --apple-id "$APPLE_ID" \
    --team-id "$APPLE_TEAM_ID" \
    --password "$APPLE_APP_SPECIFIC_PASSWORD" \
    --wait

  echo "Stapling notarization ticket..."
  xcrun stapler staple "$dmg"

  echo "Validating stapled ticket..."
  xcrun stapler validate "$dmg"
}

sign_app_bundle "$APP_PATH"
create_dmg "$APP_PATH" "$OUTPUT_DMG"
sign_and_notarize_dmg "$OUTPUT_DMG"

echo "Done: $OUTPUT_DMG"
