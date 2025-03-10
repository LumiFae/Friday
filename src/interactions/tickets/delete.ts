import {
    TextChannel,
} from "discord.js";
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
        if(!hasModRole(interaction, server.mod_role)) return interaction.reply(userLocale.get((lang) => lang.no_permission))
        const ticketChannel = await db.query.tickets.findFirst({ where: eq(tickets.channelId, interaction.channelId) }).execute().catch(() => undefined);
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
            await interaction.channel.delete()
        } catch (_) {
            return await interaction.reply({ content: userLocale.get((lang) => lang.delete.no_permissions), ephemeral: true });
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
        await logChannel.send({ embeds: [embed] });
    },
} satisfies Command;
