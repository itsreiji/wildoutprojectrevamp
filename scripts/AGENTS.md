# WildOut! Project - scripts/ AGENTS.md

**Package Identity**

- This package contains utility and migration scripts
- Primary tech/framework: TypeScript, Node.js

## Setup & Run

```bash
# Run a script
pnpm tsx scripts/script-name.ts

# Run with environment variables
ENV_VAR=value pnpm tsx scripts/script-name.ts
```

## Patterns & Conventions

### File Organization Rules

- **Utility scripts**: `scripts/**` - Reusable utility scripts
- **Migration scripts**: `scripts/**` - Data migration and import scripts
- **Seed scripts**: `scripts/seed-public-content.ts` - Database seeding

### Naming Conventions

- ✅ **Script files**: kebab-case with `.ts` extension (e.g., `import-content-from-repo.ts`)
- ✅ **Functions**: camelCase with descriptive names
- ✅ **Variables**: camelCase or UPPER_SNAKE_CASE for constants

### Preferred Patterns

**Utility Scripts:**

- ✅ DO: Follow pattern from `scripts/importContentFromRepo.ts`
- ✅ DO: Use proper error handling with try/catch
- ✅ DO: Use async/await for I/O operations
- ✅ DO: Provide clear console output and progress indicators
- ✅ DO: Use environment variables for configuration

**Migration Scripts:**

- ✅ DO: Follow pattern from `scripts/seed-public-content.ts`
- ✅ DO: Use Supabase client for database operations
- ✅ DO: Batch operations for performance
- ✅ DO: Provide dry-run mode when applicable
- ✅ DO: Validate data before import

**Error Handling:**

- ✅ DO: Use try/catch blocks for all external operations
- ✅ DO: Provide meaningful error messages
- ✅ DO: Exit with proper exit codes
- ✅ DO: Log errors to console with context

## Touch Points / Key Files

- **Import Script**: `scripts/importContentFromRepo.ts` - Content import utility
- **Seed Script**: `scripts/seed-public-content.ts` - Database seeding script
- **Supabase Client**: `src/supabase/client.ts` - Database client for scripts

## JIT Index Hints

```bash
# Find all scripts
ls -la scripts/

# Find script files
find scripts -name "*.ts"

# Find scripts using Supabase
rg -n "supabase" scripts

# Find scripts with specific functionality
rg -n "import\|seed\|migrate" scripts

# Find error handling patterns
rg -n "try|catch|error" scripts
```

## Common Gotchas

- **Environment Variables**: Scripts may require `.env` file configuration
- **Supabase Client**: Use the same client as the main app for consistency
- **Batch Size**: For large operations, use appropriate batch sizes
- **Dry Run**: Always test with dry-run mode before actual execution
- **Backup**: Consider backing up data before running destructive operations

## Pre-PR Checks

```bash
# Test script with sample data
# Verify error handling works correctly
# Check that script doesn't modify production data unintentionally
```

## Script Patterns

### Recommended Script Structure

```typescript
// scripts/example-script.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configuration
const DRY_RUN = process.env.DRY_RUN === "true";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "50");

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log("Starting script...");

    if (DRY_RUN) {
      console.log("🔵 DRY RUN MODE - No changes will be made");
    }

    // Main script logic here
    const { data, error } = await supabase
      .from("table_name")
      .select("*")
      .limit(BATCH_SIZE);

    if (error) {
      throw error;
    }

    console.log(`Processed ${data.length} records`);

    if (!DRY_RUN) {
      console.log("✅ Script completed successfully");
    } else {
      console.log("✅ Dry run completed - no changes made");
    }
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

// Export for programmatic use
export { main };
```

### Recommended Data Import Pattern

```typescript
// scripts/import-data.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";

interface ImportData {
  id: string;
  name: string;
  // other fields
}

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function importData(filePath: string) {
  try {
    // Read and parse data
    const fileContent = readFileSync(resolve(filePath), "utf-8");
    const data: ImportData[] = JSON.parse(fileContent);

    console.log(`Found ${data.length} records to import`);

    // Validate data
    const validData = data.filter((item) => item.id && item.name);

    console.log(`${validData.length} records are valid`);

    // Import in batches
    const batchSize = 50;
    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize);

      const { error } = await supabase
        .from("table_name")
        .upsert(batch, { onConflict: "id" });

      if (error) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, error);
        continue;
      }

      console.log(
        `Imported batch ${i / batchSize + 1} (${batch.length} records)`
      );
    }

    console.log("✅ Import completed successfully");
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  }
}

// Command line usage
if (process.argv[2]) {
  importData(process.argv[2]);
} else {
  console.log("Usage: pnpm tsx scripts/import-data.ts <file-path>");
  process.exit(1);
}
```

### Recommended Migration Pattern

```typescript
// scripts/migrate-data.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function migrateOldToNewFormat() {
  try {
    console.log("Starting data migration...");

    // 1. Fetch old data
    const { data: oldData, error: fetchError } = await supabase
      .from("old_table")
      .select("*");

    if (fetchError) throw fetchError;
    if (!oldData || oldData.length === 0) {
      console.log("No data to migrate");
      return;
    }

    console.log(`Found ${oldData.length} records to migrate`);

    // 2. Transform data
    const newData = oldData.map((item) => ({
      id: item.id,
      new_field: item.old_field,
      // other transformations
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // 3. Validate transformed data
    const validData = newData.filter((item) => item.id && item.new_field);
    console.log(`${validData.length} records are valid for migration`);

    // 4. Migrate in batches
    const batchSize = 25;
    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from("new_table")
        .insert(batch);

      if (insertError) {
        console.error(
          `Error migrating batch ${i / batchSize + 1}:`,
          insertError
        );
        continue;
      }

      console.log(
        `Migrated batch ${i / batchSize + 1} (${batch.length} records)`
      );
    }

    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Dry run mode
const DRY_RUN = process.env.DRY_RUN === "true";
if (DRY_RUN) {
  console.log("🔵 DRY RUN MODE - No actual migration will occur");
  // In dry run, you would simulate the process without actual database writes
} else {
  migrateOldToNewFormat();
}
```

## Environment Variables

### Common Script Environment Variables

```bash
# Dry run mode (no actual changes)
DRY_RUN=true pnpm tsx scripts/script-name.ts

# Batch size for operations
BATCH_SIZE=100 pnpm tsx scripts/script-name.ts

# Verbose logging
DEBUG=true pnpm tsx scripts/script-name.ts

# Specific configuration
CONFIG_FILE=custom-config.json pnpm tsx scripts/script-name.ts
```

## Error Handling Best Practices

### Comprehensive Error Handling

```typescript
async function robustOperation() {
  try {
    // 1. Input validation
    if (!process.env.REQUIRED_VAR) {
      throw new Error("Missing required environment variable: REQUIRED_VAR");
    }

    // 2. Database operation with retry logic
    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
      try {
        const { data, error } = await supabase
          .from("table")
          .select("*")
          .limit(100);

        if (error) throw error;

        // Process data
        console.log(`Processed ${data.length} records`);
        success = true;
      } catch (dbError) {
        retries--;
        if (retries === 0) throw dbError;

        console.warn(`Attempt failed, retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retry
      }
    }

    // 3. Post-operation validation
    const validationResult = await validateResults();
    if (!validationResult.valid) {
      throw new Error(`Validation failed: ${validationResult.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Operation failed:", error);

    // Different error handling based on error type
    if (error instanceof Error) {
      if (error.message.includes("network")) {
        console.log("📡 Network error - check your internet connection");
      } else if (error.message.includes("permission")) {
        console.log("🔒 Permission error - check your credentials");
      } else {
        console.log("❌ Unexpected error occurred");
      }
    }

    // Exit with appropriate code
    process.exit(1);
  }
}
```

## Note

- If model cutoff < current_date then they need to research no matter what to improve their knowledge.
