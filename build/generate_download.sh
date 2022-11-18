#!/usr/bin/env bash

# Automate the data generation process
if [ ! -f ./public/download/download.zip ]
then
  pushd ./public/download || exit 1;
  zip -r download.zip ./
  popd || exit;
fi
