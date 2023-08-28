# Simple Wordpress Site

## Adding a Plugin
All plugins are version-controlled and baked into the image. To add a plugin:
1. Download and upload the plugin to the Google Cloud Bucket specified in `GC_BUCKET_PLUGINS`.
2. Add the version to `config.sh`
3. Add as an environmental variable to `build.sh`
4. Define zip filename in `Dockerfile`
5. Define args in `gcloud` and `wordpress` builds in Dockerfile
6. Add to `gsutil cp` command in `gcloud` build
7. Copy, unzip, and rm zip in `wordpress` build
8. Rebuild the image
