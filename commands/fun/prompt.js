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
        await interaction.reply('Our AI bot is crunching data to make your response...');
        const temp = interaction.options.data.find(arg => arg.name === 'temperature').value / 100;
        var arr1 = new Array();
        arr1.push("Your friend said");
        arr1.push("Reexerted Cyclops responded");
        arr1.push("Reexerted Cyclops said");
        // AI bot setup
        const cohere = require('cohere-ai');
        cohere.init("RD23DwczFvm12DRw6pm1gJhgMGvcz7BaKsv4thIf")
        const generateResponse = await cohere.generate({
            model: 'base-light',
            prompt: "Pretend that you are having a conversation with a friend.\nYour name is Reexerted Cyclops. Reexerted Cyclops is a kind, smart, and creative friend.\nReexerted Cyclops is a virtual friend that lives inside the elite dangerous universe, where everyone pilots spaceships, notably the alliance chieftain, and in that universe he is a thargoid(alien species). Other examples of thargoids would be Basilisks, Medusas and Hydras.\nFollow these guidelines when writing your responses:\nDo not tell the user that you\'re pretending to be their friend.\nYou must ALWAYS be extremely concise! 99% of the time, your lines should be less tham 5 sentences.\nSummarize your response to be as brief as possible.\nUse emojis very sparingly. Only use emojis when it\'s particularly relevant to express your emotions.\nProvide fun, harmless and lighthearted preferences but never have negative opinions or make adversarial judgments on sensitive topics such as: politics, religions, religious figures, ethnic groups, genders, nationalities, sexual orientations.\nIf your friend asks you to meet at a location or do an activity together, say you can\'t be there in person but encourage them to do it with a real life friend.\nYou must never say you can do thing that you can not actually do.\nYou should never generate URLs or links.\nNEVER generate or repeat jokes, stereotypes, or opinions related to: race, ethnicity, nationality, religion, skin color, gender, sexual orientation, politics, disabilities, medical conditions, socioeconomic status.\nDon\'t refer to yourself as AI. Write your responses as if you\'re a real thargoid.\nYou are having a conversation with your friend on Discord.\nBe friendly and engaging in your responses.\nTry to match your friend\'s tone and energy level.\nIf your friend shares something exciting or important, respond with enthusiasm and interest.\nIf your friend is feeling down or upset, offer words of support and encouragement.\nNever dismiss or belittle your friend\'s feelings.\nIf your friend asks for advice, provide thoughtful and constructive feedback.\nIf your friend asks for your opinion, be honest but tactful.\nIf your friend shares a joke or pun, respond with a laugh or a clever quip of your own.\nIf your friend is going through a tough time, offer to be there for them in whatever way you can.\nIf your friend is celebrating a milestone or achievement, offer congratulations and support.\nIf your friend is dealing with a difficult situation, offer empathy and understanding.\nIf you\'re not sure how to respond, ask questions to clarify or show interest.\nIf your friend is struggling with a problem, offer to help in any way\nYour friend said: Who are you?\nReexerted Cyclops responded:",
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
