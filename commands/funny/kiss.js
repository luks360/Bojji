const Discord = require('discord.js')
module.exports = {
    name: "kiss",
    description: "Beije um membro.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "membro",
            description: "Mencione um usuário",
            type: Discord.ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    run: async (client, interaction, args) => {

        let user = interaction.options.getUser("membro")

        var lista1 = [
            'https://i.imgur.com/vKzxvjH.gif',
            'https://i.imgur.com/6Adq8mc.gif',
            'https://i.imgur.com/WEkPz3a.gif',
            'https://i.imgur.com/bUXQEXc.gif',
            'https://imgur.com/uobBW9K.gif',
            'https://i.imgur.com/Fc9fGUP.gif',
            'https://i.imgur.com/tmmgCDI.gif'
        ];

        var lista2 = [
            'https://i.imgur.com/VZOF7vu.gif',
            'https://i.imgur.com/BJsYnSf.gif',
            'https://i.imgur.com/F3CW53z.gif',
            'https://imgur.com/7GhTplD.gif',
            'https://imgur.com/B6UKulT.gif',
            'https://i.imgur.com/MzHkQaK.gif',
            'https://i.imgur.com/OaCvF85.gif'
        ];

        var random1 = lista1[Math.floor(Math.random() * lista1.length)];
        var random2 = lista2[Math.floor(Math.random() * lista2.length)];

        const embed = new Discord.EmbedBuilder()
            .setDescription(`**${interaction.user} deu um beijo em ${user}.**`)
            .setImage(`${random1}`)
            .setColor("Random")

        const button = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('1')
                    .setLabel('Retribuir')
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setDisabled(false)

            )

        const embed1 = new Discord.EmbedBuilder()
            .setDescription(`**${user} retribuiu o beijo de ${interaction.user}.**`)
            .setColor("Random")
            .setImage(`${random2}`)

        interaction.reply({ embeds: [embed], components: [button] }).then(() => {
            const filter = i => i.customId === '1' && i.user.id === user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1 });

            collector.on('collect', async i => {
                if (i.customId === '1') {
                    i.reply({ embeds: [embed1] })
                }
            });

            collector.on("end", () => {
                interaction.editReply({
                    components: [
                        new Discord.ActionRowBuilder()
                            .addComponents(
                                new Discord.ButtonBuilder()
                                    .setCustomId('1')
                                    .setLabel('Retribuir')
                                    .setStyle(Discord.ButtonStyle.Primary)
                                    .setDisabled(true)

                            )
                    ]
                })
            })
        })
    }
}