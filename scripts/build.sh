#!/bin/bash

PKGMGR="pnpm"
if [ "$1" = "ci" ]; then
    PKGMGR="npm"
fi

cd halo2-wasm
$PKGMGR run build
cd ../halo2-lib-js
$PKGMGR run build
