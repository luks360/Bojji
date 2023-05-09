const Discord = require("discord.js")
const JiraRegister = require("../../models/jiraRegister")

module.exports = {
    name: "editissue", // Coloque o nome do comando
    description: "Edite uma issue.", // Coloque a descrição do comando
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
            name: "titulo",
            description: "Insira o titulo.",
            type: Discord.ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "descrição",
            description: "Insira a descrição.",
            type: Discord.ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    run: async (client, interaction) => {

        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild))
            return interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true })
        
        const jira = await JiraRegister.findById(interaction.user.id)

        if(jira == null) return interaction.reply({ content: "Você não possui um token registrado, use o comando `/register` para isso.", ephemeral: true })
        
        const domain = interaction.options.getString("dominio")
        const key = interaction.options.getString("key")
        let title = interaction.options.getString("titulo")
        let description = interaction.options.getString("descrição")
        let json = JSON.stringify({
            "fields": {
                "summary": title,
                "description": description,
        }})

        console.log(json)
        const result = await fetch(`https://${domain}.atlassian.net/rest/api/2/issue/${key}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${jira.token}`
            },

            // Enviar os dados no corpo da requisição
            body: json,

        }).then((dados) => { 
            console.log(dados)
            interaction.reply("✅ Issue editada com sucesso!")
        }).catch((error) => {
            console.log(error)
            interaction.reply(`❎ | Algo deu errado.`)
        });

    }
}
