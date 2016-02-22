#!/usr/bin/env bash
#
# Use steal to build frontend code

set -o errexit
set -o nounset

source "${BASH_SOURCE%/*/*}/utils.sh"

usage()
{
  echo "usage: $(get_script_name) frontend_dir steal_dir"
}

frontend_dir="$1"
steal_dir="$2"

check_args frontend_dir steal_dir
check_commands perl

cp -r "$steal_dir" "$frontend_dir/steal"

pushd "$frontend_dir"
  chmod +x steal/js
  steal/js steal/buildjs main.js

  mv production.css styles/production.css

  perl -0777 -pi -e 's@<!-- STEALJS START -->.*<!-- STEALJS END -->@<script type="text/javascript" src="steal/steal.production.js?//production.js"></script>@sg' default.htm
  perl -0777 -pi -e 's@<!-- APPLICATION CSS START -->.*<!-- APPLICATION CSS END -->@<link rel="stylesheet" type="text/css" href="styles/production.css" />@sg' default.htm
popd
