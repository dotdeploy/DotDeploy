#!/bin/sh

cd $(dirname "$0")

test "$1" = --remove && mode=remove || mode=add

cron_unique_label="# DotDeploy Update Cron"

crontab=crontab.dotdeploy
crontab_bak=$crontab.bak

crontab_exists() {
    crontab -l 2>/dev/null | grep -x "$cron_unique_label" >/dev/null 2>/dev/null
}

# if crontab is executable
if type crontab >/dev/null 2>/dev/null; then
    if test $mode = add; then
        if ! crontab_exists; then
            crontab -l > $crontab_bak
            echo 'Appending to crontab:'
            cat $crontab
            crontab -l 2>/dev/null | { cat; echo; echo $cron_unique_label; cat $crontab; echo; } | crontab -
        else
            echo 'Crontab entry already exists, skipping ...'
            echo
        fi
        echo "To remove previously added crontab entry, run: $0 --remove"
        echo
    elif test $mode = remove; then
        if crontab_exists; then
            echo Removing crontab entry ...
            crontab -l 2>/dev/null | sed -e "\?^$cron_unique_label\$?,/^\$/ d" | crontab -
        else
            echo Crontab entry does not exist, nothing to do.
        fi
    fi
fi
