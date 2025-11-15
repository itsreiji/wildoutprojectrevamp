# Deployment and production checklist

## Environment variables

- `VITE_SUPABASE_URL` – Supabase project endpoint (e.g., `https://qhimllczaejftnuymrsr.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` – Public anonymous key for the `supabaseClient`.
- `VITE_ADMIN_BASE_PATH` – Admin dashboard base path (defaults to `/sadmin`, can be `/admin` for legacy compatibility)
- `VITE_APP_ENV` – Optional environment tag such as `production` or `staging`.

Set these values in Vercel (production + preview) and any other host before building the frontend.

## Supabase auth hooks

- Configure Supabase auth redirect URLs to include `https://<your-domain>{VITE_ADMIN_BASE_PATH}/login` (e.g., `/sadmin/login` or `/admin/login`) and any preview URLs you expect to use for magic links.
- Provision admin accounts by setting `profiles.role = 'admin'` via the Supabase dashboard or SQL.
- RLS policies already allow only `admin` to manage the business tables and expose published content to anonymous/ authenticated users.

## Admin Base Path Configuration

- The admin dashboard is accessible at `{VITE_ADMIN_BASE_PATH}` (defaults to `/sadmin`)
- Set `VITE_ADMIN_BASE_PATH=/admin` to restore legacy `/admin` URLs if needed
- All admin navigation and redirects automatically use the configured base path
- The landing page navigation links automatically point to the correct admin base path

## Verification steps

1. Run `pnpm test` (or `npm test` depending on your scripts) to confirm CI passes.
2. Build the frontend via `pnpm build` and smoke-test the `/`, `/events`, `{VITE_ADMIN_BASE_PATH}/login`, and `{VITE_ADMIN_BASE_PATH}` flows.
3. Log in with an admin account, exercise at least one CRUD action on the dashboard, and confirm the landing page immediately reflects changes and shows published content when signed out.
4. Verify that content import script successfully populates the database: `tsx scripts/importContentFromRepo.ts`
5. Confirm admin navigation works correctly and all links point to the configured admin base path.

