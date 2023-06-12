const Discord = require("discord.js")
const { Octokit } = require("@octokit/core");
const JiraRegister = require("../../models/jiraRegister")
const GithubRegister = require("../../models/githubRegister")
const {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ComponentType
} = require('discord.js');

module.exports = {
    name: "getallissues", // Coloque o nome do comando
    description: "Mostra todas as issues de um projeto.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "jira",
            description: "Mostra as issues de projetos Jira.",
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
            ]
        },
        {
            name: "github",
            description: "Mostra as issues de projetos Github.",
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
            ]
        }
    ],
    run: async (client, interaction) => {

        const id = client.application.commands.cache.find(c => c.name === 'register').id

        try {
            if (interaction.options.getSubcommand() === 'jira') {
                if (!interaction.isCommand()) return;
                const jira = await JiraRegister.findById(interaction.user.id)
    
                if (jira == null) return interaction.reply({
                    content: `Você não possui um token registrado, use o comando </register jira:${id}> para isso.`,
                    ephemeral: true
                })
    
                await interaction.deferReply()
    
                const domain = interaction.options.getString("dominio")
                const project = interaction.options.getString("projeto")
                const type = interaction.options.getString("tipo")
                const email = interaction.options.getString("responsavel")
                let query = `project = ${project}`
                let assignee = ""
                if (email != null) {
                    await fetch(`https://${domain}.atlassian.net/rest/api/2/user/search?query=${email}`, {
    
                        method: "GET",
    
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Basic ${jira.token}`
                        },
                    })
                        .then((response) => response.json())
                        .then(async (dadosAss) => {
                            assignee = dadosAss[0].accountId
                        }).catch(async () => {
                            await interaction.editReply("Não existe uma conta com esse e-mail.")
                        })
                }
    
                if (type != null && assignee == "") {
                    query = `project = ${project} AND issuetype = ${type}`
                } else if (type == null && assignee != "") {
                    query = `project = ${project} AND assignee = ${assignee}`
                } else if (type != null && assignee != "") {
                    query = `project = ${project} & issuetype = ${type} AND assignee = ${assignee}`
                }
    
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
                        "jql": query,
                        "startAt": 0
                    }),
                })
                    .then((resposta) => resposta.json())
                    .then(async (dados) => {
    
                        let pageNo = 1;
                        const getButtons = (pageNo) => {
                            return new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setLabel("<")
                                    .setCustomId("prev")
                                    .setStyle(1)
                                    .setDisabled(pageNo <= 1),
                                new ButtonBuilder()
                                    .setLabel(">")
                                    .setCustomId("next")
                                    .setStyle(1)
                                    .setDisabled(!(pageNo < dados["total"])),
                            );
                        };
    
                        const embed = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle(`Projeto ${project} - issue ${dados.issues[pageNo - 1].fields.summary}`)
                            .setDescription(dados.issues[pageNo - 1].fields.description)
                            .setFields({
                                name: 'Tipo:',
                                value: `${dados["issues"][pageNo - 1]["fields"]["issuetype"].name}`,
                                inline: true
                            }, {
                                name: 'Status:',
                                value: `${dados["issues"][pageNo - 1]["fields"]["status"].name}`,
                                inline: true
                            },)
                            .setFooter({
                                text: `${pageNo} | ${dados["total"]}`
                            });
    
                        const intrMsg = await interaction.editReply({
                            embeds: [embed],
                            components: [getButtons(pageNo)]
                        })
    
                        const collector = intrMsg.createMessageComponentCollector({
                            time: 600000,
                            componentType: ComponentType.Button
                        });
    
                        collector.on("collect", async (i) => {
                            if (i.customId === "next") {
                                pageNo++;
                            } else if (i.customId === "prev") {
                                pageNo--;
                            }
    
                            embed.setColor('#0099ff')
                                .setTitle(`Projeto ${project} - issue ${dados.issues[pageNo - 1].fields.summary}`)
                                .setDescription(dados.issues[pageNo - 1].fields.description)
                                .setFields({
                                    name: 'Tipo:',
                                    value: `${dados["issues"][pageNo - 1]["fields"]["issuetype"].name}`,
                                    inline: true
                                }, {
                                    name: 'Status:',
                                    value: `${dados["issues"][pageNo - 1]["fields"]["status"].name}`,
                                    inline: true
                                },)
                                .setFooter({
                                    text: `${pageNo} | ${dados["total"]}`
                                });
    
                            await i.update({
                                embeds: [embed],
                                components: [getButtons(pageNo)]
                            });
                        });
                    })
                    .catch((error) => {
                        console.log(error)
                        interaction.editReply(":warning: | Devido a algum problema não consegui buscar a informação!")
                    });
            } else if (interaction.options.getSubcommand() === 'github') { 
                if (!interaction.isCommand()) return;

                const github = await GithubRegister.findById(interaction.user.id)
    
                if (github == null) return interaction.editReply({ content: `Você não possui um token registrado, use o comando </register github:${id}> para isso.`, ephemeral: true })

                const owner = interaction.options.getString("dono")
                const repo = interaction.options.getString("repositorio")

                await interaction.deferReply()

                const octokit = new Octokit({
                    auth: github.token,
                })

                await octokit.request(`GET /repos/${owner}/${repo}/issues`, {
                    owner: `${owner}`,
                    repo: `${repo}`,
                    headers: {
                      'X-GitHub-Api-Version': '2022-11-28'
                    }
                })
                .then(async (dados) => {
                    let pageNo = 1;
                    const getButtons = (pageNo) => {
                        return new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setLabel("<")
                                .setCustomId("prev")
                                .setStyle(1)
                                .setDisabled(pageNo <= 1),
                            new ButtonBuilder()
                                .setLabel(">")
                                .setCustomId("next")
                                .setStyle(1)
                                .setDisabled(!(pageNo < dados.data.length)),
                        );
                    };

                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle(`Projeto ${repo} - issue ${dados.data[pageNo - 1]["title"]}`)
                        .setDescription(dados.data[pageNo - 1]["body"])
                        .setFields({
                            name: 'Tipo:',
                            value: `${dados.data[pageNo - 1]["labels"]["name"]}`,
                            inline: true
                        }, {
                            name: 'Status:',
                            value: `${dados.data[pageNo - 1]["state"]}`,
                            inline: true
                        },)
                        .setFooter({
                            text: `${pageNo} | ${dados.data.length}`
                        });

                    const intrMsg = await interaction.editReply({
                        embeds: [embed],
                        components: [getButtons(pageNo)]
                    })

                    const collector = intrMsg.createMessageComponentCollector({
                        time: 600000,
                        componentType: ComponentType.Button
                    });

                    collector.on("collect", async (i) => {
                        if (i.customId === "next") {
                            pageNo++;
                        } else if (i.customId === "prev") {
                            pageNo--;
                        }

                        embed.setColor('#0099ff')
                        .setTitle(`Projeto ${repo} - issue ${dados.data[pageNo - 1]["title"]}`)
                        .setDescription(dados.data[pageNo - 1]["body"])
                        .setFields({
                            name: 'Tipo:',
                            value: `${dados.data[pageNo - 1]["labels"]["name"]}`,
                            inline: true
                        }, {
                            name: 'Status:',
                            value: `${dados.data[pageNo - 1]["state"]}`,
                            inline: true
                        },)
                        .setFooter({
                            text: `${pageNo} | ${dados.data.length}`
                        });

                        await i.update({
                            embeds: [embed],
                            components: [getButtons(pageNo)]
                        });
                    });
                })
                .catch(async (error) => {
                    console.log(error)
                    await interaction.editReply(":warning: | Devido a algum problema não consegui buscar a informação!")
                });
            }

        } catch (err) {
            console.log("Algo deu errado => ", err);
        }
    }
}