#!/bin/bash
cd halo2-lib-js
node ./scripts/toggleDeployed.js
pnpm install
cd ../halo2-repl
node ./scripts/toggleDeployed.js
pnpm install
cd ../cli
node ./scripts/toggleDeployed.js
pnpm install