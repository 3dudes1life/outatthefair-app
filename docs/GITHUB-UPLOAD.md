# Upload V0.1 to GitHub

## New repository

Create a repository named:

`outatthefair-app`

The repository can be public for a free GitHub Pages preview. Keep it private if you do not want the source visible; GitHub Pages availability for private repositories depends on the account plan.

## Upload correctly

After unzipping, open the `outatthefair-app-v0.1` folder and upload everything inside it, including hidden folders such as `.github`.

The GitHub root must show:

- `.github`
- `docs`
- `www`
- `README.md`
- `package.json`
- `capacitor.config.ts`

It should **not** show another nested `outatthefair-app-v0.1` folder.

## Turn on Pages

1. Open the repository.
2. Select **Settings**.
3. Choose **Pages** in the left sidebar.
4. Under **Source**, choose **GitHub Actions**.
5. Return to the **Actions** tab and watch “Deploy OATF App to GitHub Pages.”

No custom domain is required for testing.

## After each content update

Edit `www/assets/data.js`, commit the change, and GitHub Actions will redeploy the preview automatically.
