#!/bin/bash
set -e

wasm-pack build --release --target nodejs --out-dir temp-pkg --scope axiom-crypto --no-default-features
# manually change pkg/package.json name "@axiom-crypto/halo2-wasm" and version number
# https://github.com/AleoHQ/sdk/pull/708
rm temp-pkg/.gitignore
# then run `cd pkg && npm publish` with correct credentials

# Copy a modified version of package.json and readme.md to pkg/
node ./scripts/makeSubdirPkg.js

sed -i '' "s/require('env')/{memory: new WebAssembly.Memory({initial: 100,maximum: 65536,shared: true,})}/g" temp-pkg/index.js

mv temp-pkg pkg/js
