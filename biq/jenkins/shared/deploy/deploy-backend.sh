#!/usr/bin/env bash
# Deploy application backend locally.

set -o errexit
set -o nounset

SHORT_NAME="$(expr "$JOB_NAME" : '.*/\(.*\)')"
PID_FILE="$JENKINS_HOME/var/run/$SHORT_NAME.pid"

env

if [ -n "$EXECUTABLE" ] && [ -n "$HTTP_PORT" ]; then
  # Terminate existing process if there is one
  if [ -s "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    while kill -0 "$PID" >/dev/null 2>&1; do
      kill -TERM "$PID" >/dev/null 2>&1
      sleep 1
    done
    # Ensure PID file is removed after process terminates
    rm -f "$PID_FILE"
  fi
  # Run the application with configured port and PID file
  "$EXECUTABLE" -Dpidfile.path="$PID_FILE" -Dhttp.port="$HTTP_PORT" &

  # Wait to see if application is still running after a minute
  PID="$!"
  sleep 60
  kill -0 "$PID"
fi
