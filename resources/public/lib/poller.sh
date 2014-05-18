#!/bin/bash

# Calls the service, grabs a manifest and looks for files to pull down. 

DOTDEPLOY_URL="http://192.168.11.26:3000"
DOTDEPLOY_DIRECTORY=$HOME/.dotdeploy
MACHINE_UUID=$(cat $DOTDEPLOY_DIRECTORY/.machine_uuiid)

# pull in explicit dependencies
source $DOTDEPLOY_DIRECTORY/lib/httpClient.sh
source $DOTDEPLOY_DIRECTORY/lib/fileMetadataStore.sh

# perform call to service
fetchUrl "$DOTDEPLOY_URL/api/machine/$MACHINE_UUID/manifest.csv" | while read manifestLine
do
    echo ""
done
