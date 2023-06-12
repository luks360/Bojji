const Discord = require("discord.js")
const { Client, Interaction, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType } = require("discord.js");

module.exports = {
  name: "help",
  description: "Veja meus comandos",
  type: Discord.ApplicationCommandType.ChatInput,
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  // just for telling that u can also add options
  run: async (client, interaction) => {
    try {
      if (!interaction.isCommand()) return;

      await interaction.deferReply().catch((_) => {});

      const dirs = [...new Set(client.slashCommands.map((c) => c.directory))];

      const helpArray = dirs.map((d) => {
        const getCmd = client.slashCommands
          .filter((c) => c.directory === d)
          .map((c) => {
            return {
              name: c.name || "Sem nome",
              description: c.description || "Sem Descrição",
            };
          });
        return {
          name: d,
          commands: getCmd,
        };
      });

      // default Page No.
      let pageNo = 1;

      const embed = new EmbedBuilder()
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 4096 }))
        .setAuthor({name: "Comando de ajuda!"})
        .setDescription("Meus comandos estão listados abaixo:")
        .setTimestamp()
        .setFooter({ text: `Pagina ${pageNo}/${helpArray.length}`});

      const getButtons = (pageNo) => {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("<")
            .setCustomId("prev")
            .setStyle("Success")
            .setDisabled(pageNo <= 1),
          new ButtonBuilder()
            .setLabel(">")
            .setCustomId("next")
            .setStyle("Success")
            .setDisabled(!(pageNo < helpArray.length)),
        );
      };

      embed.setDescription(`**${helpArray[pageNo - 1].name}**`).addFields(
        helpArray[pageNo - 1].commands.map(({ name, description }) => {
          return {
            name: `\`${name}\``,
            value: `${description}`,
            inline: true,
          };
        }),
      );

      const intrMsg = await interaction.editReply({ embeds: [embed], components: [getButtons(pageNo)], fetchReply: true });

      const collector = intrMsg.createMessageComponentCollector({ time: 600000, componentType: ComponentType.Button });

      collector.on("collect", async (i) => {
        if (i.customId === "next") {
          pageNo++;
        } else if (i.customId === "prev") {
          pageNo--;
        }

        const categ = helpArray[pageNo - 1];

        embed.fields = [];
        embed.setDescription(`**${categ.name}**`).addFields(
          categ.commands.map(({ name, description }) => {
            return {
              name: `\`${name}\``,
              value: `${description}`,
              inline: true,
            };
          }),
        ).setFooter(`Page ${pageNo}/${helpArray.length}`);

        await i.update({ embeds: [embed], components: [getButtons(pageNo)], fetchReply: true });
      });
    } catch (err) {
      console.log("Algo parece estar errado => ", err);
    }
  },
};