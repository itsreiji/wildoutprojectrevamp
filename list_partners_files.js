#!/usr/bin/env node

/**
 * Script to list all files in the "partners" folder of the "wildout-images" bucket
 * Handles pagination for large file lists (>1000 files)
 */

import { createClient } from '@supabase/supabase-js';

// Configuration from environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qhimllczaejftnuymrsr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZlci1yZWFsIn0._YRmS5p3zOaM9yZJ4OgQzg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listPartnerFiles() {
  const bucketName = 'wildout-images';
  const folderPath = 'partners/';
  const allFiles = [];
  let page = 0;
  const limit = 1000; // Maximum files per page

  console.log(`Listing files from bucket: ${bucketName}`);
  console.log(`Folder path: ${folderPath}`);
  console.log('Starting pagination...\n');

  try {
    while (true) {
      console.log(`Fetching page ${page + 1}...`);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folderPath, {
          limit: limit,
          offset: page * limit,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Error listing files:', error);
        break;
      }

      if (!data || data.length === 0) {
        console.log(`No more files found. Total pages processed: ${page}`);
        break;
      }

      // Filter to only include files (not folders) and get relative paths
      const files = data
        .filter(item => !item.id.endsWith('-0')) // Filter out folders (folders don't have proper IDs)
        .map(item => {
          // Remove the 'partners/' prefix to get relative path within the folder
          const relativePath = item.name.replace(/^partners\//, '');
          return relativePath;
        })
        .filter(path => path.length > 0); // Remove empty paths

      allFiles.push(...files);
      console.log(`Found ${files.length} files in this page. Total so far: ${allFiles.length}`);

      // If we got fewer files than the limit, we've reached the end
      if (data.length < limit) {
        console.log(`Reached end of files (got ${data.length} < ${limit})`);
        break;
      }

      page++;

      // Safety check to prevent infinite loops
      if (page > 100) {
        console.log('Safety limit reached (100 pages). Stopping.');
        break;
      }
    }

    console.log('\n=== RESULTS ===');
    console.log(`Total files found: ${allFiles.length}`);
    console.log('\nFile paths (relative to "partners" folder):');

    if (allFiles.length === 0) {
      console.log('(No files found)');
    } else {
      allFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
      });
    }

    return allFiles;

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  listPartnerFiles().then(() => {
    console.log('\nDone!');
  }).catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });
}

export { listPartnerFiles };