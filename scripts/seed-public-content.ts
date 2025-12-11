import { supabaseClient } from '../lib/supabase/client';

// Seed hero, about, settings into public_content from existing singletons
async function seedPublicContent() {
  console.log('Seeding public_content...');

  // Hero
  let hero;
  try {
    const { data } = await supabaseClient.from('hero_content').select('*').single();
    hero = data;
  } catch {
    hero = null;
  }
  if (hero) {
    await supabaseClient.from('public_content').upsert({
      section: 'hero',
      data: {
        title: hero.title,
        subtitle: hero.subtitle,
        description: hero.description,
        stats: hero.stats,
        cta_text: hero.cta_text,
        cta_link: hero.cta_link,
      },
    });
    console.log('✅ Seeded hero');
  }

  // About
  let about;
  try {
    const { data } = await supabaseClient.from('about_content').select('*').single();
    about = data;
  } catch {
    about = null;
  }
  if (about) {
    await supabaseClient.from('public_content').upsert({
      section: 'about',
      data: {
        title: about.title,
        subtitle: about.subtitle,
        founded_year: about.founded_year,
        story: about.story,
        features: about.features,
      },
    });
    console.log('✅ Seeded about');
  }

  // Settings
  let settings;
  try {
    const { data } = await supabaseClient.from('site_settings').select('*').single();
    settings = data;
  } catch {
    settings = null;
  }
  if (settings) {
    await supabaseClient.from('public_content').upsert({
      section: 'settings',
      data: {
        site_name: settings.site_name,
        site_description: settings.site_description,
        tagline: settings.tagline,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        social_media: settings.social_media,
      },
    });
    console.log('✅ Seeded settings');
  }

  console.log('✅ Seed complete');
}

seedPublicContent().catch(console.error);
