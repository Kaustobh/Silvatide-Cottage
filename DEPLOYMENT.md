# Deployment Guide for GitHub Pages

This project is pre-configured to be deployed seamlessly to GitHub Pages. All absolute asset paths have been converted to relative paths using `import.meta.env.BASE_URL` to ensure they resolve correctly on your GitHub subpath (`/Silvatide-Cottage`).

## Steps to Activate GitHub Pages

Follow these exact steps to get your site live on GitHub Pages:

### 1. Push Your Code to GitHub
Ensure all your files (including `astro.config.mjs` and `public/.nojekyll`) are committed and pushed to the `main` branch of your repository. *(See chat for the exact terminal commands to do this).*

### 2. Configure GitHub Actions (Recommended for Astro)
By default, Astro projects use GitHub Actions to build and deploy to GitHub Pages. 

1. Go to your repository on GitHub.
2. Click on the **Settings** tab.
3. In the left sidebar, click on **Pages** (under "Code and automation").
4. Under the **Build and deployment** section, look at the **Source** dropdown.
5. Change the source from "Deploy from a branch" to **GitHub Actions**.
6. GitHub will usually suggest an "Astro" workflow automatically. If it does, click **Configure** on the Astro workflow and then click **Commit changes** to save the workflow file (`.github/workflows/deploy.yml`).

Once committed, GitHub Actions will automatically start building your site. You can monitor the progress in the **Actions** tab.

### 3. Verify the Deployment
Once the GitHub Action completes successfully (turns green), your site will be live!

Go to: **[https://Kaustobh.github.io/Silvatide-Cottage/](https://Kaustobh.github.io/Silvatide-Cottage/)**

> **Note:** The `astro.config.mjs` file already has `site: 'https://Kaustobh.github.io'` and `base: '/Silvatide-Cottage'` correctly configured, which handles the internal routing for the subpath! The `public/.nojekyll` file also ensures GitHub Pages doesn't ignore files starting with underscores (like `_astro/`).
