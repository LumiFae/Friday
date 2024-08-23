import {Client, EmbedBuilder} from "discord.js";

export function embed() {
    return new EmbedBuilder().setColor('#0099ff');
}

export class DiscordFetch {
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    async guild(id: string){
        return this.client.guilds.cache.get(id) || await this.client.guilds.fetch(id).catch(() => null);
    }

    async channel(id: string){
        return this.client.channels.cache.get(id) || await this.client.channels.fetch(id).catch(() => null);
    }

    async user(id: string) {
        return this.client.users.cache.get(id) || await this.client.users.fetch(id).catch(() => null);
    }

    async member(guild: string, id: string){
        const g = await this.guild(guild);
        return g?.members.cache.get(id) || await g?.members.fetch(id).catch(() => null) || null;
    }

    async role(guild: string, id: string){
        const g = await this.guild(guild);
        return g?.roles.cache.get(id) || g?.roles.fetch(id).catch(() => null) || null;
    }
}