#!/bin/bash
./scripts/build.sh
cd halo2-lib-js
node ./scripts/toggleLocal.js
pnpm install
cd ../halo2-repl
node ./scripts/toggleLocal.js
pnpm install