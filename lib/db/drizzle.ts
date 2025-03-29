'use server';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

dotenv.config();

// Support both POSTGRES_URL and DATABASE_URL for compatibility
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error('Neither DATABASE_URL nor POSTGRES_URL environment variable is set');
}

// Use edge-compatible postgres configuration
const client = postgres(databaseUrl, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  max_lifetime: 60 * 30,
});

const db = drizzle(client, { schema });

export async function getDb() {
  return db;
}

// Helper function to execute queries
export async function query<T>(fn: (db: PostgresJsDatabase<typeof schema>) => Promise<T>): Promise<T> {
  const database = await getDb();
  return fn(database);
}
