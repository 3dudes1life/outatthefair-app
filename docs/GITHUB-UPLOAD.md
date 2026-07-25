# Upload OATF App V0.3 to GitHub

The existing repository already contains the working hidden Pages workflow.

1. Download and unzip the **V0.3 GitHub upload package**.
2. Open `3dudes1life/outatthefair-app` in GitHub.
3. Choose **Add file → Upload files**.
4. Drag everything inside the unzipped package into the repository.
5. Allow GitHub to replace matching files.
6. Commit directly to `main`.

The upload package intentionally excludes `.github`, so the existing `deploy-pages.yml` workflow remains untouched and publishes the updated `www` folder automatically.
