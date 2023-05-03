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
        var arr1 = new Array();
        arr1.push("Human:")
        // AI bot setup
        const cohere = require('cohere-ai');
        cohere.init(process.env.APIKEY)
        const generateResponse = await cohere.generate({
            model: "base-light",
            prompt: `This is a discussion between a human and Reexerted Cyclops. 
            Reexerted Cyclops is very nice and empathetic, but he only responds one time, and no further questions are asked after that.
            
            Human: ${interaction.options.data.find(arg => arg.name === 'question').value}
            Reexerted Cyclops:`,
            temperature: 0.5,
            max_tokens: 150,
            presence_penalty: 0.5,
            frequency_penalty: 1.0,
            stop_sequences: arr1,
          });
        const generations = generateResponse.body.generations[0].text;
        if(generations.endsWith("Human:"))
        {
            var text = generations.slice(0, -6);
        }
        else
        {
            var text = generations;
        }
        //console.log(generations);
        try
        {
            await interaction.reply({content: text })
        }

        catch (err) {
            console.log(err);
            interaction.reply({ content: `Something went wrong!\nERROR: ${err}` });
        }
    }
}
