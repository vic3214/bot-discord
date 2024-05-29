const services = require("../services/services");

async function getHerosLevelsForAllMembers() {
  let response_message = "";
  try {
    const clanMembers = await services.clans_services.getClanMembers(
      process.env.CLAN_TAG
    );

    const playerPromises = clanMembers.items.map((member) =>
      services.players_services.getPlayerInformation(member.tag)
    );

    const membersInfo = await Promise.all(playerPromises);

    const members = membersInfo.reduce((acc, member) => {
      const heroesInfo = member.heroes
        .filter((hero) => {
          // Ignore Battle Machine and Battle Copter
          return (
            hero.name !== "Battle Machine" && hero.name !== "Battle Copter"
          );
        })
        .map((hero) => {
          // Rename heroes
          if (hero.name === "Barbarian King") hero.name = "K";
          else if (hero.name === "Archer Queen") hero.name = "Q";
          else if (hero.name === "Grand Warden") hero.name = "C";
          else if (hero.name === "Royal Champion") hero.name = "L";

          return `${hero.name} ${hero.level} `;
        });

      if (heroesInfo.length > 0) {
        acc.push(`${member.name} -> ${heroesInfo}`);
      }

      return acc;
    }, []);

    response_message = members.join("\n");
  } catch (error) {
    response_message = error.message;
  }

  return response_message;
}

async function getClanMembersPointsTable() {
  const clanMembers = await services.clans_services.getClanMembers(
    process.env.CLAN_TAG
  );

  const members = clanMembers.items.map((member) =>
    member.name.replace(/[^\u0000-\u007F]/g, "")
  );

  let maxNameLength = Math.max(...members.map((member) => member.length));
  let puntos = 10;
  let row =
    "```\n| Miembro" +
    " ".repeat(maxNameLength + 1 - "Miembro".length) +
    "| Puntos |\n";

  row +=
    "|" +
    "-".repeat(maxNameLength + 1) +
    " |" +
    "-".repeat((" " + "Puntos" + " ").length) +
    "|\n";

  // Iterar sobre los miembros y construir las filas de la tabla
  for (let i = 0; i < members.length; i++) {
    // Nombre
    row +=
      "| " + members[i] + " ".repeat(maxNameLength - members[i].length) + " |";
    // Puntos
    row += "   " + puntos + "   |\n";
  }
  row += "```";
  return row;
}

module.exports = {
  getHerosLevelsForAllMembers,
  getClanMembersPointsTable,
};
