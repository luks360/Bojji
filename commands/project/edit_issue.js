const Discord = require("discord.js")
const { Octokit } = require("@octokit/core");
const JiraRegister = require("../../models/jiraRegister")
const GithubRegister = require("../../models/githubRegister")

module.exports = {
    name: "editissue", // Coloque o nome do comando
    description: "Edite uma issue.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "jira",
            description: "Edite uma issue em projeto Jira.",
            type: Discord.ApplicationCommandOptionType.Subcommand,
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
        },
        {
            name: "github",
            description: "Edita uma issue em projeto Github.",
            type: Discord.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "dono",
                    description: "Insira o dono do repositorio.",
                    type: Discord.ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "repositorio",
                    description: "Insira o repositorio.",
                    type: Discord.ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "numero",
                    description: "Insira o numero da issue.",
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
        }
    ],
    run: async (client, interaction) => {

        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild))
            return interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true })
        
        interaction.reply("⏳ Editando sua issue...")

        if (interaction.options.getSubcommand() === 'jira') {
            const jira = await JiraRegister.findById(interaction.user.id)

            if (jira == null) return interaction.reply({ content: "Você não possui um token registrado, use o comando `/register` para isso.", ephemeral: true })
            
            const domain = interaction.options.getString("dominio")
            const key = interaction.options.getString("key")
            let title = interaction.options.getString("titulo")
            let description = interaction.options.getString("descrição")
            let json = JSON.stringify({
                "fields": {
                    "summary": title,
                    "description": description,
                }
            })

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
        else if (interaction.options.getSubcommand() === 'github') {

            const github = await GithubRegister.findById(interaction.user.id)
    
            if (github == null) return interaction.editReply({ content: "Você não possui um token registrado, use o comando `/register` para isso.", ephemeral: true })

            const owner = interaction.options.getString("dono")
            const repo = interaction.options.getString("repositorio")
            const issue_number = interaction.options.getString("numero")
            let title = interaction.options.getString("titulo")
            if (!title) title = null
            let description = interaction.options.getString("descrição")
            if (!description) description = null

            const octokit = new Octokit({
                auth: github.token,
              })
            
            if(title != null && description != null){
                const result = await octokit.request(`PATCH /repos/${owner}/${repo}/issues/${issue_number}`, {
                    owner: owner,
                    repo: repo,
                    issue_number: issue_number,
                    title: title,
                    body: description,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                }).then((dados) => {
                    interaction.editReply("✅ Issue editada com sucesso!")
                }).catch((error) => {
                    console.log(error)
                    interaction.editReply(`❎ | Algo deu errado.`)
                });
            } else if(title != null && description == null){
                const result = await octokit.request(`PATCH /repos/${owner}/${repo}/issues/${issue_number}`, {
                    owner: owner,
                    repo: repo,
                    issue_number: issue_number,
                    title: title,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                }).then((dados) => {
                    interaction.editReply("✅ Issue editada com sucesso!")
                }).catch((error) => {
                    console.log(error)
                    interaction.editReply(`❎ | Algo deu errado.`)
                });
            } else if(title == null && description != null){
                const result = await octokit.request(`PATCH /repos/${owner}/${repo}/issues/${issue_number}`, {
                    owner: owner,
                    repo: repo,
                    issue_number: issue_number,
                    body: description,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                }).then((dados) => {
                    interaction.editReply("✅ Issue editada com sucesso!")
                }).catch((error) => {
                    console.log(error)
                    interaction.editReply(`❎ | Algo deu errado.`)
                });
            }
        }
    }
}
