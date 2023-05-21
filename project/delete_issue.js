const Discord = require("discord.js")
const JiraRegister = require("../../models/jiraRegister")

module.exports = {
    name: "deleteissue", // Coloque o nome do comando
    description: "Exclua uma issue.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "dominio",
            description: "Insira o dominio.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "key",
            description: "Insira o id/key.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    run: async (client, interaction) => {

        const jira = await JiraRegister.findById(interaction.user.id)

        if(jira == null) return interaction.reply({ content: "Você não possui um token registrado, use o comando `/register` para isso.", ephemeral: true })

        const domain = interaction.options.getString("dominio")
        const key = interaction.options.getString("key")

        const result = await fetch(`https://${domain}.atlassian.net/rest/api/2/issue/${key}`, {

            method: "DELETE",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${jira.token}`
            },
        }).then((dados) => { 
            console.log(dados)
            interaction.reply("✅ Issue deleta com sucesso!")
        }).catch((error) => {
            console.log(error)
            interaction.reply(`❎ | Algo deu errado.`)
        });
    }
}