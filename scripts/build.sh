#!/bin/bash
rm -r pkg
mkdir pkg
tsc
./scripts/build-js.sh
./scripts/build-web.sh
node ./scripts/makePkg.js
