import {pgTable, serial, text, uuid} from "drizzle-orm/pg-core";

export type Languages = 'en'

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    steamid: text('steamid').unique(),
    locale: text('locale').default('en').$type<Languages>(),
    secondary_id: uuid('secondary_id').notNull().unique().defaultRandom()
})

export const servers = pgTable('servers', {
    id: text('id').primaryKey(),
    category: text('category'),
    log_channel: text('log_channel'),
    mod_role: text('mod_role'),
    message: text('message'),
    locale: text('locale').default('en').$type<Languages>(),
    token: text('token').unique(),
})

export const tickets = pgTable('tickets', {
    id: serial('id').primaryKey(),
    created_by: text('created_by'),
    server: text('server').references(() => servers.id),
})