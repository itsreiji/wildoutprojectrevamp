#!/usr/bin/env node

/**
 * Test different approaches to access Supabase storage
 */

import { createClient } from '@jsr/supabase__supabase-js';

const SUPABASE_URL = 'https://qhimllczaejftnuymrsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoaW1sbGN6YWVqZnRudXltcnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODc3MTIsImV4cCI6MjA3NDU2MzcxMn0.mgXbyeMdpwxn_kpxANJtq4dDJCMJcZhFfLeOzUIyVxg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAccess() {
  console.log('Testing different storage access methods...\n');

  // Test 1: Try to list buckets (this usually requires admin permissions)
  console.log('1. Attempting to list buckets:');
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    } else {
      console.log(`   ✅ Success: ${data?.length || 0} buckets found`);
      if (data) {
        data.forEach(b => console.log(`      - ${b.name}`));
      }
    }
  } catch (e) {
    console.log(`   ❌ Exception: ${e.message}`);
  }

  // Test 2: Try to access wildout-images bucket directly
  console.log('\n2. Attempting to access wildout-images bucket:');
  try {
    const { data, error } = await supabase.storage
      .from('wildout-images')
      .list('', { limit: 10 });

    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    } else {
      console.log(`   ✅ Success: ${data?.length || 0} items found`);
      if (data) {
        data.forEach(item => console.log(`      - ${item.name} (${item.id})`));
      }
    }
  } catch (e) {
    console.log(`   ❌ Exception: ${e.message}`);
  }

  // Test 3: Try to access partners folder specifically
  console.log('\n3. Attempting to access partners folder:');
  try {
    const { data, error } = await supabase.storage
      .from('wildout-images')
      .list('partners/', { limit: 10 });

    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    } else {
      console.log(`   ✅ Success: ${data?.length || 0} items found`);
      if (data) {
        data.forEach(item => console.log(`      - ${item.name} (${item.id})`));
      }
    }
  } catch (e) {
    console.log(`   ❌ Exception: ${e.message}`);
  }

  // Test 4: Try to create a public URL for a hypothetical file
  console.log('\n4. Testing URL generation for a file:');
  try {
    const { data, error } = await supabase.storage
      .from('wildout-images')
      .createSignedUrl('partners/test-file.jpg', 60);

    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    } else {
      console.log(`   ✅ Success: URL created`);
      console.log(`      ${data?.signedUrl}`);
    }
  } catch (e) {
    console.log(`   ❌ Exception: ${e.message}`);
  }

  // Test 5: Check if we can get bucket info
  console.log('\n5. Attempting to get bucket info:');
  try {
    const { data, error } = await supabase.storage.getBucket('wildout-images');
    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    } else {
      console.log(`   ✅ Success: Bucket info retrieved`);
      console.log(`      Public: ${data?.public}`);
      console.log(`      File size limit: ${data?.file_size_limit}`);
    }
  } catch (e) {
    console.log(`   ❌ Exception: ${e.message}`);
  }
}

testAccess().catch(console.error);