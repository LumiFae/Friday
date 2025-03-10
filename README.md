# Friday

Welcome to Friday, the global Discord bot that allows users to connect their Steam accounts to Discord
and communicate with online game servers to be able to make tickets from an in-game report.

### Supported Games

-   SCP: Secret Laboratory

More in the future, check out our [Discord](https://discord.gg/uZaTYww7hN) for more information and to be able to make suggestions!

## Installation

1. Add the bot to your Discord by using the invite link: [Friday Invite Link](https://discord.com/oauth2/authorize?client_id=1276540007091540099)
2. Run /setup in your Discord server to get your token.
3. Download the relevant plugin using the resource given to you.
4. Install the plugin how you usually would any plugin
5. Edit the config to add your token
6. Test if it works by connecting your Steam account to your Discord and making an in-game report.
7. Done!

## Connecting / Disconnecting Steam

To connect your Steam account to Discord, you must first run the command `/connect` in the Discord server.
This will generate you a link which will allow you to connect your Steam account to Discord.
Go to this link, it will require you to log in with your Steam account, and then it will redirect you back to my website,
if everything worked well, it will say so.

To disconnect your Steam account from Discord, you must run the command `/disconnect` in the Discord server.

## Commands

- `/config` - To configure your server
- `/help` - To get all the commands
- `/settings` - To change your user settings
- `/discord` - To get the support Discord's invite link
- `/profile` - To get yours or another person's profile
- `/setup` - To set up the Discord server
- `/connect` - Connect your Steam account to Discord
- `/disconnect` - Disconnect your existing Steam account connection
- `/adduser` - Add a user to a ticket
- `/close` - Close a ticket
- `/delete` - Delete a ticket
- `/removeuser` - Remove a user from a ticket

## Locales

As of writing, there is only English support, but if you wanted to add your own, copy the `en.json` from `locales` and paste it as a copy, rename it
to the locale code of what language you are editing for and then change the translations yourself. You will then have to change
the language type in `src/schema.ts` to include your language code. After you deploy, or make a pull request, the bot should get
access to your newly added language whenever it merges/gets deployed.

## Privacy Concerns

Friday stores no personal information about you. All information stored for Friday is stored safely and none of the contents will be given to a third party, unless there is a legal order.

## Self Hosting

Download this GitHub repository and make your Discord bot, if you don't know how to do that, then I would recommend not doing this.
If you do know how to then copy the `.env.example` file into a `.env` file and edit all the values correctly.

You will need a PostgreSQL database for this.

Install all the NPM dependencies and then start the bot with `npm start`, if you have all the `.env` variables correct
the bot will start.