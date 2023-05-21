const Discord = require("discord.js")
const JiraRegister = require("../../models/jiraRegister")
const GithubRegister = require("../../models/githubRegister")

module.exports = {
    name: "register", // Coloque o nome do comando
    description: "Edite uma issue.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "jira",
            description: "Usar para projetos Jira.",
            type: Discord.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "email",
                    description: "Insira o email.",
                    type: Discord.ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: "token",
                    description: "Insira o token.",
                    type: Discord.ApplicationCommandOptionType.String,
                    required: true,
                },
            ]
        },
        {
            name: "github",
            description: "Usar para projetos Github.",
            type: Discord.ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "token",
                    description: "Insira o token.",
                    type: Discord.ApplicationCommandOptionType.String,
                    required: true,
                },
            ]
        },
    ],
    run: async (client, interaction) => {

        if (interaction.options.getSubcommand() === 'jira') {

            const email = interaction.options.getString('email')
            const token = interaction.options.getString('token')
            const token64 = new Buffer.from(`${email}:${token}`).toString('base64')
            const jira = await JiraRegister.findById(interaction.user.id)
    
            if (jira != null) {
    
                jira.token = token64
                await jira.save()
    
                return await interaction.reply({ content: "✅ Você alterou seu token do Jira com sucesso!", ephemeral: true })
            } else {
    
                await JiraRegister.create({
                    _id: interaction.user.id,
                    token: token64,
                })
    
                await interaction.reply({ content: "✅ Você registrou seu token do Jira com sucesso!", ephemeral: true })
            }
        } else if (interaction.options.getSubcommand() === 'github') { 

            const token = interaction.options.getString('token')
            const github = await GithubRegister.findById(interaction.user.id)
    
            if (github != null) {
    
                github.token = token
                await github.save()
    
                return await interaction.reply({ content: "✅ Você alterou seu token do Github com sucesso!", ephemeral: true })
            } else {
    
                await GithubRegister.create({
                    _id: interaction.user.id,
                    token: token,
                })
    
                await interaction.reply({ content: "✅ Você registrou seu token do Github com sucesso!", ephemeral: true })
            }
        }
    }
}