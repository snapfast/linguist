# Linguist project

[![Netlify Status](https://api.netlify.com/api/v1/badges/9590a3ff-d4dd-4999-972f-b4a102c59896/deploy-status)](https://app.netlify.com/sites/tiny-kangaroo-50ae23/deploys)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Troubleshooting Deployment

If you encounter a `Permission denied (publickey)` error during Netlify build, it is likely because Netlify is attempting to clone the repository via SSH, but it does not have the necessary SSH keys configured.

### Recommended Fixes:
1.  **Switch to HTTPS**: In your Netlify site settings, ensure the repository is linked via HTTPS (`https://github.com/snapfast/linguist.git`) instead of SSH (`git@github.com:snapfast/linguist.git`).
2.  **Add a Deploy Key**: If the repository is private, you need to add the SSH public key provided by Netlify as a "Deploy Key" in your GitHub repository settings.
3.  **Check Repository Permissions**: Ensure that the Netlify GitHub App (if used) has access to the repository.
