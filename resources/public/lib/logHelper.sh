## various functions for printing colors
##
## all of these functions will print without a newline character 
## at the end, and then subsequently return the terminal back to 
## its default color

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
