#! /bin/bash

###
# Submit a new build to google cloud.
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/../..

source ./deploy/config.sh

gcloud config set project digital-ucdavis-edu

echo "Submitting build to Google Cloud..."
gcloud builds submit --tag $APP_IMAGE_NAME_TAG .
