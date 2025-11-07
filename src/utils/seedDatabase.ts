import { supabaseClient } from '../supabase/client';
import {
  DUMMY_EVENTS,
  DUMMY_EVENT_ARTISTS,
  DUMMY_TEAM_MEMBERS,
  DUMMY_PARTNERS,
  DUMMY_GALLERY_ITEMS
} from '../data/dummyData';

/**
 * Seeds the Supabase database with dummy data for development and testing
 *
 * Usage:
 * - In browser console: import('./utils/seedDatabase').then(m => m.seedDatabase())
 * - In Node.js: require('./utils/seedDatabase').seedDatabase()
 * - Or call directly in your app for testing
 */

export async function seedDatabase(options: {
  clearExisting?: boolean;
  verbose?: boolean;
} = {}) {
  const { clearExisting = false, verbose = true } = options;

  if (verbose) {
    console.log('🌱 Starting database seeding...');
    console.log(`Clear existing data: ${clearExisting}`);
  }

  try {
    // Clear existing data if requested
    if (clearExisting) {
      if (verbose) console.log('🧹 Clearing existing data...');

      await supabaseClient.from('event_artists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseClient.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseClient.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseClient.from('partners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseClient.from('gallery_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      if (verbose) console.log('✅ Existing data cleared');
    }

    // Insert events first (needed for foreign keys)
    if (verbose) console.log(`📅 Inserting ${DUMMY_EVENTS.length} events...`);
    const eventResults = [];
    for (const event of DUMMY_EVENTS) {
      const { data, error } = await supabaseClient
        .from('events')
        .insert(event)
        .select()
        .single();

      if (error) {
        console.error('❌ Error inserting event:', event.title, error);
      } else {
        eventResults.push(data);
        if (verbose) console.log(`✅ Inserted event: ${event.title}`);
      }
    }

    // Insert event artists (references events)
    if (verbose) console.log(`🎤 Inserting ${DUMMY_EVENT_ARTISTS.length} event artists...`);
    for (const artist of DUMMY_EVENT_ARTISTS) {
      const { data, error } = await supabaseClient
        .from('event_artists')
        .insert(artist)
        .select()
        .single();

      if (error) {
        console.error('❌ Error inserting artist:', artist.artist_name, error);
      } else {
        if (verbose) console.log(`✅ Inserted artist: ${artist.artist_name}`);
      }
    }

    // Insert team members
    if (verbose) console.log(`👥 Inserting ${DUMMY_TEAM_MEMBERS.length} team members...`);
    for (const member of DUMMY_TEAM_MEMBERS) {
      const { data, error } = await supabaseClient
        .from('team_members')
        .insert(member)
        .select()
        .single();

      if (error) {
        console.error('❌ Error inserting team member:', member.name, error);
      } else {
        if (verbose) console.log(`✅ Inserted team member: ${member.name}`);
      }
    }

    // Insert partners
    if (verbose) console.log(`🤝 Inserting ${DUMMY_PARTNERS.length} partners...`);
    for (const partner of DUMMY_PARTNERS) {
      const { data, error } = await supabaseClient
        .from('partners')
        .insert(partner)
        .select()
        .single();

      if (error) {
        console.error('❌ Error inserting partner:', partner.name, error);
      } else {
        if (verbose) console.log(`✅ Inserted partner: ${partner.name}`);
      }
    }

    // Insert gallery items
    if (verbose) console.log(`🖼️ Inserting ${DUMMY_GALLERY_ITEMS.length} gallery items...`);
    for (const item of DUMMY_GALLERY_ITEMS) {
      const { data, error } = await supabaseClient
        .from('gallery_items')
        .insert(item)
        .select()
        .single();

      if (error) {
        console.error('❌ Error inserting gallery item:', item.title, error);
      } else {
        if (verbose) console.log(`✅ Inserted gallery item: ${item.title}`);
      }
    }

    if (verbose) {
      console.log('🎉 Database seeding completed successfully!');
      console.log('📊 Summary:');
      console.log(`   - ${DUMMY_EVENTS.length} events`);
      console.log(`   - ${DUMMY_EVENT_ARTISTS.length} event artists`);
      console.log(`   - ${DUMMY_TEAM_MEMBERS.length} team members`);
      console.log(`   - ${DUMMY_PARTNERS.length} partners`);
      console.log(`   - ${DUMMY_GALLERY_ITEMS.length} gallery items`);
    }

    return {
      success: true,
      counts: {
        events: DUMMY_EVENTS.length,
        eventArtists: DUMMY_EVENT_ARTISTS.length,
        teamMembers: DUMMY_TEAM_MEMBERS.length,
        partners: DUMMY_PARTNERS.length,
        galleryItems: DUMMY_GALLERY_ITEMS.length
      }
    };

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clears all dummy data from the database
 */
export async function clearDummyData(verbose: boolean = true) {
  if (verbose) console.log('🧹 Clearing dummy data...');

  try {
    // Clear in reverse order to handle foreign key constraints
    await supabaseClient.from('event_artists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('gallery_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseClient.from('partners').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (verbose) console.log('✅ All dummy data cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Make functions available globally for easy console access
if (typeof window !== 'undefined') {
  (window as any).seedDatabase = seedDatabase;
  (window as any).clearDummyData = clearDummyData;
}
