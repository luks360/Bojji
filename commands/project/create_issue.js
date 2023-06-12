const Discord = require("discord.js")
const { Octokit } = require("@octokit/core");
const JiraRegister = require("../../models/jiraRegister")
const GithubRegister = require("../../models/githubRegister")

module.exports = {
    name: "createissue", // Coloque o nome do comando
    description: "Cria uma issue.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "jira",
            description: "Cria uma issue em projeto Jira.",
            type: Discord.ApplicationCommandOptionType.Subcommand,
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
        },
        {
            name: "github",
            description: "Cria uma issue em projeto Github.",
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
                    name: "titulo",
                    description: "Insira o titulo.",
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
        },
    ],
    run: async (client, interaction) => {
        
        await interaction.reply("⏳ Criando sua issue...")

        const id = client.application.commands.cache.find(c => c.name === 'register').id

        if (interaction.options.getSubcommand() === 'jira') {

            const jira = await JiraRegister.findById(interaction.user.id)
    
            if (jira == null) return interaction.editReply({ content: `Você não possui um token registrado, use o comando </register jira:${id}> para isso.`, ephemeral: true })
            
            const domain = interaction.options.getString("dominio")
            const project = interaction.options.getString("projeto")
            const title = interaction.options.getString("titulo")
            let description = interaction.options.getString("descrição")
            if (!description) description = null
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
                interaction.editReply("✅ Issue `" + title + "` criada com sucesso!")
            }).catch((error) => {
                console.log(error)
                interaction.editReply(`❎ | Algo deu errado.`)
            });
        } else if (interaction.options.getSubcommand() === 'github') { 

            const github = await GithubRegister.findById(interaction.user.id)
    
            if (github == null) return interaction.editReply({ content: `Você não possui um token registrado, use o comando </register github:${id}> para isso.`, ephemeral: true })

            const owner = interaction.options.getString("dono")
            const repo = interaction.options.getString("repositorio")
            const title = interaction.options.getString("titulo")
            let description = interaction.options.getString("descrição")
            if (!description) description = null
    
            const octokit = new Octokit({
                auth: github.token,
              })

            const result = await octokit.request(`POST /repos/${owner}/${repo}/issues`, {
                owner: owner,
                repo: repo,
                title: title,
                body: description,
                headers: {
                  'X-GitHub-Api-Version': '2022-11-28'
                }
            }).then((dados) => {
                interaction.editReply("✅ Issue `" + title + "` criada com sucesso!")
            }).catch((error) => {
                console.log(error)
                interaction.editReply(`❎ | Algo deu errado.`)
            });
        }
    }
}
