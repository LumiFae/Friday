import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    PermissionFlagsBits,
    CategoryChannel,
} from "discord.js";
import { Command } from "../../../types/discord";
import { DiscordFetch, embed } from "../../../utils/discord";
import { Locales } from "../../../locales";
import { db } from "../../../db";
import { servers } from "../../../schema";
import { languages } from "../../../locales";
import type { Languages } from "../../../schema";

export default {
    name: "config",
    role: "CHAT_INPUT",
    description: "Set options on the bot",
    options: [
        {
            type: 3,
            name: "option",
            description: "The option to set",
            autocomplete: true,
        },
        {
            type: 3,
            name: "value",
            description: "The value to set the option to",
        },
    ],
    default_member_permissions: PermissionFlagsBits.ManageGuild,
    contexts: [0],
    run: async (interaction, serverLocale, userLocale) => {
        if (!interaction.guildId) return;
        const option = interaction.options.getString("option");
        const value = interaction.options.getString("value");
        const standard = embed()
            .setTitle(
                userLocale.get((lang) => lang.config.embeds.standard.title),
            )
            .setDescription(
                userLocale.get(
                    (lang) => lang.config.embeds.standard.description,
                ),
            )
            .addFields(
                Object.values(
                    userLocale.getObject(
                        (lang) => lang.config.config_option_names,
                    ),
                ).map(([key, value]) => ({ name: key, value, inline: true })),
            );
        if (!option || !value) {
            return await interaction.reply({ embeds: [standard] });
        }
        const englishLocale = new Locales();
        if (
            Object.keys(
                englishLocale.getObject(
                    (lang) => lang.config.config_option_names,
                ),
            ).includes(option)
        ) {
            return await interaction.reply({
                content: userLocale.get((lang) => lang.config.invalid_option),
            });
        }
        switch (option) {
            case "category": {
                const category = value.replace("<#", "").replace(">", "");
                const channel = await new DiscordFetch(
                    interaction.client,
                ).channel(category);
                if (!channel || !(channel instanceof CategoryChannel)) {
                    return await interaction.reply({
                        content: userLocale.get(
                            (lang) => lang.config.invalid_value,
                        ),
                    });
                }
                if (
                    channel
                        .permissionsFor(interaction.client.user.id)
                        ?.has(PermissionFlagsBits.ManageChannels) === false
                ) {
                    return await interaction.reply({
                        content: userLocale.get(
                            (lang) => lang.config.no_access_create,
                        ),
                    });
                }
                await db
                    .insert(servers)
                    .values({ id: interaction.guildId, category })
                    .onConflictDoUpdate({
                        target: servers.id,
                        set: { category },
                    });
            }
            case "log_channel": {
                const logChannel = value.replace("<#", "").replace(">", "");
                const channel = await new DiscordFetch(
                    interaction.client,
                ).channel(logChannel);
                if (!channel || !channel.isTextBased() || channel.isDMBased()) {
                    return await interaction.reply({
                        content: userLocale.get(
                            (lang) => lang.config.invalid_value,
                        ),
                    });
                }
                if (
                    channel
                        .permissionsFor(interaction.client.user.id)
                        ?.has(PermissionFlagsBits.SendMessages) === false
                ) {
                    return await interaction.reply({
                        content: userLocale.get(
                            (lang) => lang.config.no_access_send,
                        ),
                    });
                }
                await db
                    .insert(servers)
                    .values({
                        id: interaction.guildId,
                        log_channel: logChannel,
                    })
                    .onConflictDoUpdate({
                        target: servers.id,
                        set: { log_channel: logChannel },
                    });
            }
            case "mod_role": {
                const role = value.replace("<@&", "").replace(">", "");
                const role_ = await new DiscordFetch(interaction.client).role(
                    interaction.guildId,
                    role,
                );
                if (!role_) {
                    return await interaction.reply({
                        content: userLocale.get(
                            (lang) => lang.config.invalid_value,
                        ),
                    });
                }
                await db
                    .insert(servers)
                    .values({ id: interaction.guildId, mod_role: role })
                    .onConflictDoUpdate({
                        target: servers.id,
                        set: { mod_role: role },
                    });
            }
            case "message": {
                await db
                    .insert(servers)
                    .values({ id: interaction.guildId, message: value })
                    .onConflictDoUpdate({
                        target: servers.id,
                        set: { message: value },
                    });
            }
            case "locale": {
                if (!Object.keys(languages).includes(value)) {
                    return await interaction.reply({
                        content: userLocale.get(
                            (lang) => lang.config.invalid_value,
                        ),
                    });
                }
                const valueTyped = value as Languages;
                await db
                    .insert(servers)
                    .values({ id: interaction.guildId, locale: valueTyped })
                    .onConflictDoUpdate({
                        target: servers.id,
                        set: { locale: valueTyped },
                    });
            }
        }
        await interaction.reply({
            content: userLocale.get((lang) => lang.config.success),
        });
    },
} satisfies Command;