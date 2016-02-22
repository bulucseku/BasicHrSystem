#!/bin/bash
while read line ; do
    printf "%s\t%s\n" "$(date '+%F %T')" "$line"
done
