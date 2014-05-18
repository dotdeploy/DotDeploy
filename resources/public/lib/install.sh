#!/bin/bash
#
# dotdeploy - Initialization script
#
# Registers the machine with dotdeploy, gathers dependencies, creates a 
# skeleton directory structure, and installs the cron. 
#
DOTDEPLOY_URL='http://localhost:8000/api/'
MACHINE_UUID=$(uuidgen)
DOTDEPLOY_DIRECTORY="$HOME/.dotdeploy"
CLIENT_INSTALL_DIRECTORY="/usr/local/bin"
CLIENT_NAME="dotdeploy"
DEPENDENCY_FILENAMES=("logHelper.sh" "cronHelper.sh" "urlHelper.sh" "poller.sh" "pusher.sh")
DEBUG=true

# Fetches a URL to stdout using the first available of curl, wget.
#
# Copied functions from urlUtils, logUtils to support initial bootstrapping of dotdeploy. 
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
        echo "To install dotdeploy, please ensure your computer has either wget or curl installed."
        exit 1 
    fi
}

## various functions for printing colors
function logInfo {
    echo -n -e "\E[1;36m$1"
    tput sgr0
}

function logSuccess {
    echo -n -e "\E[1;32m$1"
    tput sgr0
}

function logError {
    echo -n -e "\E[1;31m$1"
    tput sgr0
}
    
function logBold {
    echo -n -e "\E[1;1m$1"
    tput sgr0
}

## register the machine with dotdeploy
function registerMachine {
    logInfo "Registering this computer on dotdeploy ... "
    FETCH_RESULT=$(fetchUrl "$DOTDEPLOY_URL/machine/index.html")
    
    if [[ $FETCH_RESULT = "true" ]]
    then
        logSuccess "[ok]"
    else
        logError "[error - see output below]"
        echo
        echo $FETCH_RESULT
        exit 1
    fi
    echo
    
    echo
    logInfo "This machine will be known on dotdeploy as "
    logBold $MACHINE_UUID
    echo
    echo
}

## create dotdeploy directory structure
function createDirectoryStructure {
    logInfo "Creating directory $DOTDEPLOY_DIRECTORY ... "  
    
    if [ -d $DOTDEPLOY_DIRECTORY ] && [[ $DEBUG == false ]]
    then
        logError "[error - directory already exists. exiting.]"
        echo
        # todo spthomas call alternative "refresh" script
        exit 1
    fi
    
    mkdir -p $DOTDEPLOY_DIRECTORY
    mkdir -p "$DOTDEPLOY_DIRECTORY/lib"
    mkdir -p "$DOTDEPLOY_DIRECTORY/originals"
    mkdir -p "$DOTDEPLOY_DIRECTORY/tracked"
    
    logSuccess "[ok]"
    echo
    echo
}

## grab shell scripts that the client depends on  
function fetchDependencies {
    logInfo "Fetching dependencies ... "
    echo
    for fileName in "${DEPENDENCY_FILENAMES[@]}"
    do
        echo -n "    fetching $fileName ... " 
        fetchUrl "$DOTDEPLOY_URL/lib/$fileName" > "$DOTDEPLOY_DIRECTORY/lib/$fileName"  
        logSuccess " [ok]"
        echo 
    done     
    echo
}

## fetches the client and attempts to install it into the user's path
function fetchClient {
    tmpFetchLocation="$DOTDEPLOY_DIRECTORY/$CLIENT_NAME"
    targetFilename="$CLIENT_INSTALL_DIRECTORY/$CLIENT_NAME"

    logInfo "Fetching client ... "    
    # fetch the dotdeploy client into the *local* dotdeploy directly
    # then attempt to copy it into /usr/local/bin and 
    fetchUrl "$DOTDEPLOY_URL/lib/$CLIENT_NAME" > $tmpFetchLocation
    chmod +x $tmpFetchLocation
    logSuccess "[ok]"
    echo

    # attempt to elevate to sudo for one file copy. if not, provide the user
    # a command they can run on their own    
    echo
    logInfo "Installing client to $targetFilename. You may be prompted for your password for sudo access."
    echo
    sudo cp -f $tmpFetchLocation $targetFilename
    
    if [ $? -eq 0 ]
    then
        echo
        logSuccess "dotdeploy successfully installed to $targetFilename"
        echo
     
        rm -f $tmpFetchLocation # cleanup 
    else
        # todo spencer rather than display this message here, return a non-zero
        # code and then pass that into the finishInstall function with the note
        # the user needs to run the command before dotdeploy will work. 
        echo
        logError "There was an error installing dotdeploy to $targetFilename. To manually install it, run the following command: " 
        echo
        logBold "    $ sudo cp -f $tmpFetchLocation $targetFilename"
        echo
    fi
}

## with dependencies retrieved, setup a cron
function addCronAndPull {
    echo
    logInfo "Installing cron ... " 
    # todo chris
    logSuccess "[ok]"
    echo
}

## success, present the user with a slightly helpful message
function finishInstall {
    echo
    logSuccess "dotdeploy successfully installed!"
    echo
    logBold "To get started, run 'dotdeploy help'"
    echo
}

## with all of the functions defined, run all of the components to initialize
## dotdeploy on this machine
logBold "dotdeploy v0.1 installer"
echo
createDirectoryStructure
registerMachine
fetchDependencies
fetchClient
addCronAndPull
finishInstall
