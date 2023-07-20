#! /bin/bash

###
# Submit a new build to google cloud.
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/../..

source ./deploy/config.sh

gcloud config set project digital-ucdavis-edu
USER=$(gcloud auth list --filter="status:ACTIVE"  --format="value(account)")
REPO_NAME=$(basename $(git remote get-url origin))
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

echo "Submitting build to Google Cloud..."
gcloud builds submit \
  --config ./deploy/gcloud/cloudbuild.yaml \
  --substitutions=_UCD_LIB_INITIATOR=$USER,REPO_NAME=$REPO_NAME,BRANCH_NAME=$BRANCH_NAME,_APP_IMAGE_NAME_TAG=$APP_IMAGE_NAME_TAG,_CONFIG_PROJECT=$APP_SLUG \
  .
