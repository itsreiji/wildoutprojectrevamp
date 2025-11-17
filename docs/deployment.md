# Deployment and production checklist

## Environment variables

- `VITE_SUPABASE_URL` – Supabase project endpoint (e.g., `https://qhimllczaejftnuymrsr.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` – Public anonymous key for the `supabaseClient`.
- `VITE_ADMIN_BASE_PATH` – Admin dashboard base path (defaults to `/sadmin`, can be `/admin` for legacy compatibility)
- `VITE_APP_ENV` – Optional environment tag such as `production` or `staging`.
- `VITE_USE_DUMMY_DATA` – Use dummy data instead of Supabase (default: `false`)

Set these values in Vercel (production + preview) and any other host before building the frontend.

## Supabase auth hooks

- Configure Supabase auth redirect URLs to include `https://<your-domain>/login`, `https://<your-domain>/register`, and `https://<your-domain>{VITE_ADMIN_BASE_PATH}/login` (e.g., `/sadmin/login` or `/admin/login`)
- User registration is available at `/register` - new users automatically get 'user' role
- Provision admin accounts with appropriate roles:
  - `admin`: Full access to all admin sections, can manage users
  - `editor`: Can view/edit most content sections, limited delete permissions
  - `user`: Default role for new registrations, basic access
- Set roles via Supabase dashboard: `profiles.role = 'admin|editor|user'`
- RLS policies control access based on user roles and section permissions
- Admin sections and permissions are automatically seeded during content import

## Admin Base Path Configuration

- The admin dashboard is accessible at `{VITE_ADMIN_BASE_PATH}` (defaults to `/sadmin`)
- Set `VITE_ADMIN_BASE_PATH=/admin` to restore legacy `/admin` URLs if needed
- All admin navigation and redirects automatically use the configured base path
- The landing page navigation links automatically point to the correct admin base path

## Supabase as Source of Truth

The application uses **Supabase as the single source of truth** for all dynamic content:

### Content Synchronization

- **Landing Page**: All content (hero, about, events, team, partners, gallery) is fetched from Supabase
- **Admin Dashboard**: All CRUD operations write directly to Supabase tables
- **Real-time Sync**: Changes in admin dashboard immediately reflect on the landing page
- **No Dummy Data by Default**: Set `VITE_USE_DUMMY_DATA=true` only for testing/development

### Initial Content Import

On first deployment or when Supabase tables are empty:

1. **Automatic Import**: The `importContentFromRepo.ts` script checks if tables are empty
2. **Repository Data**: If empty, it seeds content from repository constants (`INITIAL_HERO`, `INITIAL_ABOUT`, `INITIAL_SETTINGS`)
3. **One-time Bootstrap**: After initial import, Supabase becomes authoritative - repo data is only used as fallback
4. **Manual Import**: Run `tsx scripts/importContentFromRepo.ts` to manually import/update content

### Content Management Workflow

1. **Admin Edits**: Admin users edit content via dashboard (`/sadmin/*`)
2. **Supabase Storage**: All changes are saved to Supabase tables
3. **Landing Page**: Public landing page fetches from same Supabase tables
4. **Instant Updates**: No refresh needed - changes appear immediately

### Static vs Dynamic Assets

- **Dynamic Content** (stored in Supabase):
  - Hero section (title, subtitle, CTA)
  - About section (story, features)
  - Site settings (contact info, social links)
  - Events, team members, partners, gallery items

- **Static Assets** (remain in repository):
  - Navigation copy
  - Legal text (Terms, Privacy Policy)
  - Build assets (images, fonts, CSS)
  - Component code

### Future Deployments

- **Content Persists**: All content remains in Supabase across deployments
- **No Data Loss**: Repository changes don't overwrite Supabase content
- **Manual Sync**: Use `FORCE_IMPORT=true tsx scripts/importContentFromRepo.ts` to force update from repo (use with caution)

## Verification steps

1. Run `pnpm test` (or `npm test` depending on your scripts) to confirm CI passes.
2. Build the frontend via `pnpm build` and smoke-test the `/`, `/events`, `/register`, `/login`, `{VITE_ADMIN_BASE_PATH}/login`, and `{VITE_ADMIN_BASE_PATH}` flows.
3. Log in with an admin account, exercise at least one CRUD action on the dashboard, and confirm the landing page immediately reflects changes and shows published content when signed out.
4. Verify that content import script successfully populates the database: `tsx scripts/importContentFromRepo.ts`
5. Confirm admin navigation works correctly and all links point to the configured admin base path.
6. Test RBAC by creating users with different roles (`editor`, `user`) and verify they can only access permitted sections.
7. Confirm dashboard overview displays live statistics from Supabase data sources.
8. **Test Content Sync**: Edit hero/about/settings in admin, verify changes appear on landing page without refresh.
9. **Test User Management**: As admin, promote a user from 'user' to 'editor' or 'admin' in Settings → User Management.
10. **Verify Default Roles**: Register a new user at `/register`, confirm they get 'user' role automatically.

