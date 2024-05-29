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

  if (message.content === "!comandante") {
    response_message =
      "El comandante Henry es un " +
      (await controllers.clansControllers.chooseInsult());
  }

  if (message.content === "!capital") {
    response_message =
      await controllers.clansControllers.getAllMembersCapitalContribution();
  }

  if (response_message !== "") {
    message.reply(response_message);
  }
});

client.login(process.env.TOKEN_BOT);
