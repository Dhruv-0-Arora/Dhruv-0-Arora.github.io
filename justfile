set shell := ["bash", "-euo", "pipefail", "-c"]

default: ci

sim:
    cd sim && bun install --frozen-lockfile && bun run build

sim-check:
    cd sim && bun install --frozen-lockfile && bun run lint && bun run test

ci: sim-check sim

fonts:
    #!/usr/bin/env bash
    set -euo pipefail
    base=https://cdn.jsdelivr.net/npm/@fontsource/commit-mono@5.3.0/files
    tmp=$(mktemp -d)
    trap 'rm -rf "$tmp"' EXIT
    fetch() {
      curl -fsSL "$base/commit-mono-latin-$1.woff2" -o "$tmp/$1.woff2"
      echo "$2  $tmp/$1.woff2" | sha256sum --check --quiet
    }
    fetch 400-normal 86132abb57fc615f2ab900cde4cd9d5796e9791daf1f85d79fc933aa50b3b15c
    fetch 400-italic 9bcb46777edfdee13510557628a27c680127f3d6f9163e3974f745e17dc10408
    fetch 700-normal 1b00600b728444492b0c4906cb85e0055b889ea32ea4fb29bf25cd90cd0365b4
    web="U+0020-007E,U+00A0-00FF,U+2013,U+2018-201D,U+2022,U+2026,U+2190-2193,U+2500-257F,U+2580-259F"
    cut() { pyftsubset "$tmp/$1.woff2" --unicodes="$2" --layout-features='' --no-hinting --desubroutinize --output-file="$3" "${@:4}"; }
    mkdir -p static/fonts crates/glyph-bake/assets
    cut 400-normal "$web" static/fonts/commit-mono-400.woff2 --flavor=woff2
    cut 400-italic "$web" static/fonts/commit-mono-400-italic.woff2 --flavor=woff2
    cut 700-normal "$web" static/fonts/commit-mono-700.woff2 --flavor=woff2
    cut 400-normal "U+0020-007E" crates/glyph-bake/assets/commit-mono-400.ttf
    curl -fsSL https://cdn.jsdelivr.net/npm/@fontsource/commit-mono@5.3.0/LICENSE -o static/fonts/OFL.txt
