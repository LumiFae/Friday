import { TextChannel, ChannelType } from "discord.js";
import { Command } from "../../types/discord";
import { db, getServer } from "../../db";
import { tickets } from "../../schema";
import { eq } from "drizzle-orm";
import { DiscordFetch, embed as embed_, hasModRole } from "../../utils/discord";
import { replacement } from "../../locales";

export default {
    name: "delete",
    role: "CHAT_INPUT",
    description: "Delete a ticket",
    contexts: [0],
    run: async (interaction, serverLocale, userLocale) => {
        if (!interaction.guildId || !interaction.channel) return;
        const server = await getServer(interaction.guildId);
        if (!server || !server.mod_role || !interaction.member) return;
        if (!hasModRole(interaction, server.mod_role))
            return interaction.reply(
                userLocale.get((lang) => lang.no_permission),
            );
        const ticketChannel = await db.query.tickets
            .findFirst({ where: eq(tickets.channelId, interaction.channelId) })
            .execute()
            .catch(() => undefined);
        if (
            !ticketChannel ||
            ticketChannel.closed !== true ||
            !(interaction.channel instanceof TextChannel)
        ) {
            return interaction.reply({
                content: userLocale.get((lang) => lang.delete.invalid_channel),
                ephemeral: true,
            });
        }
        await interaction.reply(userLocale.get((lang) => lang.delete.deleting));
        try {
            await interaction.channel.delete();
        } catch (_) {
            return await interaction.reply({
                content: userLocale.get((lang) => lang.delete.no_permissions),
                ephemeral: true,
            });
        }
        await db
            .delete(tickets)
            .where(eq(tickets.channelId, interaction.channelId))
            .execute();
        if (!server.log_channel) return;
        const logChannel = await new DiscordFetch(interaction.client).channel(
            server.log_channel,
        );
        if (!logChannel || !logChannel.isTextBased()) return;
        const embed = embed_()
            .setTitle(serverLocale.get((lang) => lang.delete.embeds.title))
            .setDescription(
                !ticketChannel.created_by
                    ? replacement(
                          serverLocale.get(
                              (lang) => lang.delete.embeds.description,
                          ),
                          `\`${ticketChannel.ticketNo}\``,
                          `<@${interaction.user.id}>`,
                      )
                    : replacement(
                          serverLocale.get(
                              (lang) => lang.delete.embeds.description_user,
                          ),
                          `\`${ticketChannel.ticketNo}\``,
                          `<@${ticketChannel.created_by}>`,
                          `<@${interaction.user.id}>`,
                      ),
            );
        // @NotKeira - Start
        // --- Ingame ticket thread logging ---
        let thread;
        if (
            logChannel.type === ChannelType.GuildText ||
            logChannel.type === ChannelType.GuildAnnouncement
        ) {
            // Try to find thread by ID or name from config
            thread =
                logChannel.threads.cache.get(server.ingame_ticket_thread!) ||
                logChannel.threads.cache.find(
                    (t) =>
                        t.name === server.ingame_ticket_thread && !t.archived,
                );
            if (!thread) {
                thread = await logChannel.threads.create({
                    name: server.ingame_ticket_thread || "Ingame SCP Tickets",
                    autoArchiveDuration: 1440,
                    reason: `Ticket logs for ingame tickets`,
                });
            }
        }
        // --- End thread logic ---
        if (thread) {
            await thread.send({ embeds: [embed] });
        } else if (
            logChannel.type === ChannelType.GuildText ||
            logChannel.type === ChannelType.GuildAnnouncement
        ) {
            await logChannel.send({ embeds: [embed] });
        }
    },
} satisfies Command;
