#!/usr/bin/env bash

# Automate the data generation process

node --experimental-modules ./build/datagen.mjs
node --experimental-modules ./build/report-datagen.mjs
pushd ./public/download || exit 1;
zip -r download.zip ./
popd || exit;
