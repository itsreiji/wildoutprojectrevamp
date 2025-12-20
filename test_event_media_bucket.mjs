#!/usr/bin/env node

/**
 * Test event-media bucket access and structure
 */

import { createClient } from '@jsr/supabase__supabase-js';

const SUPABASE_URL = 'https://qhimllczaejftnuymrsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoaW1sbGN6YWVqZnRudXltcnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODc3MTIsImV4cCI6MjA3NDU2MzcxMn0.mgXbyeMdpwxn_kpxANJtq4dDJCMJcZhFfLeOzUIyVxg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEventMediaBucket() {
  console.log('Testing event-media bucket access...\n');

  // Test 1: List all buckets
  console.log('1. Listing all buckets:');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.log(`   ❌ Error: ${bucketsError.message}`);
  } else {
    console.log(`   ✅ Found ${buckets?.length || 0} buckets`);
    if (buckets && buckets.length > 0) {
      buckets.forEach(b => console.log(`      - ${b.name}`));
    }
  }

  // Test 2: Check if event-media bucket exists
  console.log('\n2. Getting event-media bucket info:');
  const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket('event-media');
  if (bucketError) {
    console.log(`   ❌ Error: ${bucketError.message}`);
  } else {
    console.log(`   ✅ Bucket exists`);
    console.log(`      Public: ${bucketInfo?.public}`);
    console.log(`      File size limit: ${bucketInfo?.file_size_limit}`);
  }

  // Test 3: List root of event-media bucket
  console.log('\n3. Listing root of event-media bucket:');
  const { data: rootFiles, error: rootError } = await supabase.storage
    .from('event-media')
    .list('', { limit: 100 });

  if (rootError) {
    console.log(`   ❌ Error: ${rootError.message}`);
  } else {
    console.log(`   ✅ Found ${rootFiles?.length || 0} items at root`);
    if (rootFiles && rootFiles.length > 0) {
      rootFiles.forEach(item => {
        const type = item.id.endsWith('-0') ? '📁' : '📄';
        console.log(`      ${type} ${item.name} (${item.id})`);
      });
    }
  }

  // Test 4: Try to list partners folder
  console.log('\n4. Listing partners folder:');
  const { data: partnersFiles, error: partnersError } = await supabase.storage
    .from('event-media')
    .list('partners/', { limit: 100 });

  if (partnersError) {
    console.log(`   ❌ Error: ${partnersError.message}`);
  } else {
    console.log(`   ✅ Found ${partnersFiles?.length || 0} items in partners/`);
    if (partnersFiles && partnersFiles.length > 0) {
      partnersFiles.forEach(item => {
        const type = item.id.endsWith('-0') ? '📁' : '📄';
        console.log(`      ${type} ${item.name} (${item.id})`);
      });
    }
  }

  // Test 5: Try to list some common folders that might exist
  console.log('\n5. Testing other potential folders:');
  const folders = ['', 'partners/', 'team/', 'gallery/', 'events/'];
  
  for (const folder of folders) {
    const { data, error } = await supabase.storage
      .from('event-media')
      .list(folder, { limit: 10 });
    
    if (!error && data && data.length > 0) {
      console.log(`   ✅ ${folder || 'root'}: ${data.length} items`);
    } else if (error) {
      console.log(`   ❌ ${folder}: ${error.message}`);
    } else {
      console.log(`   ⚪ ${folder}: empty`);
    }
  }
}

testEventMediaBucket().catch(console.error);