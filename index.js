const controllers = require("./controllers/controllers");

const { Client, Events } = require("discord.js");

const client = new Client({
  intents: 3276799,
});

client.on(Events.ClientReady, async () => {
  console.log(`Conectado como ${client.user.username}!`);
});

client.on(Events.MessageCreate, async (message) => {
  let response_message = "";

  if (message.content === "!miembros") {
    response_message = await controllers.clansControllers.getClanMemebersList();
  }

  if (message.content === "!donaciones") {
    response_message =
      await controllers.clansControllers.getClanDonationsDifference();
  }

  message.reply(response_message);
});

client.login(process.env.TOKEN_BOT);
