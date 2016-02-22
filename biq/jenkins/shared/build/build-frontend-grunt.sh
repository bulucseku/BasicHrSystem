#!/usr/bin/env bash
#
# Use grunt to build frontend code

set -o errexit
set -o nounset

source "${BASH_SOURCE%/*/*}/utils.sh"

usage()
{
  echo "usage: $(get_script_name) frontend_dir"
}

frontend_dir="$1"

check_args frontend_dir
check_commands npm grunt

pushd "$frontend_dir"
  npm install
  grunt
popd
