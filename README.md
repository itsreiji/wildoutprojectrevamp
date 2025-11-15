
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
  - **Supabase Backend**: All content is stored in Supabase database with proper security policies
  - **Import Tool**: Seed existing repository configuration into Supabase: `tsx scripts/importContentFromRepo.ts`

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

  1. **Apply Migrations**: The Supabase schema includes tables for content management
  2. **Import Content**: Run `tsx scripts/importContentFromRepo.ts` to seed current config
  3. **Admin Accounts**: Set user roles via Supabase dashboard: `profiles.role = 'admin'`

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
