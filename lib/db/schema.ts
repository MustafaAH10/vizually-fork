import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const canvases = pgTable('canvases', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const canvasElements = pgTable('canvas_elements', {
  id: serial('id').primaryKey(),
  canvasId: integer('canvas_id')
    .notNull()
    .references(() => canvases.id),
  type: varchar('type', { length: 50 }).notNull(),
  content: text('content').notNull(),
  position: text('position').notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const canvasShares = pgTable('canvas_shares', {
  id: serial('id').primaryKey(),
  canvasId: integer('canvas_id')
    .notNull()
    .references(() => canvases.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  permissionLevel: varchar('permission_level', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  canvases: many(canvases),
  sharedCanvases: many(canvasShares),
}));

export const canvasesRelations = relations(canvases, ({ one, many }) => ({
  user: one(users, {
    fields: [canvases.userId],
    references: [users.id],
  }),
  elements: many(canvasElements),
  shares: many(canvasShares),
}));

export const canvasElementsRelations = relations(canvasElements, ({ one }) => ({
  canvas: one(canvases, {
    fields: [canvasElements.canvasId],
    references: [canvases.id],
  }),
}));

export const canvasSharesRelations = relations(canvasShares, ({ one }) => ({
  canvas: one(canvases, {
    fields: [canvasShares.canvasId],
    references: [canvases.id],
  }),
  user: one(users, {
    fields: [canvasShares.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Canvas = typeof canvases.$inferSelect;
export type NewCanvas = typeof canvases.$inferInsert;

export type CanvasElement = typeof canvasElements.$inferSelect;
export type NewCanvasElement = typeof canvasElements.$inferInsert;

export type CanvasShare = typeof canvasShares.$inferSelect;
export type NewCanvasShare = typeof canvasShares.$inferInsert;
