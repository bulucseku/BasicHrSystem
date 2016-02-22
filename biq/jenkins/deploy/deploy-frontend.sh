#!/bin/bash
# Deploy application frontend to proxy server.

SSH_AUTH="$JENKINS_HOME/.ssh/proxy_push"
RSYNC_LOG="$JENKINS_HOME/log/rsync/rsync-$BUILD_TAG.log"

if [ -n "$CLIENT_SRC" ] && [ -n "$CLIENT_DEST" ]; then
  /usr/bin/rsync -av --delete --log-file="$RSYNC_LOG" \
    -e "ssh -carcfour -i $SSH_AUTH" \
    "$CLIENT_SRC" "$CLIENT_DEST"
fi
