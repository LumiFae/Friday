import { Client } from 'discord.js';
import { Express } from 'express';
import { initialiseSteam } from '../utils/steam';
import {db, setSteamData} from "../db";
import {users} from "../schema";
import {eq} from "drizzle-orm";

export default function (app: Express, client: Client) {
    app.get('/auth/return', async (req, res) => {
        const clientid = req.query.clientid;
        if (!clientid) return res.status(400).send('No clientid provided');
        if (typeof clientid !== 'string')
            return res.status(400).send('Invalid clientid provided');
        const actualClientId = (await db.select().from(users).where(eq(users.secondary_id, clientid)).execute().catch(() => [null]))[0]?.id;
        if (actualClientId !== clientid) return res.status(400).send('Invalid clientid provided');
        const url = new URL(
            req.protocol + '://' + req.get('host') + req.originalUrl,
        );
        const steam = await initialiseSteam(url, clientid);
        const data = await steam.authenticate(req);
        const steamid = data.steamid;
        await setSteamData(steamid, actualClientId);
        return res
            .status(200)
            .send('Authenticated, you may close this window now');
    });
}