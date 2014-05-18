#!/bin/bash

# dotdeploy - fileMetaDataStore
# 
# Handles the retrieving a file's metadata
#

DOTDEPLOY_DIRECTORY=$HOME/.dotdeploy
FILE_STORE_DIRECTORY=$DOTDEPLOY_DIRECTORY/tracked
META_SUFFIX=".meta"

# Writes information about a given file to stdout
# 
# $0: path to file
function getMetadataForPath {
    relativePath=$(echo "~$1" | sed "s|$HOME||g")
    matchMetaFile=$(grep --with-filename -e "=$relativePath$" $FILE_STORE_DIRECTORY/*.meta)
    
    # did grep find anything?
    if [ $? -eq 0 ]
    then
        # /home/username/.dotdeploy/tracked/{fileId}.meta -> {fileId}
        metaFile=$(echo $matchMetaFile | cut -d: -f1)
        
        if [ -n $metaFile ]
        then
            cat $metaFile
        else
            return 1
        fi
    else
        return 1
    fi
}

# $1: fileId
function getMetadataForId {
    cat $FILE_STORE_DIRECTORY/$1.meta
}

function getSha5SumForId {
    getMetadataForId $1 | grep sha5sum | cut -d= -f2
}

function getPathForId {
    getMetadataForPath $1 | grep path | cut -d= -f2
}

function getRevisionForId {
    getMetadataForId $1 | grep revision | cut -d= -f2
}

function getRevisionForPath {
    getMetadataForPath $1 | grep revision | cut -d= -f2
}

function getSha5SumForPath {
    getMetadataForPath $1 | grep sha5sum | cut -d= -f2
}

function sha5SumFileId {
    shasum -a256 $FILE_STORE_DIRECTORY/$1 | cut -d ' ' -f1
}

# @1: fileId
# @2: incoming revision
function revisionsDiffer {
    fileId=$1
    incomingRevision=$2

    currentRevision=$(getRevisionForId $fileId)
    
    # can this whole if block be condensed to just the [[...]] on the next line?
    if [[ $currentRevision == $incomingRevision ]]
    then
        false
    else
        true
    fi
}

# @1: fileId
function localEditsExist {
    currentFileSha5Sum=$(sha5SumFileId $1)
    previousSha5Sum=$(getSha5SumForId $1)
    
    if [[ $currentFileSha5Sum == $previousSha5Sum ]]
    then
        false
    else
        true
    fi
}
