import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { getDb } from './drizzle';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

// Load environment variables from .env file
dotenv.config();

async function applyMigrations() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'lib/db/migrations/0002_remove_team_tables.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (const statement of statements) {
      await getDb().execute(sql.raw(statement));
    }

    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Failed to apply migration:', error);
    process.exit(1);
  }
}

async function main() {
  const db = await getDb();
  await migrate(db, { migrationsFolder: './drizzle' });
  process.exit(0);
}

applyMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 