# WildOut! Landing Page and Dashboard

A modern React application for managing WildOut! events, team members, partners, and gallery content. Built with React 19, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0+
- pnpm 8.0.0+
- Supabase account with Edge Functions deployed

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Or with enhanced dev server (API proxy)
pnpm dev:smart
```

### Build for Production
```bash
# Clean build
pnpm build:clean

# Standard build
pnpm build

# Preview built site
pnpm preview
```

## 📁 Project Structure

```
src/
├── App.tsx                    # Root component with ThemeProvider + ContentProvider
├── main.tsx                   # Entry point
├── components/
│   ├── Router.tsx             # Custom SPA router
│   ├── LandingPage.tsx        # Public landing page
│   ├── Dashboard.tsx          # Admin dashboard
│   ├── AllEventsPage.tsx      # Events listing
│   ├── LoginPage.tsx          # Authentication
│   ├── ui/                    # shadcn/ui components (40+)
│   └── dashboard/             # Admin-specific components
├── contexts/
│   └── ContentContextCore.ts  # Global state management
├── supabase/
│   ├── api/client.ts          # Typed API client
│   └── functions/
│       └── server/            # Edge Functions (Hono)
├── types/
│   └── schemas.ts             # Zod schemas + TypeScript types
└── lib/
    └── supabase.ts            # Supabase client config
```

## 🔧 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Context + useState
- **Forms**: React Hook Form + Zod validation
- **Routing**: Custom SPA router (hash-free)
- **Backend**: Supabase Edge Functions + Hono
- **Database**: PostgreSQL (KV store pattern)
- **Auth**: Supabase JWT authentication
- **Animations**: Motion (Framer)
- **Notifications**: Sonner toast
- **Charts**: Recharts

## 🌐 API Architecture

### Supabase Edge Functions
The app uses Supabase Edge Functions with a Hono framework for API routes:

**Endpoints:**
- `GET/PUT /hero` - Hero section content
- `GET/PUT /about` - About section content
- `GET/POST/PUT/DELETE /events/:id` - Event management
- `GET/POST/PUT/DELETE /team/:id` - Team management
- `GET/POST/PUT/DELETE /partners/:id` - Partner management
- `GET/POST/PUT/DELETE /gallery/:id` - Gallery management
- `GET/PUT /settings` - Global site settings

### Client API Methods
```typescript
import { apiClient } from '@/supabase/api/client';

// Hero
await apiClient.getHero();
await apiClient.updateHero(data);

// Events
await apiClient.getEvents();
await apiClient.createEvent(data);
await apiClient.updateEvent(id, data);
await apiClient.deleteEvent(id);

// Similar patterns for: Team, Partners, Gallery, Settings, About
```

## 🔐 Authentication

- **Public Routes**: Landing page, All Events
- **Protected Routes**: Admin dashboard (requires login)
- **Auth Flow**: Supabase Auth with JWT tokens
- **Session Management**: Automatic token refresh

## 🎨 Features

### Landing Page
- Hero section with dynamic content
- About section
- Events showcase
- Team members display
- Partners carousel
- Gallery grid
- Contact information

### Admin Dashboard
- **Authentication**: Secure login/logout
- **Content Management**:
  - Hero section editor
  - About section editor
  - Events CRUD (Create, Read, Update, Delete)
  - Team member CRUD
  - Partners CRUD
  - Gallery image CRUD
  - Global settings editor
- **Real-time Updates**: Immediate UI sync
- **Image Upload**: Direct to Supabase Storage
- **Validation**: Zod schemas on all inputs

### All Events Page
- Comprehensive events listing
- Filter/search capabilities
- Responsive grid layout

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: make project Vercel ready"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Configure build settings:
     - Build Command: `pnpm build`
     - Output Directory: `build`

3. **Add Environment Variables**
   ```env
   VITE_SUPABASE_URL=https://yanjivicgslwutjzhzdx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_zm-kn6CTFg3epMFOT4_jbA_TDrz0T25
   VITE_APP_ENV=production
   VITE_ADMIN_BASE_PATH=/admin
   VITE_USE_DUMMY_DATA=false
   ```

4. **Deploy**
   - Vercel will automatically detect and build
   - Custom domain optional

### CLI Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment guide.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test -- -t "test name"
```

## 🔧 Development Commands

```bash
pnpm dev              # Start Vite dev server (port 3000)
pnpm dev:smart        # Enhanced dev server with Hono proxy
pnpm dev:check        # Verify dev server setup
pnpm build            # Production build
pnpm build:clean      # Clean and rebuild
pnpm preview          # Preview production build
pnpm test             # Run tests
```

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase publishable key | ✅ |
| `VITE_APP_ENV` | Environment (production/development) | ✅ |
| `VITE_ADMIN_BASE_PATH` | Admin route path | ✅ |
| `VITE_USE_DUMMY_DATA` | Use fallback data if API fails | ❌ |

## 🛡️ Security

- **Environment Variables**: Never commit `.env` files
- **Authentication**: JWT required for all write operations
- **Input Validation**: Zod schemas on client and server
- **CORS**: Configured for production domains
- **RLS**: Row-level security on database tables

## 📊 Performance

- **Code Splitting**: Manual chunks for vendor libraries
- **Minification**: Terser for production
- **Tree Shaking**: Unused code elimination
- **Caching**: GET endpoints cache for 60 seconds
- **Optimized Builds**: ESNext target

## 🔄 State Management

The `ContentContext` provides:
- **Data**: `events`, `partners`, `gallery`, `team`, `hero`, `about`, `settings`
- **Update Functions**: `updateEvents()`, `updateHero()`, etc.
- **Refresh**: `refresh()` - Fetches all data from API
- **Loading State**: Boolean loading indicator

**Update Flow:**
1. Update local state immediately (optimistic UI)
2. Call API to persist to Supabase
3. If API fails, call `refresh()` to revert

## 🎯 Common Issues

### API Timeout
- Check Supabase project status
- Verify Edge Function deployment
- Check network connection

### Auth Errors (401)
- User not logged in → Redirect to login
- Expired token → Refresh session
- Invalid config → Check environment variables

### Validation Failed (400)
- Edge Functions may have outdated schemas
- Deploy updated Edge Functions: `supabase functions deploy make-server-41a567c3`
- Check browser console for detailed errors

### Data Not Syncing
- Call `refresh()` from `useContent()`
- Check browser console for API errors
- Verify Edge Function deployment status

## 📝 Scripts Reference

### Build & Deploy
- `pnpm build` - Vite production build
- `pnpm build:clean` - Clean rebuild
- `pnpm preview` - Test production build locally

### Development
- `pnpm dev` - Standard Vite dev server
- `pnpm dev:smart` - Enhanced server with API proxy
- `pnpm dev:check` - Verify dev setup

### Testing
- `pnpm test` - Run Vitest once
- `pnpm test -- -t "pattern"` - Run specific test

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is proprietary. All rights reserved.

## 🔗 Links

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [API Documentation](./API.md)
- [Team Management Fix](./TEAM_MANAGEMENT_FIX.md)
- [Validation Fix](./VALIDATION_FIX.md)

---

**Built with ❤️ using React 19, Supabase, and Vercel**