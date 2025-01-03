import {
    PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../types/discord";
import { embed as embed_ } from "../../utils/discord";
import { db, getServer } from "../../db";
import { servers } from "../../schema";
import { replacement } from "../../locales";

function generateRandomString(length: number): string {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}

export default {
    name: "setup",
    role: "CHAT_INPUT",
    description: "Setup the bot",
    contexts: [0],
    default_member_permissions: PermissionFlagsBits.ManageGuild,
    run: async (interaction, _, userLocale) => {
        if (!interaction.guildId) return;
        const serverDb = await getServer(interaction.guildId);
        if (serverDb && serverDb.token) {
            return await interaction.reply({
                content: userLocale.get((lang) => lang.setup.already_setup),
                ephemeral: true,
            });
        }
        let token = await generateToken(interaction.guildId);
        while (token === null) token = await generateToken(interaction.guildId);
        const embed = embed_()
            .setTitle(userLocale.get((lang) => lang.setup.embeds.title))
            .setDescription(
                replacement(
                    userLocale.get((lang) => lang.setup.embeds.description),
                    token,
                ),
            );

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
} satisfies Command;

async function generateToken(guild: string) {
    const returned = (
        await db
            .insert(servers)
            .values({
                id: guild,
                token: generateRandomString(20),
            })
            .onConflictDoUpdate({
                target: servers.id,
                set: { token: generateRandomString(20) },
            })
            .returning({ token: servers.token })
            .execute()
            .catch(() => [null])
    )[0];
    if (!returned) return null;
    return returned.token;
}
