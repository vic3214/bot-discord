const { getClanMembers } = require("./services/services.js");

const { Client, Events } = require("discord.js");

const client = new Client({
  intents: 3276799,
});

client.on(Events.ClientReady, async () => {
  console.log(`Conectado como ${client.user.username}!`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.content === "!miembros") {
    let response_message = "";
    try {
      // Si getClanMembers no devuelve un error devolver los datos
      const clanMembers = await getClanMembers(process.env.CLAN_TAG);
      console.log(clanMembers);
      // La respuesta consiste en un objeto items que es una lista de objetos, de esos objetos quiero recuperar el name y devolverlo en texto uno en cada lidea
      const members = clanMembers.items.map((member) => member.name);
      response_message = members.join("\n");
      console.log(response_message);
    } catch (error) {
      console.log(error);
      response_message = error.message;
    }

    message.reply(response_message);
  }
});

client.login(process.env.TOKEN_BOT);
