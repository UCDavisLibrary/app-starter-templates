#! /bin/bash

###
# Find an app server log by log id
# Usage: ./cmds/find-server-log.sh <log_id> [-l]
# log_id: the id of the log to find
# -l: use the docker compose cluster in the local dev directory
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/..

source config.sh

# make sure log id is provided
if [ -z "$1" ]; then
  echo "Please provide a log id"
  exit 1
fi

LOCAL=false

while getopts "l" opt; do
  case ${opt} in
    l )
      LOCAL=true
      ;;
    \? )
      echo "Invalid option: -$OPTARG" 1>&2
      exit 1
      ;;
  esac
done

shift $((OPTIND -1))

LOG_ID=$1

if [ -z "$LOG_ID" ]; then
  echo "Please provide a log id"
  exit 1
fi

if [ "$LOCAL" = true ]; then
  cd $LOCAL_DEV_DIRECTORY
fi


docker compose logs app | grep "$LOG_ID" | sed 's/^[^|]*| //' | jq
