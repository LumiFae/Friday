import SteamAuth from "node-steam-openid";
import axios from 'axios'

export async function initialiseSteam(url: URL, clientId: string) {
    const steam = new SteamAuth({
        realm: url.origin,
        returnUrl: `${url.origin}/auth/callback?clientid=${clientId}`,
        apiKey: process.env.STEAM_KEY as string,
    });
    return steam;
}

export async function getPlayerSummaries(...steamIDs: string[]) {
    const response = await axios.get(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_KEY}&steamids=${steamIDs.join(',')}`,
    );

    type Response = {
        steamid: string;
        communityvisibilitystate: number;
        profilestate: number;
        personaname: string;
        commentpermission: number;
        profileurl: string;
        avatar: string;
        avatarmedium: string;
        avatarfull: string;
        avatarhash: string;
        lastlogoff: number;
        personastate: number;
        primaryclanid: string;
        timecreated: number;
        personastateflags: number;
    }[];

    return response.data.response.players as Response;
}