import { Client, Interaction } from "discord.js";
import { commands } from "../..";
import { Locales } from "../../locales";
import { db, getLocale } from "../../db";

export default async function (client: Client) {
    client.on("interactionCreate", async (interaction) => {
        let finder: string;
        if (!("commandName" in interaction)) {
            finder = interaction.customId;
        } else {
            finder = interaction.commandName;
            interaction.isAutocomplete() ? (finder += "-autocomplete") : finder;
        }
        const command = commands.get(finder);
        if (!command) return;
        console.log(`Executing interaction ${finder}...`);
        const serverLocale = new Locales(
            await getLocale(interaction.guildId, true),
        );
        const userLocale = new Locales(
            await getLocale(interaction.user.id, false),
        );
        try {
            await (
                command.run as (
                    interaction: Interaction,
                    serverLocale: Locales,
                    userLocale: Locales,
                ) => unknown
            )(interaction, serverLocale, userLocale);
            console.log(`Interaction ${finder} executed successfully!`);
        } catch (error) {
            console.log(`Error while executing interaction ${finder}:`);
            console.error(error);
            if (interaction.isCommand()) {
                if (interaction.deferred || interaction.replied)
                    await interaction.editReply({
                        content:
                            "There was an error while executing this command!",
                    });
                else
                    await interaction.reply({
                        content:
                            "There was an error while executing this command!",
                        ephemeral: true,
                    });
            }
        }
    });
}
