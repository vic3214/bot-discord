const services = require("../services/services");
const Member = require("../models/Member");

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

  const members = clanMembers.items.map((member) => member.name);

  let maxNameLength = Math.max(...members.map((member) => member.length));
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

  // Fetch the points for each clan member from the database
  for (const member of members) {
    const clanMember = await Member.findOne({ name: member });
    const points = clanMember ? clanMember.expulsion_points : "0 ";

    // Nombre
    row += "| " + member + " ".repeat(maxNameLength - member.length) + " |";
    // Puntos
    if (points.toString().length < 2) {
      row += `   ${points}    |\n`;
    } else {
      row += `  ${points}    |\n`;
    }
  }
  row += "```";
  return row;
}

async function updateMembersPoints(args) {
  console.log(args);
  const member = await Member.findOne({ name: args[0] });
  if (!member) {
    return "Miembro no encontrado";
  }
  member.expulsion_points += parseInt(args[1]);
  await member.save();
  return getClanMembersPointsTable();
}

async function updateDataBase() {
  const clanMembers = await services.clans_services.getClanMembers(
    process.env.CLAN_TAG
  );
  for (const member of clanMembers.items) {
    const memberInDatabase = await Member.findOne({ tag: member.tag });

    if (!memberInDatabase) {
      await Member.create({
        name: member.name,
        tag: member.tag,
        expulsionPoints: 10,
      });
    }
  }

  // Delete members that not are in the clan
  const membersInDatabase = await Member.find();
  const membersInClan = clanMembers.items.map((member) => member.tag);
  const membersToDelete = membersInDatabase.filter(
    (member) => !membersInClan.includes(member.tag)
  );
  for (const member of membersToDelete) {
    await Member.findByIdAndDelete(member._id);
  }

  return "Base de datos actualizada";
}

module.exports = {
  getHerosLevelsForAllMembers,
  getClanMembersPointsTable,
  updateMembersPoints,
  updateDataBase,
};
