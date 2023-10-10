#!/bin/bash
set -e

wasm-pack build --release --target web --out-dir temp-pkg --scope axiom-crypto
# manually change pkg/package.json name "@axiom-crypto/halo2-wasm" and version number
# https://github.com/AleoHQ/sdk/pull/708
rm temp-pkg/.gitignore
# then run `cd pkg && npm publish` with correct credentials

# Copy a modified version of package.json and readme.md to pkg/
node ./scripts/makePackage.js

mv temp-pkg pkg/web