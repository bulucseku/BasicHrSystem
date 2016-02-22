#!/usr/bin/env bash
#
# Helper functions for Jenkins scripts

set -o errexit
set -o nounset

MODE_DEV='dev'
MODE_TEST='test'
MODE_STAGING='staging'
MODE_PROD='prod'

main_usage()
{
  local app_name="$1"
  local script_name
  script_name="$(get_script_name)"
  cat <<-EOF
usage: ${script_name} -m deploy_mode

Build, test, and deploy ${app_name} application.

arguments:
  -m deploy_mode  deployment mode: dev, test, staging, or prod
EOF
}

get_script_name()
{
  echo "${0##*/}"
}

error()
{
  echo "Error: $*" >&2
  if [[ "$(type -t usage)" == "function" ]]; then
    usage
  fi
  return 1
}

retry()
{
  local n=0
  local max=$1
  local cmd=(${@:2})

  set +o errexit
  while ((n < max)); do
    if ((n > 0)); then
      local delay=$((n * 30))
      echo "Attempt $n/$max failed. Waiting ${delay}s to retry..."
      sleep $delay
    fi
    "${cmd[@]}" && return
    ((++n))
  done
  set -o errexit

  error "Command failed after $n attempts"
}

parse_main_args()
{
  deploy_mode=''

  while getopts ":m:t:" opt "$@"; do
    case "$opt" in
      m) deploy_mode="$OPTARG" ;;
      :) error "option -$OPTARG requires an argument." ;;
      \?) error "unknown option: -$OPTARG" ;;
    esac
  done

  check_args deploy_mode
  check_deploy_mode
}

check_args()
{
  local required_args=($@)
  local empty_counter=0

  for arg in "${required_args[@]}"; do
    local value="${!arg}"
    if [[ -z "$value" ]]; then
      echo "Argument '$arg' must not be empty"
      ((++empty_counter))
    fi
  done

  if ((empty_counter > 0)); then
    error "$empty_counter required arguments are empty, aborting"
  fi
}

check_deploy_mode()
{
  case "$deploy_mode" in
    "$MODE_DEV"|"$MODE_TEST"|"$MODE_STAGING"|"$MODE_PROD") true ;;
    *) error "unknown deploy mode: $deploy_mode" ;;
  esac
}

check_commands()
{
  local required_commands=($@)
  local missing_counter=0

  for cmd in "${required_commands[@]}"; do
    if ! hash "$cmd" >/dev/null 2>&1; then
      echo "Command not found in PATH: $cmd"
      ((++missing_counter))
    fi
  done

  if ((missing_counter > 0)); then
    error "$missing_counter commands are missing in PATH, aborting"
  fi
}

run_script()
{
  opts="$-"
  bash "-$opts" "$@"
}
