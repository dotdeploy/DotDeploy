#!/bin/bash
#
# dotdeploy - Initialization script
# Registers the machine with dotdeploy, and 
DOTDEPLOY_URL='http://localhost:8000/api/'
MACHINE_UUID=$(uuidgen)
DOTDEPLOY_DIRECTORY="$HOME/.dotdeploy"
CLIENT_INSTALL_DIRECTORY="/usr/local/bin"
CLIENT_NAME="dotdeploy"
DEPENDENCY_FILENAMES=("logHelper.sh" "cronHelper.sh" "urlHelper.sh" "poller.sh")

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
        echo "To install dotdeploy, please ensure your computer has either " \
             "wget or curl installed."
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
        logSuccess "[success]"
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

    logInfo "Installing dotdeploy to $DOTDEPLOY_DIRECTORY ... "  
    if [ -d $DOTDEPLOY_DIRECTORY ]
    then
        logError "[error - directory already exists. exiting.]"
        echo
        # todo spthomas call alternative "refresh" script
        exit 1
    fi
    
    mkdir $DOTDEPLOY_DIRECTORY
    mkdir "$DOTDEPLOY_DIRECTORY/lib"
    mkdir "$DOTDEPLOY_DIRECTORY/originals"
    mkdir "$DOTDEPLOY_DIRECTORY/tracked"
    
    logSuccess "[success]"
    echo
    echo

}

##
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

##
function fetchClient {
    $tmpFetchLocation = "$DOTDEPLOY_DIRECTORY/$CLIENT_NAME"
    $targetFilename = "$CLIENT_INSTALL_DIRECTORY/$CLIENT_NAME"
    
    logInfo "Fetching client ... "    
    # fetch the dotdeploy client into the *local* dotdeploy directly
    # then attempt to copy it into /usr/local/bin and 
    fetchUrl "$DOTDEPLOY_URL/lib/$CLIENT_NAME" > $tmpFetchLocation
    chmod +x $tmpFetchLocation
    logSuccess "[ok]"
    echo
    
    if [ -x $targetFilename ]    
    then 
        return 0
    fi

    # attempt to elevate to sudo for one file copy. if not, provide the user
    # a command they can run on their own    
    logInfo "Installing client to $targetFilename. You may be prompted for your password for sudo access."
    sudo cp -f $targetFilename $tmpFetchLocation
    
    if [ $? -eq 0 ]
    then
        logSuccess "dotdeploy successfully installed to $targetFilename"
        echo
    else
        logInfo "There was an error installing dotdeploy to $targetFilename. " \
                "To manually install it, run the following command: " 
        echo
        logBold "sudo cp -f $tmpFetchLocation $targetLocation"
        echo
    fi
}

## with all of the functions defined, run all of the components to initialize
## dotdeploy on this machine
logBold "dotdeploy v0.0 installer"
echo
createDirectoryStructure
registerMachine
fetchDependencies
fetchClient
finishInstall
