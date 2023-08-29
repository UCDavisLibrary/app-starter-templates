# Simple Wordpress Site

This is a template for a basic Wordpress site that uses:

- The UC Davis theme
- Google Cloud for devops procedures such as building, backup, and data initialization
- OIDC (keycloak) for auth

## Setup

To use this template when starting your own application:
1. Clone/checkout this repo.
2. `cp -R ./simple-wordpress path/to/your/app`
3. Search for `TODO:` in the project, and follow corresponding instructions
4. Follow the Local Development section below to get your app up and running.
5. Clean up your repository... replace this readme, delete todos, etc.
6. When setting your production env file, make sure to include the [COMPOSE_PROJECT_NAME](https://docs.docker.com/compose/environment-variables/envvars/#compose_project_name) variable. Otherwise, your services will have generic names like `deploy-db-1`. You could also change the name of the deploy directory.

## Local Development

To get the app up and running on your machine:

1. `cd deploy`
2. Make sure `GC_READER_KEY_SECRET` has read access to `GC_BUCKET_PLUGINS`, and that you have access to view the secret.
3. `./cmds/init-local-dev.sh`
4. `./cmds/build-local-dev.sh`
5. `./cmds/generate-deployment-files.sh`
6. A directory called `$APP_SLUG-local-dev` will have been created.
7. Enter it, and run `docker compose up`

If you are using the init/backup utilities, you will need make sure that you have access to the service account secrets. `gc-reader-key.json` and `gc-writer-key.json` should have content for the init and backup containers, respectively. Keys are fetced in `init-local-dev`, but they also have their own dedicated scripts.

## Plugins

Plugins are your opportunity to introduce custom behavior to a Wordpress site.

## Adding a Third Party Plugin
All plugins should be version-controlled and baked into the image. You can't just go to the plugins admin page and hit "download", since this functionality is disabled by default in this project. To add a plugin:
1. Download and upload the plugin to the Google Cloud Bucket specified in `GC_BUCKET_PLUGINS`.
2. Add the version to `config.sh`
3. Add as an environmental variable to `build.sh`
4. Define zip filename in `Dockerfile`
5. Define args in `gcloud` and `wordpress` builds in Dockerfile
6. Add to `gsutil cp` command in `gcloud` build
7. Copy, unzip, and rm zip in `wordpress` build
8. Rebuild the image
9. You will still need to go to the Plugins admin page and hit "Activate" or use the wp-cli.

## Adding a Custom Plugin
1. Create the plugin in `src/plugins`
2. For local development, add a corresponding volume to the wordpress service in `templates/local-dev.yaml` and then run `./cmds/generate-deployment-files.sh`
3. Add the plugin to your image by using the `COPY` command in the main Dockerfile
4. You will still need to go to the Plugins admin page and hit "Activate" or use the wp-cli.
