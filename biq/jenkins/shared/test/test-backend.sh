#!/usr/bin/env bash
#
# Use sbt to test backend code

set -o errexit
set -o nounset

source "${BASH_SOURCE%/*/*}/utils.sh"

check_commands sbt

sbt clean coverage scalastyle test:scalastyle test
sbt coverageReport
sbt coverageAggregate
