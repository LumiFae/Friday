import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../../types/discord";

export default {
    name: "connect",
    role: "CHAT_INPUT",
    description: "Connect your Steam account to the bot",
    run: async (interaction, serverLocale, userLocale) => {
        const linkButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('Connect')
            .setURL(
                `https://u8w8ws8.apps.jayxtq.xyz/auth?clientid=${interaction.user.id}`,
            );
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            linkButton,
        );

        await interaction.reply({
            content: userLocale.get((lang) => lang.connect.returns),
            ephemeral: true,
            components: [row],
        });
    },
} satisfies Command;
