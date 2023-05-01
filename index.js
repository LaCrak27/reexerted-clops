// Imported Modules
require("dotenv").config();
const { Client, IntentsBitField, EmbedBuilder, Collection } = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const cron = require('node-cron');
const fs = require('fs');

// Discord client setup
const serverIntents = new IntentsBitField(3276799);
const bot = new Client({ intents: serverIntents })

/**
 * Loads command objects from the commands folder
 * @author  (Airom) Airom42
 */
bot.commands = new Collection();
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		command.category = folder;
		if (command.data === undefined) {
			bot.commands.set(command.name, command) // For non-slash commands
		} else {
			bot.commands.set(command.data.name, command) // For slash commands
		}
	}
}

/**
 * Log a discord bot event in the Log Channel
 * @author  (Mgram) Marcus Ingram
 */
async function botLog(embed,severity) {
	let logColor
	switch (severity) {
		case 0:
			logColor = '#42f569'
			break;
		case 1:
			logColor = '#f5bf42'
			break;
		case 2:
			logColor = '#f55142'
			break;
	}
	embed.setColor(logColor)
	.setTimestamp()
	.setFooter({ text: 'Logs'});
	try {
		await bot.channels.cache.get(process.env.LOGCHANNEL).send({ embeds: [embed]})
	} catch {
		console.warn("ERROR: No Log Channel Environment Variable Found, Logging will not work.")
	}
}

/**
 * Deploys Command objects to the Discord API registering any changes
 * @author  (Mgram) Marcus Ingram
 */
async function deployCommands() {
	const commands = [];
	const commandFolders = fs.readdirSync('./commands');
	for (const folder of commandFolders) {
		const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const command = require(`./commands/${folder}/${file}`);
			command.category = folder;
			if (command.data !== undefined) {
				commands.push(command.data.toJSON());
			}
		}
	}
	const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
	
	try {
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDID),
			{ body: commands },
		);

		console.log('✅ Successfully registered application commands');
	} catch (error) {
		console.error(error);
	}
}

/**
 * Event handler for Bot Login, manages post-login setup
 * @author  (Mgram) Marcus Ingram, (Airom42) Airom
 */
bot.once("ready", async() => {
	await deployCommands();
	botLog(new EmbedBuilder().setDescription(`💡 R.Clops is now online! logged in as ${bot.user.tag}`).setTitle(`Warden Online`),2);
	console.log(`✅ R.Clops is now online! logged in as ${bot.user.tag}`)
})


/**
 * Event handler for Slash Commands, takes interaction to test before executing command code.
 * @author  (Mgram) Marcus Ingram
 */
bot.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		const command = bot.commands.get(interaction.commandName);
		if (!command) {
			console.log('WARNING: Unknown command detected.');
			return;
		}
		let args;
		if (interaction.options !== undefined) {
			try {
				args = JSON.stringify(interaction.options.data)
			} catch (err) {
				console.log(`WARNING: Unable to create arguments for legacy command '${interaction.commandName}', this may not affect modern slash commands: ${err}`)
			}
		}
		try {
			botLog(new EmbedBuilder().setDescription(`Command used by ${interaction.user.tag} - Command ` + "`" + `${interaction.commandName}` + "`" + ` with arguments: ` + "`" + `${args}` + "`"),0);
			await command.execute(interaction, args);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

	if (interaction.isButton()) {
		botLog(new EmbedBuilder().setDescription(`Button triggered by user **${interaction.user.tag}** - Button ID: ${interaction.customId}`),0);
		if (interaction.customId.startsWith("submission")) {
			interaction.deferUpdate();
			leaderboardInteraction(interaction);
			return;
		}
		if (interaction.customId.startsWith("fcc")) {
			interaction.deferUpdate();
			fccinteraction(interaction);
			return;
		}
		if (interaction.customId === "platformpc") {
			interaction.deferUpdate();
			interaction.member.roles.add("428260067901571073")
			interaction.member.roles.add("380247760668065802")
			botLog(new EmbedBuilder().setDescription(`Welcome Verification passed - User: **${interaction.user.tag}**`),0)
		} else if (interaction.customId === "platformxb") {
			interaction.deferUpdate();
			interaction.member.roles.add("533774176478035991")
			interaction.member.roles.add("380247760668065802")
			botLog(new EmbedBuilder().setDescription(`Welcome Verification passed - User: **${interaction.user.tag}**`),0)
		} else if (interaction.customId === "platformps") {
			interaction.deferUpdate();
			interaction.member.roles.add("428259777206812682")
			interaction.member.roles.add("380247760668065802")
			botLog(new EmbedBuilder().setDescription(`Welcome Verification passed - User: **${interaction.user.tag}**`),0)
		}
		interaction.member.roles.add("642840406580658218");
		interaction.member.roles.add("642839749777948683");
	}
});

// Audit Logging Events

// Message Deleted by user
bot.on('messageDelete', async message => {
	try {
		botLog(new EmbedBuilder().setDescription(`Message deleted by user: ${message.author}` + '```' + `${message.content}` + '```').setTitle(`Message Deleted 🗑️`),1)
	} catch (err) {
		botLog(new EmbedBuilder().setDescription(`Something went wrong while logging a Deletion event: ${err}`).setTitle(`Logging Error`),2);
	}
})

// Message Updated by user
bot.on('messageUpdate', (oldMessage, newMessage) => {
	if (oldMessage != newMessage && oldMessage.author.id != process.env.CLIENTID) {
		botLog(new EmbedBuilder().setDescription(`Message updated by user: ${oldMessage.author}` + '```' + `${oldMessage}` + '```' + `Updated Message:` + '```' + `${newMessage}` + '```' + `Message Link: ${oldMessage.url}`).setTitle(`Message Updated 📝`),1)
	}
});

// User leaving server
bot.on('guildMemberRemove', member => {
	let roles = ``
	member.roles.cache.each(role => roles += `${role}\n`)
	botLog(new EmbedBuilder()
	.setDescription(`User ${member.user.tag}(${member.displayName}) has left or was kicked from the server.`)
	.setTitle(`User Left/Kicked from Server`)
	.addFields(
		{ name: `ID`, value: `${member.id}`},
		{ name: `Date Joined`, value: `<t:${(member.joinedTimestamp/1000) >> 0}:F>`},
		{ name: `Roles`, value: `${roles}`},
	),2)
})
bot.login(process.env.TOKEN)

//Give role when client joins server
client.on('GuildMemberAdd', member => {
    console.log('User: ' + member.user.username + ' has joined the server!');
    var role = member.guild.roles.cache.find(role => role.name === "Member");
    member.roles.add(role);
});

// General error handling
process.on('uncaughtException', function (err) {
	console.log(`⛔ Fatal error occured:`)
	console.error(err);
	bot.channels.cache.get(process.env.LOGCHANNEL).send({ content: `⛔ Fatal error experienced: ${err}` })
});