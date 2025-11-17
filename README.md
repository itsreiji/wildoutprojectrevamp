
  # WildOut! Landing Page and Dashboard

  This is a code bundle for WildOut! Landing Page and Dashboard. The original project is available at https://www.figma.com/design/gdU03sBHxmwEdKKZb5eJHW/WildOut--Landing-Page-and-Dashboard.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Features

  ### Landing Page ↔ Admin Dashboard Sync
  The application features real-time synchronization between the public landing page and admin dashboard:

  - **Admin Content Management**: Edit hero section, about content, and site settings directly in the admin dashboard
  - **Real-time Sync**: Changes made in admin immediately appear on the public landing page without refresh
  - **Supabase Source of Truth**: All dynamic content (events, team, partners, gallery) and static content (hero, about, settings) is stored and served from Supabase
  - **Import Tool**: Repository data is automatically seeded into Supabase on first run, establishing Supabase as the canonical data source

  ### Authentication & User Management
  Complete user authentication system with role-based access:

  - **User Registration**: New users can register at `/register` with automatic 'user' role assignment
  - **Admin Login**: Admins access dashboard at `/login` or `/sadmin/login`
  - **Role Management**: User roles stored in Supabase profiles (admin/editor/user)
  - **Default Roles**: New registrations automatically get 'user' role; admins can promote users
  - **Secure Access**: Admin routes protected with Supabase session validation

  ### Supabase-Driven Admin Menu & RBAC
  The admin interface is now fully driven by Supabase data with role-based access control:

  - **Dynamic Admin Menu**: Sidebar navigation items are loaded from Supabase `admin_sections` table
  - **Role-Based Permissions**: User roles (admin/editor/viewer) control access to different admin sections
  - **Section-Level Access Control**: Fine-grained permissions for viewing, editing, publishing, and deleting content
  - **Permission Inheritance**: Role permissions apply by default, with optional user-specific overrides
  - **Content Synchronization**: Dashboard overview and site config reflect live Supabase data

  ### Configurable Admin Base Path
  - **Default**: Admin dashboard accessible at `/sadmin` (recommended)
  - **Legacy**: Set `VITE_ADMIN_BASE_PATH=/admin` to restore old `/admin` URLs
  - **Dynamic Navigation**: All admin links automatically use the configured base path

  ## Environment Variables

  ```bash
  # Required
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key

  # Optional
  VITE_ADMIN_BASE_PATH=/sadmin  # Default: /sadmin, can be /admin for legacy
  VITE_USE_DUMMY_DATA=false    # Default: false (true in development)
  ```

  ## Database Setup

   1. **Apply Migrations**: The Supabase schema includes tables for content, auth, and RBAC:
      - Content tables: `hero_content`, `about_content`, `site_settings`, `events`, `partners`, `team_members`, `gallery_items`
      - Auth tables: `profiles` (extends `auth.users` with roles)
      - Admin system: `admin_sections`, `section_content`, `role_permissions`, `user_permissions`
   2. **Import Content**: Content tables are automatically seeded on first run from repository data
   3. **User Roles**: Configure user roles in `profiles.role`:
      - `admin`: Full access to all sections, can manage users
      - `editor`: Can view/edit most content, limited delete permissions
      - `user`: Default role for new registrations, basic access
   4. **Role Permissions**: Customize section-level permissions via `role_permissions` table if needed

  ## Admin Dashboard Features

  - **Hero Section Editor**: Update title, subtitle, description, and statistics
  - **About Content Editor**: Manage story paragraphs and feature highlights
  - **Site Settings**: Configure contact info, social media links, and branding
  - **Event Management**: Full CRUD operations for events with image uploads
  - **Team & Partners**: Manage team members and partner organizations
  - **Gallery Management**: Upload and organize event/gallery images

  ## Development

  ```bash
  # Install dependencies
  npm install

  # Start development server
  npm run dev

  # Build for production
  npm run build

  # Import repository content to Supabase
  tsx scripts/importContentFromRepo.ts

  # Run tests
  npm test
  ```
