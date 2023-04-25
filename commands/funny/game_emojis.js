// const Discord = require('discord.js')
// module.exports = {
//     name: "gameemoji",
//     description: "Inicie um jogo de emoji.",
//     type: Discord.ApplicationCommandType.ChatInput,
//     options: [
//         {
//             name: "rodadas",
//             description: "Selecione o numero de rodadas.",
//             type: Discord.ApplicationCommandOptionType.Integer,
//             required: true,
//         }
//     ],
//     run: async (client, interaction, args) => { 

//         const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
//         const quiz = require('./emojis.json');

//         const item = quiz[Math.floor(Math.random() * quiz.length)];
//         const filter = response => {
//             return item.answers.some(answer => answer === response.content);
//         };

//         let rodadas = interaction.options.getInteger("rodadas")
//         var placar = [[' ', 0]]
//         var placarV = []
//         parar = 0
//         while (parar == 0) {

//             var emojiEmbed = {
//                 color: 0x0099ff,
//                 title: `Jogo do emoji - round ${1}`,
//                 description: `Envie o emoji abaixo para marcar ponto\n ${item.answers}`,
//             };

//             await interaction.reply({ embeds: [emojiEmbed], fetchReply: true }).then(() => {
//                 interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
//                     .then(collected => {
//                         interaction.followUp(`${collected.first().author} enviou o emoji certo!`);
//                         if (placar[0][0] == ' ' && placar[0][1] == 0) {
//                             placar[0][0] = collected.first().author.username
//                             placar[0][1] = 1
//                         }

//                         var placarEmbed = {
//                             color: 0x1099ff,
//                             title: `Jogo do emoji - placar`,
//                             description: `${placar[0][0]} | **${placar[0][1]}** ponto(s)`,
//                         }

//                         setTimeout(() => { interaction.followUp({ embeds: [placarEmbed] }) }, 2000)
                        
//                     })
//                     .catch(collected => {
//                         interaction.followUp('Parece que ninguem conseguiu.');
//                     });
//             });
//             await sleep(15000);

//             for (let i = 0; i < rodadas - 1; i++) {
//                 const item = quiz[Math.floor(Math.random() * quiz.length)];
//                 const filter = response => {
//                     return item.answers.some(answer => answer === response.content);
//                 };
//                 var emojiEmbed2 = {
//                     color: 0x0099ff,
//                     title: `Jogo do emoji - round ${i + 2}`,
//                     description: `Envie o emoji abaixo para marcar ponto\n ${item.answers}`,
//                 };

//                 await interaction.followUp({ embeds: [emojiEmbed2], fetchReply: true }).then(() => {
//                     interaction.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] })
//                         .then(collected => {
//                             interaction.followUp(`${collected.first().author} enviou o emoji certo!`);
//                             if (placar[0][0] == ' ' && placar[0][1] == 0) {
//                                 placar[0][0] = collected.first().author.username
//                                 placar[0][1] = 1
//                             }
//                             else {
//                                 for (var p = 0; p < placar.length; p++) {
//                                     if (placar[p][0] == collected.first().author.username) {
//                                         placar[p][1] = placar[p][1] + 1
//                                     }
//                                     else if (p == placar.length - 1) {
//                                         placar[p + 1] = [collected.first().author.username, 1]
//                                     }
//                                 }
//                             }
                            
//                             for (var i = 0; i < placar.length; i++) { 
//                                 placarV[i] = placar[i][0] + ' | **' + placar[i][1] + '** ponto(s)'
//                             }
//                             var placarEmbed2 = {
//                                 color: 0x1099ff,
//                                 title: `Jogo do emoji - placar`,
//                                 description: `${placarV.join("\n")}`,
                          
//                             }
    
//                             setTimeout(() => { interaction.followUp({ embeds: [placarEmbed2] }) }, 2000)
                            
//                         })
//                         .catch(collected => {
//                             interaction.followUp('Parece que ninguem conseguiu.');
//                         });
//                 });
//                 await sleep(15000)
//             }
//             parar = 1
//         }
//     }
// }