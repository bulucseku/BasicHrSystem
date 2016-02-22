#!/usr/bin/env bash
#
# Build and deploy docker image for application

set -o errexit
set -o nounset

source "${BASH_SOURCE%/*/*}/utils.sh"

DOCKER_GIT_URL='git@bitbucket.org:sentrana/docker-builds.git'
DOCKER_GIT_DIR='docker'
DOCKER_GIT_BRANCH='master'

usage()
{
  cat <<-EOF
usage: $(get_script_name) -a app_name -m deploy_mode -b backend_dist -f frontend_dist

Build and deploy docker image for application.

arguments:
  -a app_name       name of the app to deploy
  -m deploy_mode    deployment mode: dev, test, staging, or prod
  -b backend_dist   path to backend distribution files
  -f frontend_dist  path to frontend distribution files
EOF
}

main()
{
  app_name=''
  backend_dist=''
  frontend_dist=''
  deploy_mode=''

  parse_args "$@"
  check_commands git docker aws sed grep awk

  version_tag="$(get_version_tag "$deploy_mode")"

  prepare_docker_build "$app_name" "$deploy_mode" "$version_tag" "$backend_dist" "$frontend_dist"
  docker_build_and_push "$app_name" "$deploy_mode" "$version_tag"
  docker_cleanup

  if [[ "$deploy_mode" != "$MODE_PROD" ]]; then
    deploy_to_aws "$app_name" "$deploy_mode" "$version_tag"
  fi
}

parse_args()
{
  while getopts ":a:b:f:m:t:" opt "$@"; do
    case "$opt" in
      a) app_name="$OPTARG" ;;
      b) backend_dist="$OPTARG" ;;
      f) frontend_dist="$OPTARG" ;;
      m) deploy_mode="$OPTARG" ;;
      :) error "option -$OPTARG requires an argument." ;;
      \?) error "unknown option: -$OPTARG" ;;
    esac
  done

  check_args app_name backend_dist frontend_dist deploy_mode
  check_deploy_mode
}

get_version_tag()
{
  local deploy_mode
  deploy_mode="$1"

  case "$deploy_mode" in
    "$MODE_STAGING") get_staging_version_tag ;;
    "$MODE_PROD") get_current_git_tag ;;
    *) echo 'latest' ;;
  esac
}

get_staging_version_tag()
{
  if master_checked_out; then
    get_current_git_tag
  else
    echo 'hotfix'
  fi
}

master_checked_out()
{
  local current_rev master_rev
  current_rev="$(git rev-parse HEAD)"
  master_rev="$(git rev-parse origin/master)"

  [[ "$current_rev" == "$master_rev" ]]
}

get_current_git_tag()
{
  git describe --exact-match --tags HEAD
}

prepare_docker_build()
{
  local app_name deploy_mode version_tag backend_dist frontend_dist
  app_name="$1"
  deploy_mode="$2"
  version_tag="$3"
  backend_dist="$4"
  frontend_dist="$5"

  clone_docker_repo
  replace_docker_template_vars "$app_name" "$deploy_mode" "$version_tag"
  copy_dist_files "$backend_dist" "$frontend_dist"
}

clone_docker_repo()
{
  rm -rf "$DOCKER_GIT_DIR"
  git clone --depth 1 --branch "$DOCKER_GIT_BRANCH" "$DOCKER_GIT_URL" "$DOCKER_GIT_DIR"
}

replace_docker_template_vars()
{
  local app_name deploy_mode version_tag
  app_name="$1"
  deploy_mode="$2"
  version_tag="$3"

  local eb_app_name eb_env_name
  eb_app_name="$(get_eb_app_name "$app_name")"
  eb_env_name="$(get_eb_env_name "$app_name" "$deploy_mode")"

  find "$DOCKER_GIT_DIR" -type f -exec \
    sed -i "s/@@APP_NAME@@/$app_name/g;
            s/@@DEPLOY_MODE@@/$deploy_mode/g;
            s/@@VERSION_TAG@@/$version_tag/g;
            s/@@EB_APP_NAME@@/$eb_app_name/g;
            s/@@EB_ENV_NAME@@/$eb_env_name/g;
            s/@@DOCKER_GIT_BRANCH@@/$DOCKER_GIT_BRANCH/g" {} \;
}

copy_dist_files()
{
  local backend_dist frontend_dist
  backend_dist="$1"
  frontend_dist="$2"

  local target_dir
  target_dir="$DOCKER_GIT_DIR/files/opt/$app_name"

  rm -rf "$target_dir"
  cp -r "$backend_dist" "$target_dir"
  cp -r "$frontend_dist" "$target_dir/public"
}

docker_build_and_push()
{
  local app_name deploy_mode version_tag
  app_name="$1"
  deploy_mode="$2"
  version_tag="$3"

  local docker_tag
  docker_tag="$(get_docker_tag "$app_name" "$deploy_mode" "$version_tag")"

  docker_build "$docker_tag" "$deploy_mode"
  docker_push "$docker_tag"
}

get_docker_tag()
{
  local app_name deploy_mode version_tag
  app_name="$1"
  deploy_mode="$2"
  version_tag="$3"

  local docker_repo
  if [[ "$deploy_mode" == "$MODE_PROD" ]]; then
    docker_repo="sentrana/$app_name"
  else
    docker_repo="sentrana/$app_name-$deploy_mode"
  fi

  echo "$docker_repo:$version_tag"
}

docker_build()
{
  local docker_tag deploy_mode
  docker_tag="$1"
  deploy_mode="$2"

  local no_cache
  no_cache='true'

  if docker_use_cache "$deploy_mode"; then
    no_cache='false'
  fi

  retry 3 docker build --no-cache="$no_cache" \
                       --rm=true \
                       --tag="$docker_tag" \
                       "$DOCKER_GIT_DIR"
}

docker_use_cache()
{
  local deploy_mode
  deploy_mode="$1"

  [[ "$deploy_mode" == "$MODE_DEV" ]]
}

docker_push()
{
  local docker_tag
  docker_tag="$1"

  retry 3 docker push "$docker_tag"
}

docker_cleanup()
{
  # It's okay for this step to fail, since it's usually because another build is using
  # an image we're trying to remove. In that case, the other build will clean up for us.
  set +o errexit
  docker_cleanup_containers
  docker_cleanup_images
  set -o errexit
}

docker_cleanup_containers()
{
  local old_containers
  old_containers=($(docker ps --no-trunc -aq))

  if (( ${#old_containers[@]} > 0 )); then
    docker rm -f "${old_containers[@]}"
  fi
}

docker_cleanup_images()
{
  local old_images
  old_images=($(
    docker images --no-trunc |
    grep '^<none>' |
    awk 'BEGIN { FS="[ \t]+" } { print $3 }'
  ))

  if (( ${#old_images[@]} > 0 )); then
    docker rmi -f "${old_images[@]}"
  fi
}

deploy_to_aws()
{
  local app_name deploy_mode version_tag
  app_name="$1"
  deploy_mode="$2"
  version_tag="$3"

  local eb_env_name eb_version_label
  eb_env_name="$(get_eb_env_name "$app_name" "$deploy_mode")"
  eb_version_label="$(get_eb_version_label "$eb_env_name" "$version_tag")"

  pushd "$DOCKER_GIT_DIR"
  if must_create_application_version "$version_tag"; then
    eb_create_application_version "$eb_version_label"
  else
    eb_update_application_version "$eb_version_label"
  fi
  popd
}

must_create_application_version()
{
  local version_tag
  version_tag="$1"

  [[ "$version_tag" != 'latest' && "$version_tag" != 'hotfix' ]]
}

get_eb_app_name()
{
  local app_name
  app_name="$1"

  case "$app_name" in
    dashboard) echo 'Dashboard' ;;
          biq) echo 'BIQ' ;;
           um) echo 'User Management' ;;
            *) echo "$app_name"
  esac
}

get_eb_env_name()
{
  local app_name deploy_mode
  app_name="$1"
  deploy_mode="$2"

  case "$deploy_mode" in
    staging) echo "$app_name-s" ;;
          *) echo "$app_name-$deploy_mode" ;;
  esac
}

get_eb_version_label()
{
  local eb_env_name version_tag
  eb_env_name="$1"
  version_tag="$2"

  echo "$eb_env_name-$version_tag"
}

eb_create_application_version()
{
  local eb_version_label
  eb_version_label="$1"

  retry 3 eb deploy --label "$eb_version_label"
}

eb_update_application_version()
{
  local eb_version_label
  eb_version_label="$1"

  retry 3 eb deploy --version "$eb_version_label"
}

main "$@"
