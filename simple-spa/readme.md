# Simple Single Page Application (SPA)

This template is for a [cork-app-utils](https://github.com/UCDavisLibrary/cork-app-utils) SPA with an Express server without any dependencies on other repositories.

It uses 
 - ucdlib-theme for SPA themed elements
 - Postgres for a database
 - Google Cloud for devops procedures such as building, backup, and data initialization
 - OIDC for auth

## Setup

To use this template when starting your own application:
1. Clone/checkout this repo.
2. `cp -R ./simple-spa path/to/your/app`
3. Search for `TODO:` in the project, and follow corresponding instructions
4. Clean up your repository... replace this readme, delete todos, etc.


## Directory Structure

```yaml
deploy:
  desc: Scripts for building/deploying app on your local machine and/or a server
  items:
    - cmds: Deploy/devops scripts
    - db-entrypoint: SQL files that run on container start if db is empty
    - templates: Handlebar-style templates of deployment files
    - utils: Deployment utilities, such as data init and backup

src:
  desc: Application source code
  items:
    - api:
        desc: Server-side source code. JSON data endpoints to be consumed by cork-app-utils services.
    - client:
        desc: Browser-side source code
        items:
          - build: Config files for webpack assets build
          - public: Static asset directory. Everything here will be served. index.html is where the SPA code will be loaded
          - scss: SCSS source code. By default, loads ucdlib theme.
          - js: JS source code - Lit pages and components.
    - lib:
        desc: Code imported and used by the browser or server endpoints
        items:
          - cork: cork-app-utils models, services, and stores.
          - db-models: Models for interacting with database. In general, each model will correspond with a table.
          - utils: Any shared code.
    - index.js: Entry point for application.
```
