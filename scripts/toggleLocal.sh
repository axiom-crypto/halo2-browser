#!/bin/bash

CI=""
if [ "$1" = "ci" ]; then
    CI="ci"
fi
echo $CI

./scripts/build.sh
cd halo2-lib-js
node ./scripts/toggleLocal.js $CI
pnpm install
cd ../halo2-repl
node ./scripts/toggleLocal.js $CI
pnpm install
cd ../cli
node ./scripts/toggleLocal.js $CI
pnpm install