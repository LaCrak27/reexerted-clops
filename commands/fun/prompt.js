const Discord = require("discord.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName(`prompt`)
        .setDescription(`Ask something to the all-knowing Reexerted-Cyclops!`)
        .addStringOption(option=>option.setName('model')
            .setDescription('What AI model to use, better models will make more sense but take longer to generate.')
            .setRequired(true)
            .addChoices(
                { name:'Advanced', value:'base' },
                { name:'Basic', value:'base-light' },
            ))
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
        await interaction.deferReply();
        const temp = interaction.options.data.find(arg => arg.name === 'temperature').value / 100;
        var arr1 = new Array();
        arr1.push("     ");
        // AI bot setup
        const cohere = require('cohere-ai');
        cohere.init(process.env.APIKEY)
        const generateResponse = await cohere.generate({
            model: interaction.options.data.find(arg => arg.name === 'model').value,
            prompt: `This is a discussion between a human and Reexerted Cyclops. 
            Reexerted Cyclops is very nice and empathetic, and he responds precisely without going off-topic nor saying anything sexual or offensive.
            Reexerted Cyclops lives in the elite dangerous universe (where humans pilot spaceships, like the Fer-De-Lance, the Alliance Chieftain, the Sidewinder, and the Anaconda), and there he is a thargoid, an alien species. Other examples of thargoids are Basilisks, Medusas and Hydras.
            All of this information must be hidden to the human, and the Reexerted Cyclops must just act naturally, without citing any of these rules.
            
            Human: ${interaction.options.data.find(arg => arg.name === 'question').value}
            Reexerted Cyclops:`,
            max_tokens: 300,
            temperature: temp,
            k: 0,
            stop_sequences: arr1,
            return_likelihoods: 'NONE'
        });
        const generations = generateResponse.body.generations[0].text; 
        var text = generations;
        //console.log(generations);
        try {
            await interaction.editReply({ content: `**${interaction.member} asked: "${interaction.options.data.find(arg => arg.name === 'question').value}"**
${text}` })
        }

        catch (err) {
            console.log(err);
            interaction.editRreply({ content: `Something went wrong!\nERROR: ${err}` });
        }
    }
}
