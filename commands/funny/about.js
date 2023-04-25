const Discord = require("discord.js")

module.exports = {
    name: "sobre", // Coloque o nome do comando
    description: "Veja minha opinião sobre alguém.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "marcação",
            description: "Falarei sobre a pessoa que você especificar.",
            type: Discord.ApplicationCommandOptionType.User,
            required: false,
        },
    ],

    run: async (client, interaction) => {

        const r = ["Sinceramente, eu já ouvi varias coisas ruins dessa pessoa... prefiro nem comentar", "Gente boa demais, um anjo de pessoa pelo que parece", "Essa pessoa é famosa por passar o rodo na cidade inteira dela, COMO UMA PESSOA CONSEGUE FICAR EM UMA FESTA COM 30 PESSOAS DIFERENTES??????", "Muito dark essa pessoa, tenho até medo", "KKKKKKKKKK piada em pessoa", "Não sabe brincar, leva tudo a serio, até demais", "NÓS NÃO FALAMOS SOBRE VOCÊ SABE QUEM, NÃO DIGA ESSE NOME", "Pessoa ideia pra se ter uma amizade de anos"]

        const random = Math.floor(Math.random() * (8 - 1)) + 1;
        const message = interaction.options.getUser("marcação")
        if(message)
            interaction.reply(`${message} ${r[random]}`)
        else
            interaction.reply(`${interaction?.user} ${r[random]}`)
    }
}
