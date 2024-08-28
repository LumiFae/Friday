import {
    CategoryChannel,
    Client,
    ChannelType,
    OverwriteResolvable,
} from "discord.js";
import { Express } from "express";
import { initialiseSteam } from "../utils/steam";
import { db, getUser } from "../db";
import { servers, tickets } from "../schema";
import { eq } from "drizzle-orm";
import { DiscordFetch, embed as embed_ } from "../utils/discord";
import { Locales, replacement } from "../locales";

export default function (app: Express, client: Client) {
    app.post("/report", async (req, res) => {
        const auth = req.headers.authorization;
        const body = req.body as {
            reporterName: string;
            reporterId: string;
            reportedName: string;
            reportedId: string;
            reason: string;
            serverName: string;
        };
        if (!auth) return res.status(400).send("No token provided");
        const token = auth.split(" ")[1];
        const server = (
            await db
                .select()
                .from(servers)
                .where(eq(servers.token, token))
                .execute()
                .catch(() => [null])
        )[0];
        if (!server) return res.status(401).send("Invalid token");
        const guild = await new DiscordFetch(client).guild(server.id);
        if (!guild) return res.status(400).send("Invalid guild");
        if(!server.category) return res.status(400).send("No category set");
        const category = await new DiscordFetch(client).channel(server.category);
        if (!category) return res.status(400).send("Invalid category");
        if (category.type !== 4)
            return res.status(400).send("Invalid category");

        let discordUserId = await getUser(body.reportedId, true);
        if (
            discordUserId &&
            !(await new DiscordFetch(client).member(
                server.id,
                discordUserId.id,
            ))
        )
            discordUserId = null;
        const ticketInfo = (
            await db
                .insert(tickets)
                .values({
                    created_by: discordUserId?.id || null,
                    server: server.id,
                })
                .returning()
                .execute()
                .catch(() => [null])
        )[0];
        if (!ticketInfo) return res.status(500).send("Failed to create ticket");

        const permissionOverwrites: OverwriteResolvable[] = [
            {
                id: guild.roles.everyone.id,
                allow: [
                    "EmbedLinks",
                    "AttachFiles",
                    "ReadMessageHistory",
                    "SendMessages",
                ],
                deny: "ViewChannel",
            },
            {
                id: client.user?.id as string,
                allow: "ViewChannel",
            },
        ];
        if (server.mod_role)
            permissionOverwrites.push({
                id: server.mod_role,
                allow: "ViewChannel",
            });
        if (discordUserId)
            permissionOverwrites.push({
                id: discordUserId.id,
                allow: "ViewChannel",
            });

        const channel = await category.guild.channels
            .create({
                name: `ticket-${makeNumber4Chars(ticketInfo.id)}`,
                type: ChannelType.GuildText,
                parent: category,
                permissionOverwrites,
            })
            .catch(() => null);
        if (!channel) return res.status(500).send("Failed to create channel");
        await db
            .update(tickets)
            .set({ channelId: channel.id })
            .where(eq(tickets.id, ticketInfo.id))
            .execute()
            .catch(() => null);
        const serverLocale = new Locales(server.locale);
        const embed = embed_().setTitle(
            serverLocale.get((lang) => lang.ticket.embeds.title),
        );
        const embedFields: { name: string; value: string }[] = [];
        const embedFieldNames = serverLocale.getObject(
            (lang) => lang.ticket.embeds.field_names,
        );
        for (const field of Object.keys(embedFieldNames)) {
            const value = embedFieldNames[field];
            switch (field) {
                case "user": {
                    embedFields.push({
                        name: value,
                        value: `${body.reportedName} (${body.reportedId})`,
                    });
                    break;
                }
                case "reason": {
                    embedFields.push({
                        name: value,
                        value: body.reason,
                    });
                    break;
                }
                case "reporter": {
                    embedFields.push({
                        name: value,
                        value: `${body.reporterName} (${body.reporterId})\nDiscord: ${discordUserId ? `<@${discordUserId}>` : serverLocale.get((lang) => lang.ticket.embeds.no_user)}`,
                    });
                    break;
                }
                case "server": {
                    embedFields.push({
                        name: value,
                        value: body.serverName ? body.serverName.replace(/<[^{}]*>/g, " ").replace(/  +/g, ' ') : "Unknown",
                    });
                }
            }
        }
        embed.addFields(embedFields);

        await channel.send({
            content: discordUserId
                ? server.message
                    ? replacement(server.message, `<@${discordUserId}>`)
                    : replacement(
                          serverLocale.get(
                              (lang) => lang.ticket.default_message,
                          ),
                          `<@${discordUserId}>`,
                      )
                : serverLocale.get(
                      (lang) => lang.ticket.default_message_no_user,
                  ),
            embeds: [embed],
        });

        res.status(200).send(`Report created under #ticket-${makeNumber4Chars(ticketInfo.id)}`);
    });
}

function makeNumber4Chars(number: number): string {
    return number.toString().padStart(4, "0");
}
