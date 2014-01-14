#!/bin/bash
set -v
rm -rf build
mkdir build
r.js -o build.js
node inliner.js

