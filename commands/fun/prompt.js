const Discord = require("discord.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName(`prompt`)
        .setDescription(`Ask something to the all-knowing Reexerted-Cyclops!`)
        .addStringOption(option => option.setName('question')
            .setDescription('The thing you wanna ask')
            .setRequired(true))
        .addIntegerOption(option => option.setName('temperature')
            .setDescription('How crazy the bot goes (0-500, around 50 is recommended)')
            .setMinValue(0)
            .setMaxValue(500)
            .setRequired(true)),
    permissions: 0,

    async execute(interaction) {
        const temp = interaction.options.data.find(arg => arg.name === 'temperature').value / 100;
        var arr1 = new Array();
        arr1.push("   ");
        // AI bot setup
        const cohere = require('cohere-ai');
        cohere.init(process.env.APIKEY)
        const generateResponse = await cohere.generate({
            model: "base-light",
            prompt: `This is a discussion between a human and Reexerted Cyclops. 
            Reexerted Cyclops is very nice and empathetic, and he responds precisely without going off-topic nor saying anything sexual or similar. He also only responds in english, and is not capable of speaking any other languages.
            
            Human: ${interaction.options.data.find(arg => arg.name === 'question').value}
            Reexerted Cyclops:`,
            temperature: temp,
            max_tokens: 150,
            presence_penalty: 0.5,
            frequency_penalty: 1.0,
            stop_sequences: arr1,
        });
        const generations = generateResponse.body.generations[0].text; 
        var text = generations;
        //console.log(generations);
        try {
            await interaction.reply({ content: `**${interaction.member} asked: "${interaction.options.data.find(arg => arg.name === 'question').value}"**
${text}` })
        }

        catch (err) {
            console.log(err);
            interaction.reply({ content: `Something went wrong!\nERROR: ${err}` });
        }
    }
}
