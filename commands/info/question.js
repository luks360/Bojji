const Discord = require('discord.js')
require('dotenv').config()
module.exports = {
    name: "bojjisabe",
    description: "Tire uma duvida com o Bojji.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "pergunta",
            description: "Digite o que quer saber.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        }
    ],

    run: async (client, interaction, args) => {

        const question = interaction.options.getString("pergunta")
        // Requisição para chatgpt
        await interaction.reply('Estou formulando uma resposta...');

        if (question == "") {
            interaction.editReply(":warning: | Devido a **problemas internos** não consegui formular uma resposta. Reformule sua pergunta e tente novamente!")
        }

        const result = await fetch("https://api.openai.com/v1/chat/completions", {

            // Método para enviar os dados
            method: "POST",

            // Dados ennviados no cabeçalho da requisição
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + process.env.CHATGPT_TOKEN,
            },

            // Enviar os dados no corpo da requisição
            body: JSON.stringify({
                model: "gpt-3.5-turbo", //Modelo
                messages: [{ "role": "user", "content": question }], // Texto da pergunta
                max_tokens: 2048, // Tamanho da resposta
                temperature: 1 // Criatividade na resposta
            }),
        })
            // Acessa o then quando obtiver resposta
            .then((resposta) => resposta.json())
            .then((dados) => {
                // Enviar o texto da resposta para a página HTML
                if (dados != '') {
                    interaction.editReply(`${dados.choices[0].message.content}`)
                }
                else {
                    interaction.editReply(":warning: | Devido a **problemas internos** não consegui formular uma resposta. Reformule sua pergunta e tente novamente!")
                }
                // Retorna catch quando gerar erro
            })
            .catch((error) => {
                console.log(error)
                interaction.editReply(":warning: | Devido a **problemas internos** não consegui formular uma resposta. Reformule sua pergunta e tente novamente!")
            });
    }
}