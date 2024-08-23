import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../../../types/discord";
import { commands } from "../../../index";
import { embed } from "../../../utils/discord";
import { replacement } from "../../../locales";

export default {
    name: "help",
    role: "CHAT_INPUT",
    description: "Get help with the bot!",
    run: async (interaction, serverLocale, userLocale) => {
        const embed_ = embed()
            .setTitle(userLocale.get((lang) => lang.help.embeds.title))
            .setDescription(
                userLocale.get((lang) => lang.help.embeds.description),
            );

        let fields: { name: string; value: string }[] = [];

        for (const [name, command] of commands) {
            if (command.role === "CHAT_INPUT")
                fields.push({ name: name, value: command.description });
        }

        let pagify = false;

        if (fields.length > 10) {
            const pageCount = Math.ceil(fields.length / 10);
            pagify = true;
            fields = fields.slice(0, 10);
            embed_.setFooter({
                text: replacement(
                    userLocale.get((lang) => lang.help.page_count),
                    "1",
                    pageCount.toString(),
                ),
            });
        }

        embed_.addFields(fields);

        if (pagify) {
            const previous = new ButtonBuilder()
                .setCustomId("previous")
                .setLabel(userLocale.get((lang) => lang.help.button.previous))
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);
            const next = new ButtonBuilder()
                .setCustomId("next")
                .setLabel(userLocale.get((lang) => lang.help.button.next))
                .setStyle(ButtonStyle.Primary);
            const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
                previous,
                next,
            );
            return await interaction.reply({
                embeds: [embed_],
                components: [row],
                ephemeral: true
            });
        }
        await interaction.reply({ embeds: [embed_], ephemeral: true });
    },
} satisfies Command;
