#!/bin/bash

# dotdeploy - httpClient
# 
# Contains functions for fetching URLs to stdout, performing http requests
# and parsing responses
#

# Print an actionable message and return a non-success exit code
function noUrlFetcher {
    echo "Could not find URL fetching library (install wget or curl to proceed)."
    exit 1
}

# $1: URL to patch to
# $2: filename to post
# $3: file id to patch
# $4: revision id of previous file
# $5: sha256 of new file
function patchFile {
    FILE_ID_HEADER="X-File-Id: $2"
    REVISION_ID_HEADER="X-Previous-Revision: $3"
    SHA256_HEADER="X-Sha256: $4"    

    if [ -n $(which curl) ]
    then
        curl \ 
            -sS \
            -H "$FILE_ID_HEADER" \
            -H "$SHA256_HEADER" \
            -H "$REVISION_ID_HEADER" \
            -X PATCH \
            -d @$2 \
            $1
    elif [ -n $(which wget) ]
    then
        # decide whether we want to support a workaround for wget
        echo "fatal error - wget cannot patch"
        exit 1
    else
        noUrlFetcher    
    fi
}

# $1: URL to post to
# $2: filename to post
# $3: filename header (may be remarkably similar to $2)
# $4: sha256 of file
function postFile {
    FILENAME_HEADER="X-Path: $3"
    SHA256_HEADER="X-Sha256: $4"

    if [ -n $(which curl) ]
    then
        curl -i -sS -H "$FILENAME_HEADER" -H "$SHA256_HEADER" -X POST -d @$2 $1
    elif [ -n $(which wget) ]
    then
        wget \
            --server-response \ 
            -O - \
            -q \
            --post-file=$2 \
            --header="$FILENAME_HEADER" \
            --header="$SHA256_HEADER" \ 
            $1 \
        2>&1 | sed -e 's/^ *//g' 
    else
        noUrlFetcher    
    fi
}

# Fetches a URL to stdout using the first available of curl, wget.
#
# $1: the url to fetch
function fetchUrl {
    
    if [ -n $(which curl) ]
    then
        curl -sS $1
    elif [ -n $(which wget) ]
    then
        wget -q -O - $1
    else
        noUrlFetcher    
    fi

}

# Performs a head request on a URL, outputs headers to stdout.
#
# $1: the url to fetch
function headUrl { 
    if [ -n $(which curl) ]
    then 
        curl -sS -I $1
    elif [ -n $(which wget) ]
    then
        wget -S --spider -O /dev/null -q $1 2>&1 | sed -e 's/^ *//g'
    else
        noUrlFetcher
    fi
}
