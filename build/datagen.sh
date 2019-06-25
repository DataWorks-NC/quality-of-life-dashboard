#!/usr/bin/env bash

# Automate the data generation process

node $NODE_DEBUG_OPTION ./build/datagen.js
npx babel-node ./build/report-datagen.js
cp -r ./app/assets/download/* ./public/download
pushd ./public/download
zip -r download.zip ./
popd
