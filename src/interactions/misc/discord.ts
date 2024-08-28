import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../../types/discord";
import { getUser } from "../../db";

export default {
    name: "discord",
    role: "CHAT_INPUT",
    description: "Connect your Steam account to the bot",
    run: async (interaction, serverLocale, userLocale) => {
        const user = await getUser(interaction.user.id);
        if (!user)
            return await interaction.reply({
                content: userLocale.get((lang) => lang.connect.error),
                ephemeral: true,
            });
        const linkButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Connect")
            .setURL(
                `https://friday.jayxtq.xyz/auth?clientid=${user.secondary_id}`,
            );
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            linkButton,
        );

        await interaction.reply({
            content: "https://discord.gg/uZaTYww7hN",
            ephemeral: true,
        });
    },
} satisfies Command;
