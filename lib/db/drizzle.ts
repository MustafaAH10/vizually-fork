'use server';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Use edge-compatible postgres configuration
const client = postgres(process.env.POSTGRES_URL, {
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
