import { boolean, pgTable, serial, text, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export type Languages = "en" | null;

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    steamid: text("steamid").unique(),
    locale: text("locale").$type<Languages>(),
    secondary_id: uuid("secondary_id").notNull().unique().defaultRandom(),
});

export const servers = pgTable("servers", {
    id: text("id").primaryKey(),
    category: text("category"),
    log_channel: text("log_channel"),
    mod_role: text("mod_role"),
    message: text("message"),
    ping_mods: boolean("ping_mods").notNull().default(false),
    locale: text("locale").$type<Languages>(),
    token: text("token").unique(),
    lastTicketNo: integer("lastTicketNo").notNull().default(0),
});

export type TicketMetadata = {
    reason: string;
    reported: string;
    serverName: string;
}

export const tickets = pgTable("tickets", {
    id: serial("id").primaryKey(),
    ticketNo: integer("ticketNo").notNull(),
    created_by: text("created_by"),
    steamid: text("steamid").notNull(),
    server: text("server").references(() => servers.id),
    invitees: text("invitees")
        .array()
        .notNull()
        .default(sql`'{}'::text[]`),
    channelId: text("channelId").unique(),
    closed: boolean("closed").notNull().default(false),
    metadata: jsonb("metadata").$type<TicketMetadata>()
});

