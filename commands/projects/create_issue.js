const Discord = require("discord.js")
const JiraRegister = require("../../models/jiraRegister")
const { ActionRowBuilder, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    name: "createissue", // Coloque o nome do comando
    description: "Cria uma issue.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "dominio",
            description: "Insira o dominio.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "projeto",
            description: "Insira o projeto.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "titulo",
            description: "Insira o titulo.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "tipo",
            description: "Insira o tipo de issue.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
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
        const project = interaction.options.getString("projeto")
        const title = interaction.options.getString("titulo")
        let description = interaction.options.getString("descrição")
        if(!description) description = null
        const type = interaction.options.getString("tipo")

        const result = await fetch(`https://${domain}.atlassian.net/rest/api/2/issue`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${jira.token}`
            },

            // Enviar os dados no corpo da requisição
            body: JSON.stringify({
                "fields": {
                    "project": {
                        "key": project
                    },
                    "summary": title,
                    "description": description,
                    "issuetype": {
                        "name": type
                    }
                }
            }),
        }).then((dados) => { 
            console.log(dados)
            interaction.reply("✅ Issue `" + title + "` criada com sucesso!")
        }).catch((error) => {
            console.log(error)
            interaction.reply(`❎ | Algo deu errado.`)
        });

    }
}
