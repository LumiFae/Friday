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
import { servers, users } from "../../../schema";
import { languages } from "../../../locales";
import type { Languages } from "../../../schema";

export default {
    name: "settings",
    role: "CHAT_INPUT",
    description: "Set user options on the bot",
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
    run: async (interaction, serverLocale, userLocale) => {
        const option = interaction.options.getString("option");
        const value = interaction.options.getString("value");
        const standard = embed()
            .setTitle(
                userLocale.get((lang) => lang.settings.embeds.standard.title),
            )
            .setDescription(
                userLocale.get(
                    (lang) => lang.settings.embeds.standard.description,
                ),
            )
            .addFields(
                Object.values(
                    userLocale.getObject(
                        (lang) => lang.settings.config_option_names,
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
                    (lang) => lang.settings.config_option_names,
                ),
            ).includes(option)
        ) {
            return await interaction.reply({
                content: userLocale.get((lang) => lang.settings.invalid_option),
            });
        }
        switch (option) {
            case "locale": {
                if (!Object.keys(languages).includes(value)) {
                    return await interaction.reply({
                        content: userLocale.get(
                            (lang) => lang.settings.invalid_value,
                        ),
                    });
                }
                const valueTyped = value as Languages;
                await db
                    .insert(users)
                    .values({ id: interaction.user.id, locale: valueTyped })
                    .onConflictDoUpdate({
                        target: servers.id,
                        set: { locale: valueTyped },
                    });
                break;
            }
        }
        await interaction.reply({
            content: userLocale.get((lang) => lang.config.success),
        });
    },
} satisfies Command;
