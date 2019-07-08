#!/usr/bin/env bash

# Automate the data generation process

node --experimental-modules ./build/datagen.mjs
node --experimental-modules ./build/report-datagen.mjs
pushd ./public/download
zip -r download.zip ./
popd
