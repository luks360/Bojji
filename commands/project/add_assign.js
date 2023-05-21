const Discord = require("discord.js")
const JiraRegister = require("../../models/jiraRegister")

module.exports = {
    name: "addassign", // Coloque o nome do comando
    description: "Adicione um responsavel a uma issue.", // Coloque a descrição do comando
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
        {
            name: "responsavel",
            description: "Insira o email do responsavel pela issue.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    run: async (client, interaction) => {

        const jira = await JiraRegister.findById(interaction.user.id)

        if(jira == null) return interaction.reply({ content: "Você não possui um token registrado, use o comando `/register` para isso.", ephemeral: true })

        const domain = interaction.options.getString("dominio")
        const key = interaction.options.getString("key")
        const assign = interaction.options.getString("responsavel")

        const accountId = await fetch(`https://${domain}.atlassian.net/rest/api/2/user/search?query=${assign}`, {
            
            method: "GET",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${jira.token}`
            },
        })
        .then((resposta) => resposta.json())
        .then(async (dados) => {
            const result = await fetch(`https://${domain}.atlassian.net/rest/api/2/issue/${key}/assignee`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${jira.token}`
                },
                body: JSON.stringify({
                    "accountId": dados[0].accountId,
                }),

            }).then((dados) => {
                console.log(dados)
                interaction.reply("✅ Responsavel adicionado a issue com sucesso!")
            }).catch((error) => {
                console.log(error)
                interaction.reply(`❎ | Algo deu errado.`)
            });
        }).catch((error) => {
            console.log(error)
            interaction.reply(":warning: | Algo deu errado!")
        });
    }
}