#!/usr/bin/env bash

echo "Normal:"
node ../bin/ec0lint-css.js visual.css --config=visual-config.json

echo -e "\n\nVerbose:"
node ../bin/ec0lint-css.js visual.css --config=visual-config.json --formatter verbose
