import { Client } from 'discord.js';
import { Express } from 'express';
import { initialiseSteam } from '../utils/steam';

export default function (app: Express, client: Client) {
    app.get('/auth', async (req, res) => {
        const clientid = req.query.clientid;
        if (!clientid) return res.status(400).send('No clientid provided');
        if (typeof clientid !== 'string')
            return res.status(400).send('Invalid clientid provided');
        const url = new URL(
            req.protocol + '://' + req.get('host') + req.originalUrl,
        );
        const steam = await initialiseSteam(url, clientid);
        const redirect = await steam.getRedirectUrl();
        return res.redirect(redirect);
    });
}