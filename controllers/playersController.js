const services = require("../services/services");
const Member = require("../models/Member");
const heroNames = require("../enums/heroNames");
const thHeroLevels = require("../constants/thHeroLevels");
const clansControllers = require("../controllers/clansController");

async function getHerosLevelsForAllMembers() {
  try {
    const clanMembers = await services.clans_services.getClanMembers(
      process.env.CLAN_TAG
    );
    const membersInfo = await Promise.all(
      clanMembers.items.map(async (member) => {
        const playerInfo = await services.players_services.getPlayerInformation(
          member.tag
        );
        return {
          name: playerInfo.name,
          heroes: playerInfo.heroes
            .filter(
              (hero) => !["Battle Machine", "Battle Copter"].includes(hero.name)
            )
            .map((hero) => {
              const heroName =
                heroNames[
                  {
                    "Barbarian King": "BarbarianKing",
                    "Archer Queen": "ArcherQueen",
                    "Grand Warden": "GrandWarden",
                    "Royal Champion": "RoyalChampion",
                  }[hero.name] || hero.name
                ];
              return `${heroName} ${hero.level}`;
            }),
        };
      })
    );

    const response_message = membersInfo
      .filter((member) => member.heroes.length > 0)
      .map((member) => `${member.name} -> ${member.heroes.join(" | ")}`)
      .join("\n");

    return response_message;
  } catch (error) {
    return error.message;
  }
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

async function updateMembersPoints(args, roles) {
  if (!roles.cache.has(process.env.COLIDER_ROLE_ID)) {
    return "No tienes el rol necesario para ejecutar este comando";
  }

  const member = await Member.findOne({ name: args[0] });
  if (!member) {
    return "Miembro no encontrado";
  }
  member.expulsion_points += parseInt(args[1]);
  await member.save();
  return getClanMembersPointsTable();
}

async function updateDataBaseMembers() {
  try {
    const clanTag = process.env.CLAN_TAG;
    const clanMembers = await services.clans_services.getClanMembers(clanTag);
    const membersInDatabase = await Member.find();
    const membersInClan = new Set(
      clanMembers.items.map((member) => member.tag)
    );

    const updatePromises = clanMembers.items.map(async (member) => {
      const memberInDatabase = membersInDatabase.find(
        (m) => m.tag === member.tag
      );
      const capitalPoints = await services.players_services
        .getPlayerInformation(member.tag)
        .then((player) => player.clanCapitalContributions);

      // Si el miembro no está en la base de datos se añade
      if (!memberInDatabase) {
        const newMember = new Member({
          name: member.name,
          tag: member.tag,
          expulsionPoints: 10,
          monthly_capital_points: capitalPoints,
          league_attacks: 0,
          league_stars: 0,
        });
        await newMember.save();
      }
    });

    await Promise.all(updatePromises);

    // Se borrarán los miembros que no estén en el clan
    const membersToDelete = membersInDatabase.filter(
      (member) => !membersInClan.has(member.tag)
    );
    await Member.deleteMany({
      tag: { $in: membersToDelete.map((m) => m.tag) },
    });

    return "Base de datos actualizada";
  } catch (error) {
    return `Error al actualizar los miembros: ${error}`;
  }
}

async function updateClanMembersAsaultsPoints() {
  const clanMembers = await services.clans_services.getClanMembers(
    process.env.CLAN_TAG
  );

  const memberTags = clanMembers.items.map((member) => member.tag);
  const membersInfo = await Promise.all(
    memberTags.map((tag) => services.players_services.getPlayerInformation(tag))
  );

  const updatePromises = membersInfo.map(async (member) => {
    const memberInDatabase = await Member.findOne({ tag: member.tag });
    if (!memberInDatabase) {
      return `El miembro ${member.name} no se ha encontrado, se debe actualizar la base de datos`;
    }

    memberInDatabase.monthly_capital_points = member.clanCapitalContributions;
    await memberInDatabase.save();
  });

  await Promise.all(updatePromises);
  return "Puntos de asalto actualizados";
}

async function compareCapitalPoints() {
  const clanMembers = await services.clans_services.getClanMembers(
    process.env.CLAN_TAG
  );

  const memberTags = clanMembers.items.map((member) => member.tag);
  const [membersInfo, membersInDatabase] = await Promise.all([
    Promise.all(
      memberTags.map((tag) =>
        services.players_services.getPlayerInformation(tag)
      )
    ),
    Member.find({ tag: { $in: memberTags } }),
  ]);

  const membersInDatabaseByTag = membersInDatabase.reduce((acc, member) => {
    acc[member.tag] = member;
    return acc;
  }, {});

  const membersDifference = await Promise.all(
    membersInfo.map(async (member) => {
      const memberInDatabase = membersInDatabaseByTag[member.tag];
      return {
        name: member.name,
        difference:
          member.clanCapitalContributions -
          (memberInDatabase ? memberInDatabase.monthly_capital_points : 0),
      };
    })
  );

  membersDifference.sort((a, b) => b.difference - a.difference);
  const message = membersDifference
    .map((member) => `${member.name} -> ${member.difference}`)
    .join("\n");

  return message;
}

function getWardenLevel(member) {
  const wardenMaxLevel = thHeroLevels[member.townHallLevel].Warden.maxLevel;
  const memberWardenLevel = member.heroes[2] ? member.heroes[2].level : 0;

  if (memberWardenLevel > 0) {
    if (wardenMaxLevel - memberWardenLevel === 0) {
      return member.heroes[2].level;
    } else if (
      wardenMaxLevel - memberWardenLevel <
      thHeroLevels[member.townHallLevel].Upgrade
    ) {
      return member.heroes[2].level + (wardenMaxLevel - memberWardenLevel);
    } else {
      return (
        member.heroes[2].level + thHeroLevels[member.townHallLevel].Upgrade
      );
    }
  } else if (!member.heroes[2] && wardenMaxLevel > 0) {
    return 4;
  }

  return 0;
}

function getRoyalLevel(member) {
  const royalMaxLevel = thHeroLevels[member.townHallLevel].Royal.maxLevel;
  const memberRoyalLevel = member.heroes[4] ? member.heroes[4].level : 0;

  if (memberRoyalLevel > 0) {
    if (royalMaxLevel - memberRoyalLevel === 0) {
      return member.heroes[4].level;
    } else if (
      royalMaxLevel - memberRoyalLevel <
      thHeroLevels[member.townHallLevel].Upgrade
    ) {
      return member.heroes[4].level + (royalMaxLevel - memberRoyalLevel);
    } else {
      return (
        member.heroes[4].level + thHeroLevels[member.townHallLevel].Upgrade
      );
    }
  } else if (!member.heroes[4] && royalMaxLevel > 0) {
    return 4;
  }

  return 0;
}

function getQueenLevel(member) {
  const queenMaxLevel = thHeroLevels[member.townHallLevel].Queen.maxLevel;
  const wardenMaxLevel = thHeroLevels[member.townHallLevel].Warden.maxLevel;
  const memberQueenLevel = member.heroes[1] ? member.heroes[1].level : 0;
  const memberWardenLevel = member.heroes[2] ? member.heroes[2].level : 0;

  if (
    memberQueenLevel > 0 &&
    (wardenMaxLevel - memberWardenLevel === 0 || wardenMaxLevel === 0)
  ) {
    if (queenMaxLevel - memberQueenLevel === 0) {
      return member.heroes[1].level;
    } else if (
      queenMaxLevel - memberQueenLevel <
      thHeroLevels[member.townHallLevel].Upgrade
    ) {
      return member.heroes[1].level + (queenMaxLevel - memberQueenLevel);
    } else {
      return (
        member.heroes[1].level + thHeroLevels[member.townHallLevel].Upgrade
      );
    }
  } else if (member.heroes[1]) {
    return member.heroes[1].level;
  } else if (!member.heroes[1] && queenMaxLevel > 0) {
    return 4;
  }

  return 0;
}

function getKingLevel(member) {
  const kingMaxLevel = thHeroLevels[member.townHallLevel].King.maxLevel;
  const wardenMaxLevel = thHeroLevels[member.townHallLevel].Warden.maxLevel;
  const royalMaxLevel = thHeroLevels[member.townHallLevel].Royal.maxLevel;
  const memberKingLevel = member.heroes[0] ? member.heroes[0].level : 0;
  const memberWardenLevel = member.heroes[2] ? member.heroes[2].level : 0;
  const memberRoyalLevel = member.heroes[4] ? member.heroes[4].level : 0;

  if (
    memberKingLevel > 0 &&
    (wardenMaxLevel - memberWardenLevel === 0 || wardenMaxLevel === 0) &&
    (royalMaxLevel === 0 || royalMaxLevel - memberRoyalLevel === 0)
  ) {
    if (kingMaxLevel - memberKingLevel === 0) {
      return member.heroes[0].level;
    } else if (
      kingMaxLevel - memberKingLevel <
      thHeroLevels[member.townHallLevel].Upgrade
    ) {
      return member.heroes[0].level + (kingMaxLevel - memberKingLevel);
    } else {
      return (
        member.heroes[0].level + thHeroLevels[member.townHallLevel].Upgrade
      );
    }
  } else if (member.heroes[0]) {
    return member.heroes[0].level;
  } else if (!member.heroes[0] && kingMaxLevel > 0) {
    return 4;
  }

  return 0;
}

function formatMemberInfo(member) {
  return `${member.name} -> ${member.thLevel} |${member.kingLevel}| ${
    member.queenLevel
  }| ${member.wardenLevel}| ${
    member.royalLevel
  }| ${member.capital.toLocaleString("es-ES")}`;
}

async function getNextLeagueRequirements() {
  const clanMembers = await services.clans_services.getClanMembers(
    process.env.CLAN_TAG
  );
  const memberTags = clanMembers.items.map((member) => member.tag);
  const membersInfo = await Promise.all(
    memberTags.map((tag) => services.players_services.getPlayerInformation(tag))
  );

  const members = membersInfo
    .map((member) => ({
      name: member.name,
      thLevel: member.townHallLevel,
      kingLevel: getKingLevel(member),
      queenLevel: getQueenLevel(member),
      wardenLevel: getWardenLevel(member),
      royalLevel: getRoyalLevel(member),
      capital: member.clanCapitalContributions + 64_000,
    }))
    .sort((a, b) => b.thLevel - a.thLevel);

  const message =
    `Miembro | Th | Rey | Reina | Centinela | Luchadora | Medallas\n` +
    members.map(formatMemberInfo).join("\n");
  return message;
}

async function updateMemberLeagueAttack(args, roles) {
  if (!roles.cache.has(process.env.COLIDER_ROLE_ID)) {
    return "No tienes el rol necesario para ejecutar este comando";
  }

  const member = await Member.findOne({ name: args[0] });
  if (!member) {
    return "Miembro no encontrado";
  }

  member.league_stars += parseInt(args[1]);
  member.league_attacks += 1;
  await member.save();
  return clansControllers.getMedianLeagueAttacksForAllMembers();
}

module.exports = {
  getHerosLevelsForAllMembers,
  getClanMembersPointsTable,
  updateMembersPoints,
  updateDataBaseMembers,
  updateClanMembersAsaultsPoints,
  compareCapitalPoints,
  getNextLeagueRequirements,
  updateMemberLeagueAttack,
};
