import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../../types/discord";
import { getUser } from "../../db";
import { DiscordFetch, embed as embed_ } from "../../utils/discord";
import { getPlayerSummaries } from "../../utils/steam";
import { replacement } from "../../locales";
import ids from "../../../ids.json"

export default {
    name: "profile",
    role: "CHAT_INPUT",
    description: "View yours, or someone else's profile",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user to view the profile of",
            required: false,
        },
    ],
    contexts: [0],
    run: async (interaction, serverLocale, userLocale) => {
        if(!interaction.guildId) return;
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await new DiscordFetch(interaction.client).member(interaction.guildId, user.id);
        if(!member) return;
        const userDb = await getUser(user.id);

        const steamData = userDb?.steamid ? (await getPlayerSummaries(userDb.steamid))[0] : null;
        const otherConnections: string[] = Object.entries(ids)
            .map(([key, value]) => value === user.id ? key : undefined)
            .filter((value): value is string => value !== undefined);

        const embed = embed_()
            .setAuthor({ name: generateEmoji(member.presence?.status || 'offline') + user.tag, url: member.avatarURL() || user.avatarURL() || undefined })
            .setThumbnail(member.avatarURL() || user.avatarURL() || 'https://archive.org/download/discordprofilepictures/discordblue.png')
            .addFields([
                {
                    name: 'Steam',
                    value: !!steamData ? `[${steamData.personaname}](${steamData.profileurl})` : userLocale.get((lang) => lang.profile.no_steam),
                },
                {
                    name: userLocale.get((lang) => lang.profile.other_connections),
                    value: otherConnections.length ? otherConnections.join(', ') : userLocale.get((lang) => lang.profile.no_connections),
                }
            ])
            .setFooter({ text: replacement(userLocale.get((lang) => lang.profile.footer), user.id) });


        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
} satisfies Command;

function generateEmoji(status: string) {
    switch(status) {
        case 'online':
            return '🟢';
        case 'idle':
            return '🟡';
        case 'dnd':
            return '🔴';
        case 'offline':
            return '⚫';
        case 'invisible':
            return '⚫';
        default:
            return '❔';
    }
}