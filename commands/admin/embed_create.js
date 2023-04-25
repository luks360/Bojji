const Discord = require("discord.js")
const { ActionRowBuilder, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    name: "embed", // Coloque o nome do comando
    description: "Crie um embed.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "chat",
            description: "Mencione o canal onde o embed deve ser enviado.",
            type: Discord.ApplicationCommandOptionType.Channel,
            required: true,
        },
        {
            name: "imagem",
            description: "Insira uma imagem.",
            type: Discord.ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "thumbnail",
            description: "Insira uma thumbnail.",
            type: Discord.ApplicationCommandOptionType.String,
            required: false,    
        },
        {
            name: "arquivo",
            description: "Insira um arquivo para aparecer.",
            type: Discord.ApplicationCommandOptionType.String,
            required: false,    
        },
    ],
    run: async (client, interaction) => {

        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
            interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true })
        } else {
            if (!interaction.isChatInputCommand()) return;
            // Create the modal
            const modal = new ModalBuilder()
                .setCustomId('embedModal')
                .setTitle('Crie seu embed');

            // Add components to modal

            // Create the text input components
            const messageInput = new TextInputBuilder()
                .setCustomId('messageInput')
                // The label is the prompt the user sees for this input
                .setLabel("Qual o conteudo da mensagem?")
                // Short means only a single line of text
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setMaxLength(4000);
            
            const titleInput = new TextInputBuilder()
                .setCustomId('titleInput')
                // The label is the prompt the user sees for this input
                .setLabel("Qual o titulo?")
                // Short means only a single line of text
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(100);

            const descInput = new TextInputBuilder()
                .setCustomId('descInput')
                .setLabel("Qual a descrição?")
                // Paragraph means multiple lines of text.
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setMaxLength(4000);

            const colorInput = new TextInputBuilder()
                .setCustomId('colorInput')
                // The label is the prompt the user sees for this input
                .setLabel("Qual a cor?")
                // Short means only a single line of text
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(20);

            // so you need one action row per text input.
            const firstActionRow = new ActionRowBuilder().addComponents(messageInput);
            const secondActionRow = new ActionRowBuilder().addComponents(titleInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(descInput);
            const fourthActionRow = new ActionRowBuilder().addComponents(colorInput);

            // Add inputs to the modal
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

            // Show the modal to the user
            await interaction.showModal(modal);
            
            client.on('interactionCreate', async (modalSubmit) => {
                if (!modalSubmit.isModalSubmit()) return;

                let message = modalSubmit.fields.getTextInputValue('messageInput')
                if (!message) message = null

                let titulo = modalSubmit.fields.getTextInputValue('titleInput')
                if (!titulo) titulo = null

                let cor = modalSubmit.fields.getTextInputValue('colorInput')
                if (!cor) cor = "Random"

                let desc = modalSubmit.fields.getTextInputValue('descInput')
                if (!desc) desc = null
                
                let image = interaction.options.getString("imagem")
                if (!image) image = null

                let thumbnail = interaction.options.getString("thumbnail")
                if (!thumbnail) thumbnail = null

                let archive = interaction.options.getString("arquivo")
                if (!archive) archive = null

                let chat = interaction.options.getChannel("chat")
                if (Discord.ChannelType.GuildText !== chat.type) return interaction.followUp(`❌ Este canal não é um canal de texto para enviar uma mensagem.`)

                let embed = new Discord.EmbedBuilder()
                    .setTitle(titulo)
                    .setDescription(desc)
                    .setColor(cor)
                    .setImage(image)
                    .setThumbnail(thumbnail);
                
                chat.send({ content: message, files: [archive], embeds: [embed] }).then(() => {
                    modalSubmit.reply(`✅ Seu embed foi enviado em ${chat} com sucesso.`)
                }).catch((e) => {
                    modalSubmit.reply(`❌ Algo deu errado.`)
                })
            }) 
        }
    }
}