# Deploying WildOut! to Vercel

This project is configured as a Single Page Application (SPA) using Vite and React. It is ready for deployment on Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account.
- A [Supabase](https://supabase.com) project (for the backend).

## Deployment Steps

1.  **Push to GitHub/GitLab/Bitbucket**: Ensure your latest code is pushed to your repository.
2.  **Import Project in Vercel**:
    - Go to your Vercel Dashboard.
    - Click **"Add New..."** -> **"Project"**.
    - Import your `wildoutprojectrevamp` repository.

3.  **Configure Project Settings**:
    - **Framework Preset**: Vercel should automatically detect **Vite**. If not, select it manually.
    - **Root Directory**: `./` (default)
    - **Build Command**: `pnpm build` (or `vite build`) - Vercel usually detects `pnpm build` from package.json.
    - **Output Directory**: `dist` (default for Vite).
    - **Install Command**: `pnpm install` (Vercel detects pnpm lockfile).

4.  **Environment Variables**:
    You **must** add the following environment variables in the Vercel project settings (under **Settings** > **Environment Variables**). Copy these values from your local `.env` or Supabase dashboard.

    | Variable Name | Description |
    | :--- | :--- |
    | `VITE_SUPABASE_URL` | Your Supabase Project URL (e.g., `https://xyz.supabase.co`) |
    | `VITE_SUPABASE_ANON_KEY` | Your Supabase Project API Public Anon Key |

    *Note: Do NOT add service role keys to the frontend deployment.*

5.  **Deploy**: Click **Deploy**.

## Post-Deployment Verification

- **Routing**: Test navigating to a sub-route (e.g., `/admin`) and refreshing the page. It should not return a 404 error (handled by `vercel.json`).
- **Supabase Connection**: Verify that data loads correctly on the dashboard.

## Troubleshooting

- **404 on Refresh**: Ensure `vercel.json` exists in the root with the rewrite rules.
- **Build Fails**: Check the Build Logs in Vercel. Ensure `pnpm-lock.yaml` is up to date.
