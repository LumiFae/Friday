import { readdirSync } from "fs";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { Command } from "./types/discord";
import express from "express";
dotenv.config();

if (!process.env.TOKEN) throw Error("You need to provide a token");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

export const commands = new Map<string, Command>();

const eventFolders = readdirSync("./src/events");
for (const folder of eventFolders) {
    switch (folder) {
        case "discord": {
            readdirSync(`./src/events/${folder}`).forEach((file) => {
                import(`./events/${folder}/${file}`).then((event) => {
                    event.default(client);
                });
            });
            break;
        }
        default: {
            readdirSync(`.src/events/${folder}`).forEach((file) => {
                import(`./events/${folder}/${file}`).then((event) => {
                    event.default();
                });
            });
            break;
        }
    }
}

client.login(process.env.TOKEN);

const app = express();

app.use(express.json());

const routeFiles = readdirSync("./src/routes");
for (const file of routeFiles) {
    import(`./routes/${file}`).then((route) => {
        route.default(app, client);
    });
}

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
});
