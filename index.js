const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const VINTED_SEARCH = process.env.VINTED_SEARCH || 'nike';

async function searchVinted() {
  try {
    const response = await fetch(`https://www.vinted.fr/api/v2/catalog/items?search_text=${VINTED_SEARCH}&order=newest_first&per_page=5`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Erreur Vinted:', error);
    return [];
  }
}

client.once('ready', () => {
  console.log(`Bot connecté : ${client.user.tag}`);
  
  let lastItemId = null;

  setInterval(async () => {
    const items = await searchVinted();
    if (items.length === 0) return;

    const newestItem = items[0];
    if (newestItem.id === lastItemId) return;
    lastItemId = newestItem.id;

    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle(newestItem.title)
      .setURL(`https://www.vinted.fr/items/${newestItem.id}`)
      .setColor(0x09B1BA)
      .addFields(
        { name: 'Prix', value: `${newestItem.price} €`, inline: true },
        { name: 'Taille', value: newestItem.size_title || 'N/A', inline: true },
        { name: 'État', value: newestItem.status || 'N/A', inline: true }
      )
      .setImage(newestItem.photo?.url || '')
      .setFooter({ text: 'VintedBot' })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }, 30000);
});

client.login(DISCORD_TOKEN);
