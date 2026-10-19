#!/usr/bin/env bash
# Assembles the complete static site into <outDir> (served under /dummy-apps/).
set -euo pipefail
export MSYS_NO_PATHCONV=1 MSYS2_ENV_CONV_EXCL='*'

if [ $# -ne 1 ]; then
  echo "Usage: $0 <outDir>" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$1"
OUT="$(cd "$1" && pwd)"

# Start from an empty output directory.
find "$OUT" -mindepth 1 -delete

cp "$ROOT/index.html" "$OUT/"
[ -f "$ROOT/.nojekyll" ] && cp "$ROOT/.nojekyll" "$OUT/"

# Build output location (relative to the app folder) for apps with a build step.
dist_dir() {
  case "$1" in
    12-expense-splitter) echo "dist/halves/browser" ;;
    11-task-board | 13-clinic-booking | 14-quiz-platform) echo "dist" ;;
    *) echo "dist" ;;
  esac
}

for dir in "$ROOT"/[0-9][0-9]-*/; do
  name="$(basename "$dir")"
  mkdir -p "$OUT/$name"
  if [ -f "$dir/package.json" ]; then
    BASE="/dummy-apps/$name/"
    echo "Building $name"
    (
      cd "$dir"
      if [ -f package-lock.json ]; then npm ci; else npm install; fi
      if [ "$name" = "12-expense-splitter" ]; then
        npm run build -- --base-href "$BASE"
      else
        BASE_PATH="$BASE" npm run build
      fi
    )
    cp -R "$dir/$(dist_dir "$name")/." "$OUT/$name/"
  else
    echo "Copying $name"
    # Static apps: publish tracked files only.
    (cd "$ROOT" && git ls-files -z -- "$name" | xargs -0 cp --parents -t "$OUT")
  fi
done

echo "Site assembled in $OUT"
