const { Client, Events } = require("discord.js");
const {
  commandHandlers,
  commandArgumentsHandlers,
} = require("./commands/commands");
const { connectToMongoDB } = require("./dbConnection/mongoDBConnection");

const client = new Client({
  intents: 3276799,
});

client.on(Events.ClientReady, async () => {
  console.log(`Conectado como ${client.user.username}!`);
  connectToMongoDB();
});

client.on(Events.MessageCreate, async (message) => {
  let response_message = "";

  if (
    message.content.split("/")[0] in commandArgumentsHandlers &&
    !message.author.bot
  ) {
    const [command, ...args] = message.content.split("/");
    const roles = message.member.roles;
    response_message = await commandArgumentsHandlers[command].handler(
      args,
      roles
    );
  }

  if (message.content in commandHandlers && !message.author.bot) {
    response_message = await commandHandlers[message.content].handler();
  }

  if (response_message !== "") {
    message.reply(response_message);
  }
});

client.login(process.env.TOKEN_BOT);
