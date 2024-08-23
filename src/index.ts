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

app.get('/', (req, res) => {
    res.send(`Welcome to Friday, this page looks empty but it's not supposed to be for much. If you're looking for the source code, then you can go here <a href="https://github.com/JayXTQ/Friday">https://github.com/JayXTQ/Friday</a> to view it.
<br>
Terms of Service:

When referring to "Friday", "we", "our", "us", "the bot", "the service", "the application", "the app", "the website", "the site", "the platform", "the service", "the software", "the program", "the service", it is referring to the bot, Friday.
When referring to "you", "your", "the user", "the users", it is referring to the user of the bot, Friday.
When referring to "the server", "the servers", it is referring to the server(s) that the bot, Friday, is in.

When using Friday, you agree to the following terms:
1. You will use Friday in it's intended purpose, you will not try break anything on purpose for us to have to repair.
2. You will not use Friday to break Discord's Terms of Service.
3. You will not use Friday to break any laws.
4. You will not use Friday to break the terms of use of any service that the bot is integrated with, e.g. Steam, SCP: Secret Laboratory.

If you break any of these terms, we reserve the right to ban you from using Friday, and we reserve the right to report you to any relating service if you broke something relating to them as well.
<br>
Privacy Policy:

Friday is open source and the database schemas are public, so you can see what we store about you. We store the following information core information:
- Your Discord ID
- Your preferred language
- Your Steam ID (64 version) (if you have linked your Steam account to Friday)
- Your server's ID (if Friday is in the server)
- Your server's token (if you've set up Friday in your server, this allows you to communicate with our API)

The rest of the information we store can be found in the schemas in the source code.
All data used by Friday is stored by me (JayXTQ) and is not shared with anyone else. The data is stored on a PostgreSQL database hosted on my own server.
`.replace(/\n/g, "<br>"));
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
});
