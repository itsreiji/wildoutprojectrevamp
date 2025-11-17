#!/usr/bin/env tsx

/**
 * Content Import Script
 *
 * This script imports the current repository's content configuration into Supabase.
 * It extracts hero, about, and settings data from the codebase and seeds it into
 * the new content tables created by the update-public-admin-content-sync change.
 *
 * Usage:
 * - Development: npm run import-content
 * - Direct: tsx scripts/importContentFromRepo.ts
 * - With Supabase CLI: npx supabase db reset (will run all migrations including this import)
 */

import { createClient } from '@jsr/supabase__supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Missing VITE_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable');
  console.error('💡 For development, you can use SUPABASE_ANON_KEY, but for production use SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Extract content constants from ContentContext.tsx
 * This parses the TypeScript file to extract the INITIAL_* constants
 */
function extractContentFromFile(): {
  hero: any;
  about: any;
  settings: any;
} {
  const contentContextPath = path.join(process.cwd(), 'src/contexts/ContentContext.tsx');

  if (!fs.existsSync(contentContextPath)) {
    throw new Error(`ContentContext.tsx not found at ${contentContextPath}`);
  }

  const content = fs.readFileSync(contentContextPath, 'utf-8');

  // Extract INITIAL_HERO
  const heroMatch = content.match(/const INITIAL_HERO: HeroContentDto = (\{[\s\S]*?\n\})/);
  if (!heroMatch) {
    throw new Error('Could not find INITIAL_HERO constant in ContentContext.tsx');
  }

  // Extract INITIAL_ABOUT
  const aboutMatch = content.match(/const INITIAL_ABOUT: AboutContentDto = (\{[\s\S]*?\n\})/);
  if (!aboutMatch) {
    throw new Error('Could not find INITIAL_ABOUT constant in ContentContext.tsx');
  }

  // Extract INITIAL_SETTINGS
  const settingsMatch = content.match(/const INITIAL_SETTINGS: SiteSettingsDto = (\{[\s\S]*?\n\})/);
  if (!settingsMatch) {
    throw new Error('Could not find INITIAL_SETTINGS constant in ContentContext.tsx');
  }

  // Parse the extracted JavaScript objects
  const parseJSObject = (jsString: string): any => {
    // Simple parsing - replace single quotes with double quotes and handle arrays
    let parsed = jsString
      .replace(/'/g, '"')  // Single quotes to double quotes
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

    try {
      return JSON.parse(parsed);
    } catch (error) {
      console.warn(`⚠️ Could not parse JS object, using eval as fallback: ${error}`);
      // Fallback to eval for complex cases (use with caution)
      return eval(`(${jsString})`);
    }
  };

  return {
    hero: parseJSObject(heroMatch[1]),
    about: parseJSObject(aboutMatch[1]),
    settings: parseJSObject(settingsMatch[1])
  };
}

/**
 * Import hero content into Supabase
 */
async function importHeroContent(heroData: any): Promise<void> {
  console.log('🎨 Importing hero content...');

  const { error } = await supabase
    .from('hero_content')
    .upsert({
      id: '00000000-0000-0000-0000-000000000001', // Fixed ID for singleton
      title: heroData.title,
      subtitle: heroData.subtitle,
      description: heroData.description,
      stats: heroData.stats,
      cta_text: heroData.ctaText,
      cta_link: heroData.ctaLink,
      updated_at: new Date().toISOString()
      // Note: updated_by not set during import since we don't have authenticated user
    });

  if (error) {
    throw new Error(`Failed to import hero content: ${error.message}`);
  }

  console.log('✅ Hero content imported successfully');
}

/**
 * Import about content into Supabase
 */
async function importAboutContent(aboutData: any): Promise<void> {
  console.log('📖 Importing about content...');

  const { error } = await supabase
    .from('about_content')
    .upsert({
      id: '00000000-0000-0000-0000-000000000002', // Fixed ID for singleton
      title: aboutData.title,
      subtitle: aboutData.subtitle,
      founded_year: aboutData.foundedYear,
      story: aboutData.story,
      features: aboutData.features,
      updated_at: new Date().toISOString()
      // Note: updated_by not set during import since we don't have authenticated user
    });

  if (error) {
    throw new Error(`Failed to import about content: ${error.message}`);
  }

  console.log('✅ About content imported successfully');
}

/**
 * Import site settings into Supabase
 */
async function importSiteSettings(settingsData: any): Promise<void> {
  console.log('⚙️ Importing site settings...');

  const { error } = await supabase
    .from('site_settings')
    .upsert({
      id: '00000000-0000-0000-0000-000000000003', // Fixed ID for singleton
      site_name: settingsData.siteName,
      site_description: settingsData.siteDescription,
      tagline: settingsData.tagline,
      email: settingsData.email,
      phone: settingsData.phone,
      address: settingsData.address,
      social_media: settingsData.socialMedia,
      updated_at: new Date().toISOString()
      // Note: updated_by not set during import since we don't have authenticated user
    });

  if (error) {
    throw new Error(`Failed to import site settings: ${error.message}`);
  }

  console.log('✅ Site settings imported successfully');
}

/**
 * Check if tables are empty (first run)
 */
async function checkIfEmpty(): Promise<boolean> {
  const [heroResult, aboutResult, settingsResult, sectionsResult] = await Promise.all([
    supabase.from('hero_content').select('id').limit(1),
    supabase.from('about_content').select('id').limit(1),
    supabase.from('site_settings').select('id').limit(1),
    supabase.from('admin_sections').select('id').limit(1)
  ]);

  const hasHero = heroResult.data && heroResult.data.length > 0;
  const hasAbout = aboutResult.data && aboutResult.data.length > 0;
  const hasSettings = settingsResult.data && settingsResult.data.length > 0;
  const hasSections = sectionsResult.data && sectionsResult.data.length > 0;

  return !hasHero && !hasAbout && !hasSettings && !hasSections;
}

/**
 * Seed admin sections and permissions
 */
async function seedAdminSections(): Promise<void> {
  console.log('🔧 Seeding admin sections and permissions...');

  // Admin sections data (mirroring DashboardLayout NAVIGATION_ITEMS)
  const adminSections = [
    {
      slug: 'home',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      category: 'main',
      order_index: 1,
      description: 'Overview dashboard with statistics and recent activity'
    },
    {
      slug: 'hero',
      label: 'Hero Section',
      icon: 'Sparkles',
      category: 'content',
      order_index: 2,
      description: 'Landing page hero section with title, subtitle, and call-to-action'
    },
    {
      slug: 'about',
      label: 'About Us',
      icon: 'Info',
      category: 'content',
      order_index: 3,
      description: 'About page content including story and features'
    },
    {
      slug: 'events',
      label: 'Events',
      icon: 'Calendar',
      category: 'content',
      order_index: 4,
      description: 'Manage events, categories, and event details'
    },
    {
      slug: 'team',
      label: 'Team',
      icon: 'Users',
      category: 'content',
      order_index: 5,
      description: 'Team members and their information'
    },
    {
      slug: 'gallery',
      label: 'Gallery',
      icon: 'Image',
      category: 'content',
      order_index: 6,
      description: 'Image gallery items and management'
    },
    {
      slug: 'partners',
      label: 'Partners',
      icon: 'Handshake',
      category: 'content',
      order_index: 7,
      description: 'Partner organizations and collaborations'
    },
    {
      slug: 'settings',
      label: 'Settings',
      icon: 'Settings',
      category: 'management',
      order_index: 8,
      description: 'Site-wide settings and configuration'
    }
  ];

  // Insert admin sections
  for (const section of adminSections) {
    const { error } = await supabase
      .from('admin_sections')
      .upsert(section, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Error seeding admin section ${section.slug}:`, error);
    }
  }

  // Role permissions data
  const rolePermissions = [
    // Admin - full access
    { role: 'admin', section_slug: 'home', can_view: true, can_edit: true, can_publish: true, can_delete: true },
    { role: 'admin', section_slug: 'hero', can_view: true, can_edit: true, can_publish: true, can_delete: true },
    { role: 'admin', section_slug: 'about', can_view: true, can_edit: true, can_publish: true, can_delete: true },
    { role: 'admin', section_slug: 'events', can_view: true, can_edit: true, can_publish: true, can_delete: true },
    { role: 'admin', section_slug: 'team', can_view: true, can_edit: true, can_publish: true, can_delete: true },
    { role: 'admin', section_slug: 'gallery', can_view: true, can_edit: true, can_publish: true, can_delete: true },
    { role: 'admin', section_slug: 'partners', can_view: true, can_edit: true, can_publish: true, can_delete: true },
    { role: 'admin', section_slug: 'settings', can_view: true, can_edit: true, can_publish: true, can_delete: true },

    // Editor - content editing access
    { role: 'editor', section_slug: 'home', can_view: true, can_edit: false, can_publish: false, can_delete: false },
    { role: 'editor', section_slug: 'hero', can_view: true, can_edit: true, can_publish: true, can_delete: false },
    { role: 'editor', section_slug: 'about', can_view: true, can_edit: true, can_publish: true, can_delete: false },
    { role: 'editor', section_slug: 'events', can_view: true, can_edit: true, can_publish: true, can_delete: false },
    { role: 'editor', section_slug: 'team', can_view: true, can_edit: true, can_publish: true, can_delete: false },
    { role: 'editor', section_slug: 'gallery', can_view: true, can_edit: true, can_publish: true, can_delete: false },
    { role: 'editor', section_slug: 'partners', can_view: true, can_edit: true, can_publish: true, can_delete: false },
    { role: 'editor', section_slug: 'settings', can_view: true, can_edit: false, can_publish: false, can_delete: false },

    // Viewer - read-only access
    { role: 'viewer', section_slug: 'home', can_view: true, can_edit: false, can_publish: false, can_delete: false },
    { role: 'viewer', section_slug: 'hero', can_view: true, can_edit: false, can_publish: false, can_delete: false },
    { role: 'viewer', section_slug: 'about', can_view: true, can_edit: false, can_publish: false, can_delete: false },
    { role: 'viewer', section_slug: 'events', can_view: true, can_edit: false, can_publish: false, can_delete: false },
    { role: 'viewer', section_slug: 'team', can_view: true, can_edit: false, can_publish: false, can_delete: false },
    { role: 'viewer', section_slug: 'gallery', can_view: true, can_edit: false, can_publish: false, can_delete: false },
    { role: 'viewer', section_slug: 'partners', can_view: true, can_edit: false, can_publish: false, can_delete: false },
    { role: 'viewer', section_slug: 'settings', can_view: false, can_edit: false, can_publish: false, can_delete: false }
  ];

  // Insert role permissions
  for (const permission of rolePermissions) {
    const { error } = await supabase
      .from('role_permissions')
      .upsert(permission, { onConflict: 'role,section_slug' });

    if (error) {
      console.error(`❌ Error seeding role permission ${permission.role}-${permission.section_slug}:`, error);
    }
  }

  // Seed section content with current dashboard data
  const sectionContent = [
    {
      section_slug: 'home',
      payload: {
        stats: {
          totalEvents: 0,
          upcomingEvents: 0,
          ongoingEvents: 0,
          completedEvents: 0,
          totalTeamMembers: 0,
          activeTeamMembers: 0,
          totalGalleryImages: 0,
          totalPartners: 0,
          activePartners: 0,
          totalAttendees: 0,
          avgAttendanceRate: 0
        },
        recentActivity: [],
        charts: {
          monthlyTrendData: [
            { month: 'Jan', events: 12, attendees: 450 },
            { month: 'Feb', events: 15, attendees: 580 },
            { month: 'Mar', events: 18, attendees: 720 },
            { month: 'Apr', events: 22, attendees: 890 },
            { month: 'May', events: 25, attendees: 1050 },
            { month: 'Jun', events: 20, attendees: 820 }
          ]
        }
      }
    },
    {
      section_slug: 'events',
      payload: {
        eventCategories: ['music', 'sports', 'arts', 'food', 'community', 'other'],
        eventStatuses: ['draft', 'published', 'cancelled', 'archived'],
        defaultCapacity: 100,
        maxFileSize: 5242880,
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp']
      }
    },
    {
      section_slug: 'team',
      payload: {
        memberStatuses: ['active', 'inactive'],
        maxBioLength: 500,
        maxFileSize: 2097152,
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        socialPlatforms: ['linkedin', 'twitter', 'instagram', 'facebook']
      }
    },
    {
      section_slug: 'gallery',
      payload: {
        categories: ['event', 'partner', 'team', 'general'],
        statuses: ['published', 'draft', 'archived'],
        maxFileSize: 10485760,
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        thumbnailSizes: [150, 300, 600],
        compressionQuality: 0.8
      }
    },
    {
      section_slug: 'partners',
      payload: {
        categories: ['venue', 'promoter', 'artist', 'sponsor', 'other'],
        statuses: ['active', 'inactive', 'pending'],
        maxFileSize: 2097152,
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        socialPlatforms: ['website', 'email', 'phone', 'facebook', 'twitter', 'instagram', 'linkedin']
      }
    },
    {
      section_slug: 'settings',
      payload: {
        socialPlatforms: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok'],
        contactFields: ['email', 'phone', 'address'],
        validationRules: {
          email: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$',
          phone: '^[+]?[\\d\\s\\-\\(\\)]{10,}$'
        }
      }
    }
  ];

  // Insert section content
  for (const content of sectionContent) {
    // Get section ID
    const { data: section } = await supabase
      .from('admin_sections')
      .select('id')
      .eq('slug', content.section_slug)
      .single();

    if (section) {
      const { error } = await supabase
        .from('section_content')
        .upsert({
          section_id: section.id,
          payload: content.payload,
          version: 1,
          is_active: true
        }, { onConflict: 'section_id,version' });

      if (error) {
        console.error(`❌ Error seeding content for ${content.section_slug}:`, error);
      }
    }
  }

  console.log('✅ Admin sections and permissions seeded');
}

/**
 * Main import function
 */
async function importContent(): Promise<void> {
  console.log('🚀 Starting content import from repository...\n');

  try {
    // Check if tables are empty
    const isEmpty = await checkIfEmpty();
    if (!isEmpty) {
      console.log('⚠️ Content tables are not empty. This will overwrite existing data.');
      console.log('Continue? (Set FORCE_IMPORT=true to skip this check)');

      if (process.env.FORCE_IMPORT !== 'true') {
        console.log('💡 To force import, run: FORCE_IMPORT=true tsx scripts/importContentFromRepo.ts');
        return;
      }
    }

    // Extract content from repository
    console.log('📂 Extracting content from repository...');
    const { hero, about, settings } = extractContentFromFile();
    console.log('✅ Content extracted successfully');

    // Import content to Supabase
    await Promise.all([
      importHeroContent(hero),
      importAboutContent(about),
      importSiteSettings(settings),
      seedAdminSections()
    ]);

    console.log('\n🎉 Content import completed successfully!');
    console.log('📋 Summary:');
    console.log('   - Hero content: imported');
    console.log('   - About content: imported');
    console.log('   - Site settings: imported');
    console.log('   - Admin sections & permissions: seeded');
    console.log('\n💡 The admin dashboard should now show the imported content.');

  } catch (error) {
    console.error('\n❌ Content import failed:', error);
    process.exit(1);
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importContent();
}

export { importContent, extractContentFromFile };
