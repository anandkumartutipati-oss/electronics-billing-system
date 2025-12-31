---
description: How to deploy the Monorepo to Vercel
---

# Deploying to Vercel

The project is now configured for a "Monorepo" style deployment on Vercel.
- **Frontend**: Served as static assets.
- **Backend**: Served as Serverless Functions under `/api`.

## Prerequisites
1.  A [Vercel Account](https://vercel.com).
2.  Your code pushed to a Git repository (GitHub/GitLab/Bitbucket).

## Steps

1.  **Import Project in Vercel**
    *   Go to your Vercel Dashboard -> "Add New Project".
    *   Select your `electronics-billing-system` repository.

2.  **Configure Project Settings** (Crucial Step)
    *   **Framework Preset**: Vercel should detect "Other" or "Vite". If it asks, "Vite" for frontend is fine, but since we have a root `vercel.json`, `Other` is safest if "Auto" fails. *Usually, Vercel detects the root config automatically.*
    *   **Root Directory**: Leave this as `./` (current directory). **DO NOT** select `frontend` or `backend` folders. We are deploying the *root*.

3.  **Environment Variables**
    *   Expand the **Environment Variables** section.
    *   You MUST add the variables from your `backend/.env` file here.
    *   **Required Keys**:
        *   `MONGODB_URI`: Your MongoDB Connection String.
        *   `JWT_SECRET`: Your secret key.
        *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (if using image uploads).
        *   `NODE_ENV`: Set to `production`.

4.  **Deploy**
    *   Click **Deploy**.
    *   Vercel will build the frontend and set up the backend functions.

5.  **Verify**
    *   Once live, open the URL.
    *   The frontend should load.
    *   Try logging in. The request will go to `/api/auth/login`, which Vercel will route to your backend function.

## Troubleshooting
*   **404 on API**: Check `vercel.json` routes. Ensure `backend/api/index.js` exists.
*   **Database Error**: Check `MONGODB_URI` in Vercel Settings. Whitelist allow access from anywhere (0.0.0.0/0) in MongoDB Atlas Network Access, as Vercel IPs check change.
