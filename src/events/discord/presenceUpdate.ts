import { ActivityType, Client } from "discord.js";

export default async function (client: Client) {
    client.on("presenceUpdate", async (_, newPresence) => {
        if(!newPresence.user || !client.user) return;
        if(newPresence.user.id === client.user.id) {
            client.user?.setPresence({
                activities: [
                    { name: "the report button", type: ActivityType.Watching },
                ],
            });
        }
    });
}
