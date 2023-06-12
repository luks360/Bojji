const Discord = require("discord.js")
const { ActionRowBuilder, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    name: "usemodel", // Coloque o nome do comando
    description: "Usa um modelo pronto de servidor.", // Coloque a descrição do comando
    type: Discord.ApplicationCommandType.ChatInput,
    options: [{
            name: "modelo",
            description: "Escolha qual modelo usar.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
            choices: [{
                name: "projeto",
                value: "1"
            }, ],
        }
    ],
    run: async (client, interaction) => {

        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild))
            return interaction.reply({
                content: `Você não possui permissão para utilizar este comando.`,
                ephemeral: true
            })

        const model = interaction.options.getString("modelo")

        if (model == "1") {

            if (!interaction.isChatInputCommand()) return;
            // Create the modal
            const modal = new ModalBuilder()
                .setCustomId('embedModal')
                .setTitle('Informações para modelo');

            const quantInput = new TextInputBuilder()
                .setCustomId('quantInput')
                // The label is the prompt the user sees for this input
                .setLabel("Quantas equipes?")
                // Short means only a single line of text
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            
            const equipsInput = new TextInputBuilder()
                .setCustomId('equipsInput')
                // The label is the prompt the user sees for this input
                .setLabel("Qual o nome das equipes? (separe por virgula)")
                // Short means only a single line of text
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)

            const firstActionRow = new ActionRowBuilder().addComponents(quantInput);
            const secondActionRow = new ActionRowBuilder().addComponents(equipsInput);

            modal.addComponents(firstActionRow, secondActionRow)

            await interaction.showModal(modal);
            
            client.once('interactionCreate', async (modalSubmit) => {
                if (!modalSubmit.isModalSubmit()) return;

                await modalSubmit.deferReply()

                let quant = modalSubmit.fields.getTextInputValue('quantInput')
                quant = parseInt(quant)
                let equips = modalSubmit.fields.getTextInputValue('equipsInput')

                equips = await equips.split(",")

                if( quant != equips.length) return modalSubmit.reply("❌ Você digitou uma quantidade maior ou menor de nomes do que foi informado!")

                await modalSubmit.guild.roles.create({
                    name: 'Professores',
                    permissions: [Discord.PermissionsBitField.Flags.Administrator]
                })
                const category = await modalSubmit.guild.channels.create({
                    name: 'Geral',
                    type: Discord.ChannelType.GuildCategory
                })
                await modalSubmit.guild.channels.create({
                    name: '💬│chat-geral',
                    type: Discord.ChannelType.GuildText,
                    parent: category.id
                })
                await modalSubmit.guild.channels.create({
                    name: '📢│avisos-geral',
                    type: Discord.ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [{
                        id: modalSubmit.guild.id,
                        deny: [Discord.PermissionsBitField.Flags.SendMessages]
                    }]
                })
                await modalSubmit.guild.channels.create({
                    name: '❓│duvidas-geral',
                    type: Discord.ChannelType.GuildText,
                    parent: category.id
                })
                await modalSubmit.guild.channels.create({
                    name: '📞│voice-geral',
                    type: Discord.ChannelType.GuildVoice,
                    parent: category.id
                })

                for (let i = 0; i < quant; i++) {
                    let equip = await modalSubmit.guild.roles.create({
                        name: `Equipe ${equips[i]}`,
                        permissions: [Discord.PermissionsBitField.Flags.SendMessages, Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.EmbedLinks, Discord.PermissionsBitField.Flags.ReadMessageHistory]
                    })
                    let category = await modalSubmit.guild.channels.create({
                        name: `Equipe ${equips[i]}`,
                        type: Discord.ChannelType.GuildCategory
                    })
                    await modalSubmit.guild.channels.create({
                        name: `💬│chat-${equips[i]}`,
                        type: Discord.ChannelType.GuildText,
                        parent: category.id,
                        permissionOverwrites: [{
                            id: modalSubmit.guild.id,
                            deny: [Discord.PermissionsBitField.Flags.ViewChannel]
                        }, {
                            id: equip.id,
                            allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                        }]
                    })
                    await modalSubmit.guild.channels.create({
                        name: `📢│avisos-${equips[i]}`,
                        type: Discord.ChannelType.GuildText,
                        parent: category.id,
                        permissionOverwrites: [{
                            id: modalSubmit.guild.id,
                            deny: [Discord.PermissionsBitField.Flags.ViewChannel]
                        }, {
                            id: equip.id,
                            allow: [Discord.PermissionsBitField.Flags.ViewChannel],
                            deny: [Discord.PermissionsBitField.Flags.SendMessages]
                        }]
                    })
                    await modalSubmit.guild.channels.create({
                        name: `❓│duvidas-${equips[i]}`,
                        type: Discord.ChannelType.GuildText,
                        parent: category.id,
                        permissionOverwrites: [{
                            id: modalSubmit.guild.id,
                            deny: [Discord.PermissionsBitField.Flags.ViewChannel]
                        }, {
                            id: equip.id,
                            allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                        }]
                    })
                    await modalSubmit.guild.channels.create({
                        name: `📞│voice-${equips[i]}`,
                        type: Discord.ChannelType.GuildVoice,
                        parent: category.id,
                        permissionOverwrites: [{
                            id: modalSubmit.guild.id,
                            deny: [Discord.PermissionsBitField.Flags.ViewChannel]
                        }, {
                            id: equip.id,
                            allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                        }]
                    })
                }

                await modalSubmit.editReply("✅ Modelo aplicado com sucesso!")
            })
        }

    }
}