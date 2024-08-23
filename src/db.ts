import { Client } from "pg";
import * as schema from "./schema";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { servers, users } from "./schema";
import { eq } from "drizzle-orm";

const client = new Client({ connectionString: process.env.DB_URL });

export let db: NodePgDatabase<typeof schema>;

export async function init() {
    await client.connect();
    db = drizzle(client, { schema });
}

export async function setSteamData(steamid: string | null, clientid: string) {
    await db
        .insert(users)
        .values({ id: clientid, steamid })
        .onConflictDoUpdate({
            target: users.id,
            set: { steamid },
        });
}

export async function getUser(id: string, steam = false) {
    const whereQuery = steam ? eq(users.steamid, id) : eq(users.id, id);
    return (
        await db
            .select()
            .from(users)
            .where(whereQuery)
            .execute()
            .catch(() => [null])
    )[0];
}

export async function getServer(id: string) {
    return (
        await db
            .select()
            .from(servers)
            .where(eq(servers.id, id))
            .execute()
            .catch(() => [null])
    )[0];
}

export async function getLocale(id: string | null, server: boolean) {
    if (!id) return "en";
    const record = server ? await getServer(id) : await getUser(id);
    if (!record) return "en";
    return record.locale;
}
