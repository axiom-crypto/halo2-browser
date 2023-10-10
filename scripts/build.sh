#!/bin/bash
rm -r pkg
mkdir pkg
./scripts/build-js.sh
./scripts/build-web.sh