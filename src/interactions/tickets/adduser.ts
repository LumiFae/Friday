import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    TextChannel,
} from "discord.js";
import { Command } from "../../types/discord";
import { db, getServer } from "../../db";
import { tickets } from "../../schema";
import { eq, sql } from "drizzle-orm";
import { DiscordFetch, embed as embed_ } from "../../utils/discord";
import { replacement } from "../../locales";

export default {
    name: "adduser",
    role: "CHAT_INPUT",
    description: "Adds a user to the ticket",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user to add",
            required: true,
        },
    ],
    contexts: [0],
    run: async (interaction, serverLocale, userLocale) => {
        if (!interaction.guildId || !interaction.channel) return;
        const server = await getServer(interaction.guildId);
        if (!server) return;
        const ticketChannel = (
            await db
                .select()
                .from(tickets)
                .where(eq(tickets.channelId, interaction.channelId))
                .execute()
                .catch(() => [null])
        )[0];
        if (
            !ticketChannel ||
            ticketChannel.closed !== false ||
            !(interaction.channel instanceof TextChannel)
        )
            return interaction.reply({
                content: userLocale.get((lang) => lang.close.invalid_channel),
                ephemeral: true,
            });
        if (
            ticketChannel.invitees.includes(
                interaction.options.getUser("user", true).id,
            )
        )
            return interaction.reply({
                content: userLocale.get((lang) => lang.adduser.invalid_user),
                ephemeral: true,
            });
        await interaction.channel.permissionOverwrites.edit(
            interaction.options.getUser("user", true).id,
            { ViewChannel: true },
        );
        await db
            .update(tickets)
            .set({
                invitees: sql`array_append(${tickets.invitees}, ${interaction.options.getUser("user", true).id})`,
            })
            .where(eq(tickets.channelId, interaction.channelId))
            .execute();
        const embed = embed_()
            .setTitle(serverLocale.get((lang) => lang.adduser.embeds.title))
            .setDescription(
                replacement(
                    serverLocale.get((lang) => lang.adduser.embeds.description),
                    `<@${interaction.options.getUser("user", true).id}>`,
                    `<@${interaction.user.id}>`,
                ),
            );
        await interaction.reply({ embeds: [embed] });
    },
} satisfies Command;
