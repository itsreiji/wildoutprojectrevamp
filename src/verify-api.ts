
import { apiClient } from './supabase/api/client';

async function testApi() {
  console.log('Testing Supabase API Client...');
  
  try {
    console.log('1. Fetching Hero...');
    const hero = await apiClient.getHero();
    console.log('Hero:', hero ? 'Found' : 'Not found (using fallback)');

    console.log('2. Fetching Events...');
    const events = await apiClient.getEvents();
    console.log(`Events: Found ${events.length}`);

    console.log('3. Fetching Team...');
    const team = await apiClient.getTeam();
    console.log(`Team: Found ${team.length}`);

    console.log('✅ API Client Initialized Successfully (Connection might fail if Edge Functions are not deployed)');
  } catch (error) {
    console.error('❌ API Test Failed:', error);
  }
}

testApi();
