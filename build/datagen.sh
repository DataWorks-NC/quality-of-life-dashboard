#!/usr/bin/env bash

# Automate the data generation process

node ./build/datagen
node ./build/report-datagen

if [ ! -f ./public/download/download.zip ]
then
  pushd ./public/download || exit 1;
  zip -r download.zip ./
  popd || exit;
fi
