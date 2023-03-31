const config = require('./config.js');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes, VoiceBasedChannel, SlashCommandBuilder } = require('discord.js');

const cooldown = new Set();
const cooldownTime = 5000;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// Log in to Discord with your client's token
client.login(config.botToken);

// Create a rest instance (for registering tts command)
const rest = new REST({ version: '10' }).setToken(config.botToken);

//build TTS command
const commands = [];
const command = {
        data: new SlashCommandBuilder()
                .setName('dectalk')
                .setDescription('Send text to dectalk bot (phoneme data allowed)')
                .addStringOption( option =>
		   option.setName('message')
                      .setDescription('The message')
		      .setRequired(true)),
	async execute(interaction) {
		const text = interaction.options.getString('message');
		if (cooldown.has(interaction.user.id)) {
    			/// If the cooldown did not end
    			interaction.reply({ content: "Please wait for the 5 second cooldown to end and try again", ephemeral: true });
  		} else {
    			/// Else give the reply
			addToQueue(text);
			interaction.reply({ content: "Message sent to queue!", ephemeral: true });
			//now, set cooldown
			cooldown.add(interaction.user.id);
        			setTimeout(() => {
          				// Removes the user from the set after 1 minute
          				cooldown.delete(interaction.user.id);
        			}, cooldownTime);
    		}
	},
};
commands.push(command.data.toJSON());
client.commands = new Collection();
client.commands.set(command.data.name, command);

// Deploy command
(async () => {
        try {
                console.log(`Started refreshing ${commands.length} application (/) commands.`);

                // The put method is used to fully refresh all commands in the guild with the current set
                const data = await rest.put(
                        Routes.applicationGuildCommands(config.appID, config.guildID),
                        { body: commands },
                );

                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
                console.error(error);
        }
})();


const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, StreamType, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');

const player = createAudioPlayer();

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
        const channel = client.channels.cache.get(config.channelID);
        const connection = joinVoiceChannel({
	   channelId: channel.id,
	   guildId: channel.guild.id,
	   adapterCreator: channel.guild.voiceAdapterCreator,
           selfDeaf: false,
        });
const subscription = connection.subscribe(player);

});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error('No command matching ${interaction.commandName} was found.');
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});


//tts message queue adapted from my twitch integration example
const ServiceURL = config.serviceURL;
const ServiceAPIKey = config.APIKey;
const IncludeDisplayName = true; // "(DisplayName) Says: " will be prepended before the text
const PollRate = 1000

let ttsQueueArray = [];
let ttsPlaying = false;
let theQueue = setInterval(checkQueue, PollRate);

player.on(AudioPlayerStatus.Playing, () => {
	ttsPlaying = true;
});

player.on(AudioPlayerStatus.Idle, () => {
	ttsPlaying = false;
});

function addToQueue(text) {
	ttsQueueArray.push(text);
}

function checkQueue() {
  if (ttsQueueArray.length == 0) {
	return;
  }

  if (ttsPlaying == false) {
    speak(ttsQueueArray.shift());
  }
}

function speak(text) {
  let ServiceURLSlash = (ServiceURL.slice(-1) == "/") ? ServiceURL : ServiceURL + "/";
  const src = ServiceURLSlash + "say" + "?text=" + text + "&apikey=" + ServiceAPIKey;
  const resource = createAudioResource( src, {
	inputType: StreamType.Arbitrary,
  });
  player.play(resource);
}

