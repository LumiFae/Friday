import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../../types/discord";
import { embed } from "../../../utils/discord";
import { Locales } from "../../../locales";

export default {
    name: "settings-autocomplete",
    role: "AUTOCOMPLETE",
    run: async (interaction, serverLocale, userLocale) => {
        const option = interaction.options.getFocused(true);
        switch (option.name) {
            case "option": {
                const keys = Object.keys(
                    new Locales("en").getObject(
                        (lang) => lang.settings.config_option_names,
                    ),
                );
                await interaction.respond(
                    keys
                        .filter((key) => key.startsWith(option.value))
                        .map((lang) => ({ name: lang, value: lang })),
                );
            }
        }
    },
} satisfies Command;
