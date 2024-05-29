const controllers = require("../controllers/controllers");

const commandHandlers = {
  "!ayuda": {
    description: "Lista de todos los comandos",
    handler: async () => await commandsHelp(),
  },
  "!miembrosTrofeos": {
    description: "Lista de miembros en orden descendente de trofeos",
    handler: async () =>
      await controllers.clansControllers.getClanMemebersListOrderByTrophiesDescendent(),
  },
  "!miembrosAlfa": {
    description: "Lista de miembros en orden alfabético descendente",
    handler: async () =>
      await controllers.clansControllers.getClanMembersListAlphabeticalOrderByNameDescendent(),
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
  "!heroes": {
    description:
      "Lista de los miembros y el nivel de sus heroes, K -> Rey, Q -> Reina, C -> Centinela, L -> Luchadora, Si no aparece es que no lo tiene",
    handler: async () =>
      await controllers.playersControllers.getHerosLevelsForAllMembers(),
  },
  "!puntos": {
    description: "Lista de los miembros y sus puntos",
    handler: async () =>
      await controllers.playersControllers.getClanMembersPointsTable(),
  },
  "!guerra": {
    description: "Información sobre la guerra actual",
    handler: async () =>
      await controllers.clansControllers.getCurrentWarInformation(),
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
