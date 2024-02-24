update discord card:

```js
const { Client, Intents } = require('discord.js');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const token = 'YOUR_DISCORD_BOT_TOKEN'; // Replace with your Discord bot token
const channelId = 'YOUR_CHANNEL_ID'; // Replace with your channel ID
let logMessageId = null; // This will store the ID of the log message

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', async (message) => {
  // Check if the message is a command to simulate server crash or recovery
  if (message.content === '!crash') {
    const crashMessage = await message.channel.send({
      content: 'ServerCrashed',
      embeds: [
        { color: 'RED', description: 'The server has crashed! :red_circle:' },
      ],
    });
    logMessageId = crashMessage.id; // Store the message ID for editing later
  } else if (message.content === '!recover' && logMessageId) {
    const editMessage = await message.channel.messages.fetch(logMessageId);
    editMessage.edit({
      content: 'ServerBackup',
      embeds: [
        {
          color: 'GREEN',
          description: 'The server is back online! :green_circle:',
        },
      ],
    });
  }
});

client.login(token);
```
