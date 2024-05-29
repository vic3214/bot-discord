const { Client, Events } = require("discord.js");
const commandHandlers = require("./commands/commands");

const client = new Client({
  intents: 3276799,
});

client.on(Events.ClientReady, async () => {
  console.log(`Conectado como ${client.user.username}!`);
});

client.on(Events.MessageCreate, async (message) => {
  let response_message = "";

  if (message.content in commandHandlers) {
    response_message = await commandHandlers[message.content].handler();
  }

  if (response_message !== "") {
    message.reply(response_message);
  }
});

client.login(process.env.TOKEN_BOT);
