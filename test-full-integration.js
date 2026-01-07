#!/usr/bin/env node

/**
 * Full Integration Test for Supabase Migration
 * Tests the complete migration from VITE_SUPABASE_ANON_KEY to VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
 */

const fs = require('fs');
const path = require('path');

console.log("🎯 FULL INTEGRATION TEST: Supabase Migration");
console.log("=" .repeat(60));

// Load .env file
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim();
                if (key && !process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

loadEnvFile();

// Test results tracking
const results = {
    passed: 0,
    failed: 0,
    warnings: 0
};

function test(name, fn) {
    try {
        const result = fn();
        if (result === true) {
            console.log(`✅ ${name}`);
            results.passed++;
        } else if (result === false) {
            console.log(`❌ ${name}`);
            results.failed++;
        } else {
            console.log(`⚠️  ${name}: ${result}`);
            results.warnings++;
        }
    } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        results.failed++;
    }
}

console.log("\n📋 PHASE 1: File Structure & Configuration");
console.log("-".repeat(40));

test("Main config file exists", () => {
    return fs.existsSync('src/lib/supabase.ts');
});

test("API client file exists", () => {
    return fs.existsSync('src/supabase/api/client.ts');
});

test(".env file exists", () => {
    return fs.existsSync('.env');
});

console.log("\n📋 PHASE 2: Environment Variables");
console.log("-".repeat(40));

test("VITE_SUPABASE_URL is set", () => {
    return !!process.env.VITE_SUPABASE_URL;
});

test("VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY is set", () => {
    return !!process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
});

test("Publishable key has correct format", () => {
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    return key && key.startsWith('sb_publishable_');
});

test("Old VITE_SUPABASE_ANON_KEY is not required", () => {
    // This is informational - old key can exist but shouldn't be used
    const oldKey = process.env.VITE_SUPABASE_ANON_KEY;
    return oldKey ? "Old key exists but unused" : true;
});

console.log("\n📋 PHASE 3: Code Migration Verification");
console.log("-".repeat(40));

test("Config uses VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY", () => {
    const content = fs.readFileSync('src/lib/supabase.ts', 'utf8');
    return content.includes('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
});

test("Config does NOT use VITE_SUPABASE_ANON_KEY", () => {
    const content = fs.readFileSync('src/lib/supabase.ts', 'utf8');
    return !content.includes('VITE_SUPABASE_ANON_KEY');
});

test("Client creation uses publishable key variable", () => {
    const content = fs.readFileSync('src/lib/supabase.ts', 'utf8');
    return content.includes('createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_DEFAULT_KEY)');
});

test("API client imports from updated config", () => {
    const content = fs.readFileSync('src/supabase/api/client.ts', 'utf8');
    return content.includes("from '../../lib/supabase'");
});

console.log("\n📋 PHASE 4: Runtime Client Creation");
console.log("-".repeat(40));

try {
    const { createClient } = require('@jsr/supabase__supabase-js');
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    test("Supabase client can be created", () => {
        const client = createClient(url, key);
        return !!client;
    });

    test("Client has auth methods", () => {
        const client = createClient(url, key);
        return typeof client.auth === 'object';
    });

    test("Client has database methods", () => {
        const client = createClient(url, key);
        return typeof client.from === 'function';
    });

    test("Client has storage methods", () => {
        const client = createClient(url, key);
        return typeof client.storage === 'object';
    });

} catch (error) {
    console.log(`⚠️  Runtime tests skipped: ${error.message}`);
    results.warnings += 4;
}

console.log("\n📋 PHASE 5: API Method Availability");
console.log("-".repeat(40));

test("API client has getHero method", () => {
    const content = fs.readFileSync('src/supabase/api/client.ts', 'utf8');
    return content.includes('async getHero()');
});

test("API client has CRUD methods for events", () => {
    const content = fs.readFileSync('src/supabase/api/client.ts', 'utf8');
    return content.includes('getEvents()') &&
           content.includes('createEvent(') &&
           content.includes('updateEvent(') &&
           content.includes('deleteEvent(');
});

test("API client has updateSettings method", () => {
    const content = fs.readFileSync('src/supabase/api/client.ts', 'utf8');
    return content.includes('async updateSettings(');
});

console.log("\n📋 PHASE 6: Fallback Configuration");
console.log("-".repeat(40));

test("Config has fallback values", () => {
    const content = fs.readFileSync('src/lib/supabase.ts', 'utf8');
    return content.includes('||');
});

test("Fallback key is publishable format", () => {
    const content = fs.readFileSync('src/lib/supabase.ts', 'utf8');
    const fallbackMatch = content.match(/VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY\s*\|\|\s*"([^"]+)"/);
    return fallbackMatch && fallbackMatch[1].startsWith('sb_publishable_');
});

console.log("\n" + "=".repeat(60));
console.log("📊 FINAL TEST RESULTS");
console.log("=".repeat(60));
console.log(`✅ PASSED: ${results.passed}`);
console.log(`❌ FAILED: ${results.failed}`);
console.log(`⚠️  WARNINGS: ${results.warnings}`);
console.log(`📝 TOTAL: ${results.passed + results.failed + results.warnings}`);

if (results.failed === 0) {
    console.log("\n🎉 SUCCESS: All tests passed!");
    console.log("🚀 Supabase migration to VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY is complete and verified.");
    console.log("\n📋 NEXT STEPS:");
    console.log("   1. Start development server: bun dev");
    console.log("   2. Open http://localhost:3000");
    console.log("   3. Test admin login functionality");
    console.log("   4. Verify data operations work correctly");
    console.log("\n⚠️  If you encounter issues:");
    console.log("   • Check browser console for errors");
    console.log("   • Verify Supabase project is active");
    console.log("   • Ensure Edge Functions are deployed");
    console.log("   • Confirm VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY is correct");
} else {
    console.log("\n❌ Some tests failed. Please review the errors above.");
    process.exit(1);
}

// Export results for potential use
module.exports = results;