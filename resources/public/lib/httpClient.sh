#!/bin/bash

# dotdeploy - urlUtils
# 
# Contains helpful utilities for fetching URLs wget/curl agnostically.
#

# Print an actionable message and return a non-success exit code
function noUrlFetcher {
    echo "Could not find URL fetching library (install wget or curl to proceed)."
    exit 1
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
