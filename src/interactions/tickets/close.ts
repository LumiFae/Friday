import {
    AttachmentBuilder,
    Message,
    TextChannel,
} from "discord.js";
import { Command } from "../../types/discord";
import { db, getLocale, getServer } from "../../db";
import { tickets } from "../../schema";
import { eq } from "drizzle-orm";
import { DiscordFetch, embed as embed_, fetchChannel } from "../../utils/discord";
import { Locales, replacement } from "../../locales";

export default {
    name: "close",
    role: "CHAT_INPUT",
    description: "Close a ticket",
    options: [
        {
            type: 3,
            name: "reason",
            description: "The reason for closing the ticket",
            required: false,
        },
    ],
    contexts: [0],
    run: async (interaction, serverLocale, userLocale) => {
        await interaction.deferReply();
        if (!interaction.guildId || !interaction.channel) return;
        const server = await getServer(interaction.guildId);
        if (!server) return;
        const ticketChannel = (
            await db
                .select()
                .from(tickets)
                .where(eq(tickets.channelId, interaction.channelId))
                .execute()
                .catch(() => [null])
        )[0];
        if (!ticketChannel || !(interaction.channel instanceof TextChannel))
            return interaction.reply({
                content: userLocale.get((lang) => lang.close.invalid_channel),
                ephemeral: true,
            });
        if(ticketChannel.closed) return interaction.reply(userLocale.get((lang) => lang.close.already_closed));
        if(ticketChannel.created_by) {
            try {
                await interaction.channel.permissionOverwrites.edit(
                    ticketChannel.created_by,
                    { ViewChannel: false },
                )
            } catch(_) {
                return await interaction.reply({ content: userLocale.get((lang) => lang.close.no_permissions_edit), ephemeral: true });
            }
        }
        for (const invitee of ticketChannel.invitees) {
            await interaction.channel.permissionOverwrites.edit(invitee, {
                ViewChannel: false,
            });
        }
        try {
            await interaction.channel.edit({
                name: `closed-${makeNumber4Chars(ticketChannel.ticketNo)}`,
            });
        } catch (_) {
            return await interaction.reply({
                content: userLocale.get((lang) => lang.close.no_permissions_name),
                ephemeral: true
            })
        }
        await interaction.editReply({
            content: replacement(userLocale.get((lang) => lang.close.closed), `<@${interaction.user.id}>`),
        });

        await db
            .update(tickets)
            .set({ closed: true })
            .where(eq(tickets.channelId, interaction.channelId))
            .execute()
            .catch(() => null);

        const transcript = await generateTranscript(interaction.channel);

        const attachment = new AttachmentBuilder(Buffer.from(transcript), {
            name: `transcript-${makeNumber4Chars(ticketChannel.ticketNo)}.txt`,
        });

        if (ticketChannel.created_by) {
            const user = await new DiscordFetch(interaction.client).user(
                ticketChannel.created_by,
            );
            if (user) {
                const userLocale_ = new Locales(
                    await getLocale(user.id, false),
                );
                await user.send({
                    content: replacement(
                        userLocale_.get((lang) => lang.close.user_closed),
                        interaction.options.getString("reason") ||
                        userLocale_.get((lang) => lang.close.no_reason),
                    ),
                    files: [attachment],
                }).catch(() => null);
            }
        }

        if (!server.log_channel) return;
        const logChannel = await new DiscordFetch(interaction.client).channel(
            server.log_channel,
        );
        if (!logChannel || !logChannel.isTextBased()) return;
        const embed = embed_()
            .setTitle(serverLocale.get((lang) => lang.close.embeds.title))
            .setDescription(
                !ticketChannel.created_by
                    ? replacement(
                          serverLocale.get(
                              (lang) => lang.close.embeds.description,
                          ),
                          `\`${String(ticketChannel.ticketNo)}\``,
                          `<@${interaction.user.id}>`,
                        `\`${interaction.options.getString("reason")}\`` ||
                              "None Provided",
                      )
                    : replacement(
                          serverLocale.get(
                              (lang) => lang.close.embeds.description_user,
                          ),
                            String(ticketChannel.ticketNo),
                          `<@${interaction.user.id}>`,
                          `<@${ticketChannel.created_by}>`,
                          interaction.options.getString("reason") ||
                              serverLocale.get((lang) => lang.close.no_reason),
                      ),
            );
        await logChannel.send({ embeds: [embed], files: [attachment] });
    },
} satisfies Command;

function makeNumber4Chars(number: number): string {
    return number.toString().padStart(4, "0");
}

async function fetchMessages(channel: TextChannel) {
    return await fetchChannel(channel.client, channel);
}

async function generateTranscript(channel: TextChannel) {
    const messages = await fetchMessages(channel);
    let transcript: string[] = [];
    for(const message of messages) {
        const author = message.author;
        const content = message.content;
        const attachments = message.attachments;
        if (!content && (!attachments.size || attachments.size === 0)) continue;
        const timestamp = readableTime(message.createdTimestamp);

        let out = `${author.tag} (${timestamp}): ${content}`;
        if (attachments.size) {
            out += attachments
                .map((attachment) => "\n" + attachment.url)
                .join("");
        }
        if (transcript.includes(out)) continue;
        transcript.push(out);
    }
    transcript = transcript.filter((message) => message !== null);
    return transcript.join("\n\n");
}

function readableTime(time: number) {
    const date = new Date(time);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}
