#!/bin/bash
node ./scripts/updateCargoVersion.js
echo "build.sh start"
rm -r pkg
mkdir pkg
./scripts/build-js.sh
./scripts/build-web.sh
node ./scripts/makePkg.js
