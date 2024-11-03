import { Client, EmbedBuilder, Channel, TextChannel, NewsChannel, Snowflake, Collection, Message } from "discord.js";

export function embed() {
    return new EmbedBuilder().setColor("#0099ff");
}

export class DiscordFetch {
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    async guild(id: string) {
        return (
            this.client.guilds.cache.get(id) ||
            (await this.client.guilds.fetch(id).catch(() => null))
        );
    }

    async channel(id: string): Promise<Channel | null> {
        return (
            this.client.channels.cache.get(id) ||
            (await this.client.channels.fetch(id).catch(() => null))
        );
    }

    async user(id: string) {
        return (
            this.client.users.cache.get(id) ||
            (await this.client.users.fetch(id).catch(() => null))
        );
    }

    async member(guild: string, id: string) {
        const g = await this.guild(guild);
        return (
            g?.members.cache.get(id) ||
            (await g?.members.fetch(id).catch(() => null)) ||
            null
        );
    }

    async role(guild: string, id: string) {
        const g = await this.guild(guild);
        return (
            g?.roles.cache.get(id) ||
            g?.roles.fetch(id).catch(() => null) ||
            null
        );
    }
}

type Nullable<T> = T | null;

export type FetchableChannel = NewsChannel | TextChannel;

function isFetchableChannel(channel: Nullable<Channel>): channel is TextChannel | NewsChannel {
    return channel instanceof TextChannel || channel instanceof NewsChannel;
}

export async function fetchChannel(client: Client, channelID: string | FetchableChannel) {
    const channel = typeof channelID === 'string' ? await client.channels.fetch(channelID) : channelID;
    let messages = new Collection<Snowflake, Message>();

    if (isFetchableChannel(channel)) {
        let channelMessages = await channel.messages.fetch({limit: 100});

        while (channelMessages.size > 0) {
            messages = messages.concat(channelMessages);
            channelMessages = await channel.messages.fetch({
                limit: 100,
                before: channelMessages.last()!.id,
            });
        }
    }

    return messages;
}
