#! /bin/bash

###
# Do the basic setup for local development
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/..

source ./config.sh

./cmds/npm-install.sh
./cmds/subset-icons.sh
./cmds/generate-dev-bundles.sh

./cmds/get-env.sh -l
touch ../gc-writer-key.json
touch ../gc-reader-key.json
