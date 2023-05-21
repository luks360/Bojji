const Discord = require("discord.js")
const JiraRegister = require("../../models/jiraRegister")
const { ActionRowBuilder, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    name: "getallissues", // Coloque o nome do comando
    description: "Mostra todas as issues de um projeto.", // Coloque a descrição do comando
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
            name: "tipo",
            description: "Insira o tipo de issue.",
            type: Discord.ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "responsavel",
            description: "Insira o responsavel.",
            type: Discord.ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    run: async (client, interaction) => {


        const jira = await JiraRegister.findById(interaction.user.id)

        if(jira == null) return interaction.reply({ content: "Você não possui um token registrado, use o comando `/register` para isso.", ephemeral: true })
        
        await interaction.reply("Estou buscando as informações...")

        const domain = interaction.options.getString("dominio")
        const project = interaction.options.getString("projeto")

        const result = await fetch(`https://${domain}.atlassian.net/rest/api/2/search`, {
            
            // Método para enviar os dados
            method: "POST",

            // Dados ennviados no cabeçalho da requisição
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${jira.token}`
            },

            // Enviar os dados no corpo da requisição
            body: JSON.stringify({
                "jql": `project = ${project}`, 
                "startAt": 0
            }),
        })
            .then((resposta) => resposta.json())
            .then((dados) => {

                let r = []
                for (var i = 0; i < dados["total"]; i++) {
                    r[i] = `
                        **Titulo:**
                        ${dados.issues[i].fields.summary}

                        **Descrição:**
                        ${dados.issues[i].fields.description}

                        **Tipo:**
                        ${dados["issues"][i]["fields"]["issuetype"].name}

                        **Status:**
                        ${dados["issues"][i]["fields"]["status"].name}\n
                    `
                }
                let embed = {
                    color: 0x1099ff,
                    title: `Issues do projeto ${project}`,
                    description: `${r.join("\n")}`,
                }
                let buttonV = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('1')
                            .setLabel('<')
                            .setStyle(Discord.ButtonStyle.Primary)
                            .setDisabled(false)

                )
                let buttonP = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('2')
                            .setLabel('>')
                            .setStyle(Discord.ButtonStyle.Primary)
                            .setDisabled(false)

                    )
                console.log(dados)
                interaction.editReply({ embeds: [embed] })
            })
            .catch((error) => {
                console.log(error)
                interaction.editReply(":warning: | Devido a **problemas internos** não consegui formular uma resposta. Reformule sua pergunta e tente novamente!")
            });
    }
}