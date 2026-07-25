# GitHub Upload — V0.4

Use the `outatthefair-app-v0.4-github-upload.zip` package. It intentionally excludes `.github`, so the working Pages workflow remains untouched.

## One cleanup before uploading

V0.3 used `capacitor.config.ts`. V0.4 replaces it with `capacitor.config.json`. In GitHub, delete `capacitor.config.ts` once so future repo downloads do not keep the old broken config.

1. Open `capacitor.config.ts` in the repository.
2. Click the trash icon.
3. Commit the deletion directly to `main`.

## Upload V0.4

1. Unzip the upload package.
2. Open the folder.
3. In the `outatthefair-app` repository choose **Add file → Upload files**.
4. Drag everything inside the folder into GitHub.
5. Allow matching files to be replaced and commit directly to `main`.

Do not recreate or replace `.github/workflows/deploy-pages.yml`; the existing workflow remains in place.
