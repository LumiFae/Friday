import { ActivityType, BaseGuildTextChannel, Client, Interaction } from "discord.js";
import { commands } from "../..";
import { Locales, formatLocale, replacement } from "../../locales";
import { db, getLocale, getUser } from "../../db";
import { tickets as ticketSchema } from "../../schema";
import { eq } from "drizzle-orm";
import { DiscordFetch } from "../../utils/discord";

export default async function (client: Client) {
    client.on("presenceUpdate", async (oldPresence, newPresence) => {
        if(!newPresence.user || !client.user) return;
        if(newPresence.user.id === client.user.id) {
            client.user?.setPresence({
                activities: [
                    { name: "the report button", type: ActivityType.Watching },
                ],
            });
        }
    });
}
