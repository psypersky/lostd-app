#!/bin/bash
set -v
rm -rf build
cp -r src build
r.js -o build.js
node updater.js

