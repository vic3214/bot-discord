const controllers = require("../controllers/controllers");

const commandHandlers = {
  "!ayuda": {
    description: "Lista de todos los comandos",
    handler: async () => await commandsHelp(),
  },
  "!miembros": {
    description: "Lista de miembros en orden de trofeos",
    handler: async () =>
      await controllers.clansControllers.getClanMemebersList(),
  },
  "!donaciones": {
    description:
      "Lista de los miembros ordenados de mayor a menor ratio de donaciones",
    handler: async () =>
      await controllers.clansControllers.getClanDonationsDifference(),
  },
  "!comandante": {
    description: "Dile algo bonito a nuestro 'comandante'",
    handler: async () =>
      `El comandante Henry es un ${await controllers.clansControllers.chooseInsult()}`,
  },
  "!capital": {
    description:
      "Lista de miembros en orden descendente según los puntos de la capital",
    handler: async () =>
      await controllers.clansControllers.getAllMembersCapitalContribution(),
  },
};

function commandsHelp() {
  const allCommands = Object.keys(commandHandlers).filter(
    (key) => key !== "!ayuda"
  );
  const commandDescriptions = allCommands.map(
    (command) => `${command} - ${commandHandlers[command].description} \n`
  );
  return commandDescriptions.join("\n");
}
module.exports = commandHandlers;
