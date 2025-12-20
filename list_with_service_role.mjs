#!/usr/bin/env node

/**
 * List files using service role key for admin access
 */

import { createClient } from '@jsr/supabase__supabase-js';

const SUPABASE_URL = 'https://qhimllczaejftnuymrsr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZlci1yZWFsIn0._YRmS5p3zOaM9yZJ4OgQzg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function listWithServiceRole() {
  console.log('Using service role key for admin access...\n');

  // Test 1: List all buckets
  console.log('1. Listing all buckets (service role):');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.log(`   ❌ Error: ${bucketsError.message}`);
  } else {
    console.log(`   ✅ Found ${buckets?.length || 0} buckets`);
    if (buckets && buckets.length > 0) {
      buckets.forEach(b => console.log(`      - ${b.name} (public: ${b.public})`));
    }
  }

  // Test 2: Try event-media bucket
  console.log('\n2. Testing event-media bucket:');
  const { data: eventMedia, error: eventError } = await supabase.storage
    .from('event-media')
    .list('', { limit: 10 });
  
  if (eventError) {
    console.log(`   ❌ Error: ${eventError.message}`);
  } else {
    console.log(`   ✅ Found ${eventMedia?.length || 0} items`);
    if (eventMedia && eventMedia.length > 0) {
      eventMedia.forEach(item => console.log(`      - ${item.name}`));
    }
  }

  // Test 3: Try wildout-images bucket
  console.log('\n3. Testing wildout-images bucket:');
  const { data: wildoutImages, error: wildoutError } = await supabase.storage
    .from('wildout-images')
    .list('', { limit: 10 });
  
  if (wildoutError) {
    console.log(`   ❌ Error: ${wildoutError.message}`);
  } else {
    console.log(`   ✅ Found ${wildoutImages?.length || 0} items`);
    if (wildoutImages && wildoutImages.length > 0) {
      wildoutImages.forEach(item => console.log(`      - ${item.name}`));
    }
  }

  // Test 4: Try to create a bucket if none exist
  if (!buckets || buckets.length === 0) {
    console.log('\n4. No buckets found. Would you like to create the event-media bucket?');
    console.log('   (This would require additional setup)');
  }

  // Test 5: Check if we can at least see storage is enabled
  console.log('\n5. Checking storage configuration:');
  try {
    // Try to get bucket info for a non-existent bucket to see error type
    const { error: testError } = await supabase.storage.getBucket('non-existent');
    if (testError) {
      console.log(`   Storage is accessible, but buckets need to be created`);
      console.log(`   Error type: ${testError.message}`);
    }
  } catch (e) {
    console.log(`   ❌ Exception: ${e.message}`);
  }
}

listWithServiceRole().catch(console.error);