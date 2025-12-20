#!/usr/bin/env node

/**
 * Script to check available buckets and list files in wildout-images bucket
 */

import { createClient } from '@jsr/supabase__supabase-js';

// Configuration from environment - using anon key for storage operations
const SUPABASE_URL = 'https://qhimllczaejftnuymrsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoaW1sbGN6YWVqZnRudXltcnNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODc3MTIsImV4cCI6MjA3NDU2MzcxMn0.mgXbyeMdpwxn_kpxANJtq4dDJCMJcZhFfLeOzUIyVxg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkStorage() {
  console.log('=== Checking Supabase Storage ===\n');

  // First, list all buckets
  console.log('1. Listing all buckets:');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError);
    return;
  }

  if (!buckets || buckets.length === 0) {
    console.log('No buckets found');
    return;
  }

  console.log(`Found ${buckets.length} buckets:`);
  buckets.forEach(bucket => {
    console.log(`  - ${bucket.name} (${bucket.id}) - ${bucket.public ? 'public' : 'private'}`);
  });

  // Check if wildout-images bucket exists
  const wildoutBucket = buckets.find(b => b.name === 'wildout-images');
  if (!wildoutBucket) {
    console.log('\n❌ wildout-images bucket not found!');
    return;
  }

  console.log('\n2. Checking wildout-images bucket contents:');

  // Try listing root folder
  console.log('\n   a) Root folder:');
  const { data: rootFiles, error: rootError } = await supabase.storage
    .from('wildout-images')
    .list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (rootError) {
    console.error('   Error:', rootError.message);
  } else if (!rootFiles || rootFiles.length === 0) {
    console.log('   Empty or no access');
  } else {
    console.log(`   Found ${rootFiles.length} items:`);
    rootFiles.forEach(item => {
      const type = item.id.endsWith('-0') ? '📁 folder' : '📄 file';
      console.log(`     ${type} ${item.name}`);
    });
  }

  // Try listing partners folder specifically
  console.log('\n   b) Partners folder:');
  const { data: partnersFiles, error: partnersError } = await supabase.storage
    .from('wildout-images')
    .list('partners/', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (partnersError) {
    console.error('   Error:', partnersError.message);
  } else if (!partnersFiles || partnersFiles.length === 0) {
    console.log('   Empty or no access');
  } else {
    console.log(`   Found ${partnersFiles.length} items:`);
    partnersFiles.forEach(item => {
      const type = item.id.endsWith('-0') ? '📁 folder' : '📄 file';
      console.log(`     ${type} ${item.name}`);
    });
  }

  // Try listing without folder path to see all contents
  console.log('\n   c) All contents (recursive attempt):');
  try {
    // Try to get all files by listing with empty path
    const { data: allFiles, error: allError } = await supabase.storage
      .from('wildout-images')
      .list('', {
        limit: 1000,
        offset: 0
      });

    if (allError) {
      console.log('   Cannot list recursively (expected behavior)');
    } else {
      console.log(`   Found ${allFiles.length} items at root`);
    }
  } catch (e) {
    console.log('   Recursive listing not supported');
  }
}

checkStorage().catch(console.error);