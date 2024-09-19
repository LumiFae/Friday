import { Command } from "../../types/discord";
export default {
    name: "discord",
    role: "CHAT_INPUT",
    description: "Get the Discord server invite link",
    run: async (interaction,) => {
        await interaction.reply({
            content: "https://discord.gg/uZaTYww7hN",
            ephemeral: true,
        });
    },
} satisfies Command;
