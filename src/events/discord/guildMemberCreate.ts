import { BaseGuildTextChannel, Client } from "discord.js";
import { Locales, replacement } from "../../locales";
import { db, getLocale, getUser } from "../../db";
import { tickets as ticketSchema } from "../../schema";
import { eq } from "drizzle-orm";
import { DiscordFetch } from "../../utils/discord";

export default async function (client: Client) {
    client.on("guildMemberAdd", async (member) => {
        const user = await getUser(member.id)
        if(!user) return;
        const tickets = await db.select().from(ticketSchema).where(eq(ticketSchema.created_by, user.id)).execute();
        for(const ticket of tickets){
            if(!ticket.channelId) continue;
            const channel = await new DiscordFetch(client).channel(ticket.channelId);
            if(!channel || !(channel instanceof BaseGuildTextChannel)) continue;
            await channel.permissionOverwrites.create(user.id, {
                ViewChannel: true
            });
            const serverLocale = new Locales(
                await getLocale(channel.guild.id, true)
            )
            await channel.send(replacement(serverLocale.get((lang) => lang.guildjoin.claimed), `<@${member.id}>`, user.steamid as string));
        }
    });
}
