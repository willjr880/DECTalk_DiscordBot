# DECTalk_DiscordBot
DECTalk for your Discord Voice Chat server!

This is a Discord.js bot that provides dectalk to your Discord's voice chat server. It runs in a docker container. 

It requires DECTalk_web and is configured by default to run in the same docker network as it (dectalk_net, http://dectalk_web:3000)

It will permanently join your voice chat and will respond to anyones request who has access to the bot (usually everyone by default.)

## Install:

* Create a discord 'application' in the developer portal (https://discord.com/developers/applications)
* Under Bot section generate a Token and store it somewhere safe.
* Under OAuth2 > URL Generator, give select ``bot`` and ``applications.commands`` scopes and ``Connect`` and ``Speak`` voice permissions.
* Copy the URL and paste it in to your browser. Have it join the server you are wanting DECTalk functionality on.
* Clone this repository.
* Edit docker-compose.yml you'll need to provide the bot token, the DECTalk_web service URL among other things. More info provided in the file.
* docker-compose up -d
* Verify your bot comes online and joins the voice channel.

## Usage

```/dectalk [DECTalk data here including phonemes]```
