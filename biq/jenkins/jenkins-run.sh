#!/usr/bin/env bash
#
# build, test, and deploy BIQ application

set -o errexit
set -o nounset

script_dir="${BASH_SOURCE%/*}/shared"
source "$script_dir/utils.sh"

usage()
{
  main_usage "BIQ"
}

main()
{
  parse_main_args "$@"
  check_commands sbt npm grunt git docker aws sed grep awk

  app_name='biq'
  backend_dist='target/universal/stage'
  frontend_dir='public'
  frontend_dist="$frontend_dir/dist"

  test
  build
  deploy
}

test()
{
  run_script "$script_dir/test/test-backend.sh"
}

build()
{
  run_script "$script_dir/build/build-backend.sh"
  run_script "$script_dir/build/build-frontend-grunt.sh" "$frontend_dir"
}

deploy()
{
  run_script "$script_dir/deploy/deploy-docker.sh" -a "$app_name"      \
                                                   -m "$deploy_mode"   \
                                                   -b "$backend_dist"  \
                                                   -f "$frontend_dist"
}

main "$@"
