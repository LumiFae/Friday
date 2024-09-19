import { BaseGuildTextChannel, Client } from "discord.js";
import { Express } from "express";
import { initialiseSteam } from "../utils/steam";
import { db, getLocale, setSteamData } from "../db";
import { users, tickets as ticketSchema } from "../schema";
import { eq } from "drizzle-orm";
import { DiscordFetch } from "../utils/discord";
import { Locales, replacement } from "../locales";

export default function (app: Express, client: Client) {
    app.get("/auth/callback", async (req, res) => {
        const clientid = req.query.clientid;
        if (!clientid) return res.status(400).send("No clientid provided");
        if (typeof clientid !== "string")
            return res.status(400).send("Invalid clientid provided");
        const actualClientId = (
            await db
                .select()
                .from(users)
                .where(eq(users.secondary_id, clientid))
                .execute()
                .catch(() => [null])
        )[0]?.id;
        if (!actualClientId)
            return res.status(400).send("Invalid clientid provided");
        const url = new URL(
            req.protocol + "://" + req.get("host") + req.originalUrl,
        );
        const steam = await initialiseSteam(url, clientid);
        const data = await steam.authenticate(req);
        const steamid = data.steamid;
        await setSteamData(steamid, actualClientId);
        const tickets = await db
            .select()
            .from(ticketSchema)
            .where(eq(ticketSchema.steamid, steamid))
            .execute()
            .catch(() => []);
        for (const ticket of tickets) {
            if (!ticket.channelId || ticket.closed) continue;
            await db
                .update(ticketSchema)
                .set({ created_by: actualClientId })
                .where(eq(ticketSchema.id, ticket.id))
                .execute();
            const channel = await new DiscordFetch(client).channel(
                ticket.channelId as string,
            );
            if (
                !channel ||
                !channel.isTextBased() ||
                !(channel instanceof BaseGuildTextChannel)
            )
                continue;
            await channel.permissionOverwrites.create(actualClientId, {
                ViewChannel: true,
            });
            await channel.send(
                replacement(
                    new Locales(await getLocale(ticket.server, true)).get(
                        (lang) => lang.authcallback.claimed,
                    ),
                    `<@${actualClientId}>`,
                    ticket.steamid,
                ),
            );
        }
        return res
            .status(200)
            .send("Authenticated, you may close this window now");
    });
}
