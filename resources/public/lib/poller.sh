#!/bin/bash

# Calls the service, grabs a manifest and looks for files to pull down. 
DOTDEPLOY_URL="http://localhost:8000"
DOTDEPLOY_DIRECTORY=$HOME/.dotdeploy
MACHINE_UUID=$(cat $DOTDEPLOY_DIRECTORY/.machine_uuiid)

# pull in explicit dependencies
source $DOTDEPLOY_DIRECTORY/lib/logHelper.sh
source $DOTDEPLOY_DIRECTORY/lib/httpClient.sh
source $DOTDEPLOY_DIRECTORY/lib/fileMetadataStore.sh

# which column in manifest to look in
FILE_ID_FIELD=1
PATH_FIELD=2
REVISION_FIELD=3
LOCATION_FIELD=4

# $1: url
# $2: path
# $3: fileId
# $4: revision
function fetchFilePopulateMetadata {
    url=$1
    path=$2
    fileId=$3
    revision=$4
    
    fetchUrl $location > $DOTDEPLOY_DIRECTORY/tracked/$fileId
    
    sha5Sum=$(sha5SumFileId $fileId)
    
    # update our metadata on it
    echo "revision=$revision" > $DOTDEPLOY_DIRECTORY/tracked/$fileId.meta
    echo "path=$path" >> $DOTDEPLOY_DIRECTORY/tracked/$fileId.meta
    echo "sha5sum=$sha5sum" >> $DOTDEPLOY_DIRECTORY/tracked/$fileId.meta   
}

# $1: fileId
function restoreOriginal {
    fileId=$1
    RESTOREPATH=$(getPathForId $fileId)

    unlink $RESTOREPATH
    mv ${DOTDEPLOY_DIRECTORY}/originals/${RESTOREPATH} ${RESTOREPATH}

    # clean up any empty directories after restoring
    find ${DOTDEPLOY_DIRECTORY}/originals -type d -empty -delete
}

TRACKEDFILES=()

fetchUrl "$DOTDEPLOY_URL/manifest.csv" | while read manifestLine
do
    # ignore if it's a comment (i.e. a header row)
    if [[ ${manifestLine:0:1} == "#" ]]
    then
        continue
    fi
    
    fileId=$(echo $manifestLine | cut -d, -f$FILE_ID_FIELD)
    path=$(echo $manifestLine | cut -d, -f$PATH_FIELD)
    revision=$(echo $manifestLine | cut -d, -f$REVISION_FIELD)
    location=$(echo $manifestLine | cut -d, -f$LOCATION_FIELD)

    TRACKEDFILES+=(${fileId})

    # determine if file already exists
    getMetadataForId $fileId
    if [ $? -eq 0 ]
    then
        if localEditsExist $fileId
        then
            logError "local changes exist in $path, not updating"
            echo
            exit 1
        else 
            # local edits do not exist, proceed with updating the file
            fetchFilePopulateMetadata $location $path $fileId $revision
        fi
    else
        # file is not tracked locally. back up existing file if necessary.
        # then create a symbolic link replacing the old file with the new 
        # tracked id.
                
        # can refactor this call outside of both conditionals
        fetchFilePopulateMetadata $location $path $fileId $revision
        if [ ! $? -eq 0 ]
        then
            logError "could not fetch file from $location, exiting"
            echo
            exit 1
        fi
        
        if [ -a $path ]
        then
            # file currently exists on machine, put it into originals directory
            relativePath=$(echo $path | sed s/~\\///)
            destination=$DOTDEPLOY_DIRECTORY/originals
            
            mv $path $destination
            
            if [ ! $? -eq 0 ]
            then
                logError "could not move file from $path, exiting"
                echo
                exit 1
            fi
        fi
                    
        ln -s $DOTDEPLOY_DIRECTORY/tracked/$fileId $path
    fi      
done

shopt -s nullglob

EXISTINGFILES=( "$DOTDEPLOY_DIRECTORY/tracked"/* )

for i in "${EXISTINGFILES[@]}";
do
    TRACKED=0
    for j in "${TRACKEDFILES[@]}";
    do
        if [ "$(basename $i)" == "$j" ]
        then
            TRACKED=1
        fi
    done;

    if [ "${TRACKED}" -eq 0 ]
    then
        restoreOriginal $i
    fi
done
