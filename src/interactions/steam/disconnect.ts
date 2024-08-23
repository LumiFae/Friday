import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../../types/discord";
import {setSteamData} from "../../db";

export default {
    name: "disconnect",
    role: "CHAT_INPUT",
    description: "Disconnect your Steam account from the bot",
    run: async (interaction, serverLocale, userLocale) => {
        await setSteamData(null, interaction.user.id);

        await interaction.reply({
            content: userLocale.get((lang) => lang.disconnect.returns),
            ephemeral: true,
        });
    },
} satisfies Command;
