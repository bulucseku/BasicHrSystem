#!/usr/bin/env bash
#
# Use sbt to build and stage backend code

set -o errexit
set -o nounset

source "${BASH_SOURCE%/*/*}/utils.sh"

check_commands sbt

sbt stage
