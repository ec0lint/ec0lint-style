#!/usr/bin/env bash

echo "Normal:"
node ../bin/ec0lint-style visual.css --config=visual-config.json

echo -e "\n\nVerbose:"
node ../bin/ec0lint-style visual.css --config=visual-config.json --formatter verbose
