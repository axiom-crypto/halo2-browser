#!/bin/bash

CI=""
PKGMGR="pnpm"
if [ "$1" = "ci" ]; then
    CI="ci"
    PKGMGR="npm"
fi

./scripts/build.sh
cd halo2-lib-js
node ./scripts/toggleLocal.js $CI
$PKGMGR install
cd ../halo2-repl
node ./scripts/toggleLocal.js $CI
$PKGMGR install
cd ../cli
node ./scripts/toggleLocal.js $CI
$PKGMGR install