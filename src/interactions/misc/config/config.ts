import { ChannelType, PermissionFlagsBits } from "discord.js";
import { Command } from "../../../types/discord";
import { DiscordFetch, embed } from "../../../utils/discord";
import { haveLocale } from "../../../locales";
import { db, getServer } from "../../../db";
import { servers } from "../../../schema";
import { formatLocale } from "../../../locales";
import type { Languages } from "../../../schema";
import { eq } from "drizzle-orm";

export default {
    name: "config",
    role: "CHAT_INPUT",
    description: "Set options on the bot",
    options: [
        {
            type: 1,
            name: "category",
            description: "The category channel for tickets to be created in",
            options: [
                {
                    type: 7,
                    name: "value",
                    description: "The category channel",
                    required: true
                }
            ]
        },
        {
            type: 1,
            name: "log-channel",
            description: "The channel for logs to be sent to",
            options: [
                {
                    type: 7,
                    name: "value",
                    description: "The log channel",
                    required: true
                }
            ]
        },
        {
            type: 1,
            name: "mod-role",
            description: "The moderator role that should be added to tickets",
            options: [
                {
                    type: 8,
                    name: "value",
                    description: "The mod role",
                    required: true
                }
            ]
        },
        {
            type: 1,
            name: "message",
            description: "Change this to edit the default message sent when a ticket is created",
            options: [
                {
                    type: 3,
                    name: "value",
                    description: "The message",
                    required: true
                }
            ]
        },
        {
            type: 1,
            name: "ping-mods",
            description: "Whether to ping mods in the ticket channel when it is created",
            options: [
                {
                    type: 5,
                    name: "value",
                    description: "True for pinging mods, false for not",
                    required: true
                }
            ]
        },
        {
            type: 1,
            name: "locale",
            description: "The language to use for the bot",
            options: [
                {
                    type: 3,
                    name: "value",
                    description: "The language",
                    required: true
                }
            ]
        }
    ],
    default_member_permissions: PermissionFlagsBits.ManageGuild,
    contexts: [0],
    run: async (interaction, _, userLocale) => {
        if (!interaction.guildId) return;
        const subCommand = interaction.options.getSubcommand();
        const server = (await getServer(interaction.guildId)) ?? {
            category: null,
            log_channel: null,
            mod_role: null,
            message: null,
            ping_mods: false,
            locale: haveLocale(formatLocale(interaction.guildLocale))
                ? formatLocale(interaction.guildLocale)
                : "en",
        };
        const configOptionNames = userLocale.getObject(
            (lang) => lang.config.config_option_names,
        );
        const keys = Object.keys(configOptionNames);
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
                keys.map((key) => {
                    let value = server[key];
                    if(key === "category" || key === "log_channel") {
                        value = value ? `<#${value}>` : "Not Set";
                    }
                    if(key === "mod_role") {
                        value = value ? `<@&${value}>` : "Not Set";
                    }
                    if(typeof value === "boolean") {
                        value = value ? "True" : "False";
                    }
                    return {
                        name: configOptionNames[key],
                        value: value ?? "Not Set",
                        inline: true,
                    };
                }),
            );
        if (!subCommand) {
            return await interaction.reply({ embeds: [standard] });
        }

        const value = interaction.options.getString("value", true);
        if(value === 'null' || value === 'none') {
            await db.update(servers).set({ [subCommand.replace("-", "_")]: null }).where(eq(servers.id, interaction.guildId)).execute().catch(() => null);
        }

        switch (subCommand) {
            case "locale": {
                if (!haveLocale(value)) {
                    return await interaction.reply({
                        content: userLocale.get((lang) => lang.config.invalid_value),
                    });
                }
                await db.update(servers).set({ locale: value as Languages }).where(eq(servers.id, interaction.guildId)).execute().catch(() => null);
                break;
            }
            case "category": {
                const channel = await new DiscordFetch(interaction.client).channel(value);
                if(!channel || channel.type !== ChannelType.GuildCategory) {
                    return await interaction.reply({
                        content: userLocale.get((lang) => lang.config.invalid_value),
                    });
                }
                await db.update(servers).set({ category: value }).where(eq(servers.id, interaction.guildId)).execute().catch(() => null);
                break;
            }
            case "log channel": {
                const channel = await new DiscordFetch(interaction.client).channel(value);
                if(!channel || channel.type !== ChannelType.GuildText) {
                    return await interaction.reply({
                        content: userLocale.get((lang) => lang.config.invalid_value),
                    });
                }
                await db.update(servers).set({ log_channel: value }).where(eq(servers.id, interaction.guildId)).execute().catch(() => null);
                break;
            }
            case "mod role": {
                const role = await new DiscordFetch(interaction.client).role(interaction.guildId, value);
                if(!role || !role.editable) {
                    return await interaction.reply({
                        content: userLocale.get((lang) => lang.config.invalid_value),
                    });
                }
                await db.update(servers).set({ mod_role: value }).where(eq(servers.id, interaction.guildId)).execute().catch(() => null);
                break;
            }
            default: {
                await db.update(servers).set({ [subCommand.replace(" ", "_")]: value }).where(eq(servers.id, interaction.guildId)).execute().catch(() => null);
            }
        }

        await interaction.reply({
            content: userLocale.get((lang) => lang.config.success),
        });
    },
} satisfies Command;
