const Discord = require("discord.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
    .setName(`question`)
    .setDescription(`Ask something to the all-knowing Reexerted-Cyclops!`)
    .addStringOption(option => option.setName('question')
        .setDescription('The thing you wanna ask')
        .setRequired(true)),
    permissions: 0,

    async execute(interaction) {
        // AI bot setup
        const cohere = require('cohere-ai');
        cohere.init(process.env.APIKEY)
        const generateResponse = await cohere.generate({
            model: "base-light",
            prompt: `${interaction.options.data.find(arg => arg.name === 'question').value}?`,
            temperature: 0.5,
            max_tokens: 100,
            presence_penalty: 1.0,
            frequency_penalty: 1.0,
          });
        const generations = generateResponse.body.generations[0].text;
        //console.log(generations);
        try
        {
            await interaction.reply({content: generations })
        }

        catch (err) {
            console.log(err);
            interaction.reply({ content: `Something went wrong!\nERROR: ${err}` });
        }
    }
}
