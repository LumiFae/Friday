import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../../types/discord";
import { getUser } from "../../db";

export default {
    name: "discord",
    role: "CHAT_INPUT",
    description: "Get the Discord server invite link",
    run: async (interaction, serverLocale, userLocale) => {
        await interaction.reply({
            content: "https://discord.gg/uZaTYww7hN",
            ephemeral: true,
        });
    },
} satisfies Command;
