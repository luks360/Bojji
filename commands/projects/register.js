const Discord = require("discord.js")
const JiraRegister = require("../../models/jiraRegister")

module.exports = {
    name: "register", // Coloque o nome do comando
    description: "Edite uma issue.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
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
    ],
    run: async (client, interaction) => {

        const email = interaction.options.getString('email')
        const token = interaction.options.getString('token')
        const token64 = new Buffer.from(`${email}:${token}`).toString('base64')
        const jira = await JiraRegister.findById(interaction.user.id)

        if(jira._id != null) {

            jira.token = token64
            await jira.save()

            return await interaction.reply({ content: "✅ Você alterou seu token com sucesso!", ephemeral: true })
        } else {

            await JiraRegister.create({
                _id: interaction.user.id,
                token: token64,
            })

            await interaction.reply({ content: "✅ Você registrou seu token com sucesso!", ephemeral: true })
        } 
    }
}