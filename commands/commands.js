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
  "!actualizaDB": {
    description: "Actualiza la base de datos",
    handler: async () =>
      await controllers.playersControllers.updateDataBaseMembers(),
  },
  "!actualizaMonedas": {
    description:
      "Actualiza en base de datos las monedas de la capital. Debe ejecutarse antes del primer asalto del mes",
    handler: async () =>
      await controllers.playersControllers.updateClanMembersAsaultsPoints(),
  },
  "!comparaMonedas": {
    description:
      "Compara los puntos de la capital obtenidos actuales con los de la base de datos",
    handler: async () =>
      await controllers.playersControllers.compareCapitalPoints(),
  },
};

const commandArgumentsHandlers = {
  "!actualizaPuntos": {
    description:
      "Actualiza los puntos de un integrante. Uso -> !actualizaPuntos/nombre/puntos (puntos puede ser un numero negativo o positivo)",
    handler: async (args, roles) =>
      await controllers.playersControllers.updateMembersPoints(args, roles),
  },
};

function commandsHelp() {
  let allCommands = Object.keys(commandHandlers).filter(
    (key) => key !== "!ayuda"
  );

  let commandDescriptions = allCommands.map(
    (command) => `${command} - ${commandHandlers[command].description} \n`
  );

  let commandWithArguments = Object.keys(commandArgumentsHandlers);

  commandDescriptions = commandDescriptions.concat(
    commandWithArguments.map(
      (command) =>
        `${command} - ${commandArgumentsHandlers[command].description} \n`
    )
  );

  return commandDescriptions.join("\n");
}
module.exports = { commandHandlers, commandArgumentsHandlers };
