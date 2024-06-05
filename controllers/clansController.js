const services = require("../services/services");
const fs = require("fs");
const moment = require("moment");
const warStates = require("../enums/warStates");

async function getClanMembersListOrderByTrophiesDescendent() {
  try {
    const clanTag = process.env.CLAN_TAG;
    const clanMembers = await services.clans_services.getClanMembers(clanTag);

    const members = clanMembers.items
      .sort((a, b) => b.trophies - a.trophies)
      .map((member) => member.name);

    return members.join("\n");
  } catch (error) {
    return error.message;
  }
}

async function getClanMembersListOrderByNameDescending() {
  try {
    const clanMembers = await services.clans_services.getClanMembers(
      process.env.CLAN_TAG
    );

    // Eliminar caracteres especiales para ordenar por nombre
    const specialCharacters = /[^a-zA-Z0-9]/g;
    const specialCharactersReplacement = "";
    const sortedMembers = clanMembers.items.sort((a, b) => {
      // Creamos dos strings sin caracteres especiales para comparar y no mutar las cadenas originales
      const nameA = a.name.replace(
        specialCharacters,
        specialCharactersReplacement
      );
      const nameB = b.name.replace(
        specialCharacters,
        specialCharactersReplacement
      );

      return nameA.localeCompare(nameB);
    });

    const members = sortedMembers.map((member) => member.name);
    return members.join("\n");
  } catch (error) {
    return error.message;
  }
}

async function getClanDonationsDifference() {
  try {
    const clanTag = process.env.CLAN_TAG;
    const clanMembers = await services.clans_services.getClanMembers(clanTag);

    const sortedMembers = clanMembers.items.sort(
      (a, b) =>
        b.donations - b.donationsReceived - (a.donations - a.donationsReceived)
    );

    const memberDonationDifferences = sortedMembers.map(
      (member) =>
        `${member.name} -> ${member.donations - member.donationsReceived}`
    );

    return memberDonationDifferences.join("\n");
  } catch (error) {
    return error.message;
  }
}

async function chooseInsult() {
  // Escoge un insulto aleatorio de la lista que hay en el archio de texto insultos.txt
  const insultos = await fs.promises.readFile("insultos.txt", "utf-8");
  const insultosArray = insultos.split("\n");
  const randomIndex = Math.floor(Math.random() * insultosArray.length);
  return insultosArray[randomIndex];
}

async function getAllMembersCapitalContribution() {
  try {
    const clanTag = process.env.CLAN_TAG;
    const clanMembers = await services.clans_services.getClanMembers(clanTag);

    const membersInfo = await Promise.all(
      clanMembers.items.map((member) =>
        services.players_services.getPlayerInformation(member.tag)
      )
    );

    const sortedMembersInfo = membersInfo.sort(
      (a, b) => b.clanCapitalContributions - a.clanCapitalContributions
    );

    const contributionMessages = sortedMembersInfo.map(
      (member) =>
        `${member.name} -> ${member.clanCapitalContributions.toLocaleString(
          "es-ES"
        )} puntos`
    );

    return contributionMessages.join("\n");
  } catch (error) {
    return error.message;
  }
}

async function getCurrentWarInformation() {
  let response_message = "";
  try {
    const currentWar = await services.clans_services.getCurrentWarInformation(
      process.env.CLAN_TAG
    );

    if (currentWar.state === warStates.NotInWar) {
      return "El clan no se encuentra en guerra ahora mismo";
    }

    // Order war memebers by mapPosition
    currentWar.clan.members.sort((a, b) => a.mapPosition - b.mapPosition);
    const warMembers = currentWar.clan.members.map((member) => member.name);

    response_message = `Comienzo ->  ${formatDate(
      currentWar.startTime
    )}  /   Final ->  ${formatDate(currentWar.endTime)}  (hora Española)\n\n`;
    response_message += `${currentWar.clan.name}  ${currentWar.clan.stars} ⭐  -  ${currentWar.opponent.stars} ⭐  ${currentWar.opponent.name} \n\n`;
    response_message += `${currentWar.clan.name}  ${currentWar.clan.destructionPercentage}% destruido  -  ${currentWar.opponent.name}  ${currentWar.opponent.destructionPercentage}% destruido \n\n`;
    response_message += `${currentWar.clan.name}  ${currentWar.clan.attacks} ataques  -  ${currentWar.opponent.name}  ${currentWar.opponent.attacks} ataques\n\n`;
    response_message += `Alineación:  ${warMembers.join(", ")}`;
  } catch (error) {
    response_message = error.message;
  }

  return response_message;
}

function formatDate(dateString) {
  try {
    const date = moment.utc(dateString, "YYYYMMDDTHHmmss.SSSZ");
    return date.add(2, "hours").format("LL, LT");
  } catch (error) {
    throw new Error("Invalid date string format");
  }
}

async function getClanLeagueClassification() {
  try {
    const clanTag = process.env.CLAN_TAG;
    const leagueGroup = await services.clans_services.getLeagueGroup(clanTag);

    if (leagueGroup.reason) {
      return "El clan no se encuentra en una liga ahora mismo";
    }

    const warTags = leagueGroup.rounds.flatMap((round) => round.warTags);
    const filteredWarTags = warTags.filter((tag) => tag !== "#0");

    const warsInfo = await Promise.all(
      filteredWarTags.map((tag) =>
        services.clans_services.getClanLeagueWarInformation(tag)
      )
    );

    const warsData = constructWarData(warsInfo);
    const sortedWarData = Object.fromEntries(
      Object.entries(warsData).sort((a, b) => b[1].stars - a[1].stars)
    );

    return constructLeagueClassificationMessage(sortedWarData);
  } catch (error) {
    return error.message;
  }
}

async function getCurrentLeagueWar() {
  try {
    const clanTag = process.env.CLAN_TAG;
    const leagueGroup = await services.clans_services.getLeagueGroup(clanTag);

    if (!leagueGroup.rounds) {
      return "The clan is not currently in a league war";
    }

    const warTags = leagueGroup.rounds.flatMap((round) => round.warTags);
    const filteredWarTags = warTags.filter((tag) => tag !== "#0");

    const warsInfo = await Promise.all(
      filteredWarTags.map((tag) =>
        services.clans_services.getClanLeagueWarInformation(tag)
      )
    );

    const currentWar = warsInfo.find(
      (war) =>
        war.state === warStates.InWar &&
        (war.clan.tag === clanTag || war.opponent.tag === clanTag)
    );

    if (!currentWar) {
      return "El clan no se encuentra en una guerra ahora mismo";
    }

    const membersWithoutAttacks = getCurrentWarMembersWithoutAttacks(
      currentWar,
      clanTag
    );

    return constructLeagueWarMessage(currentWar, membersWithoutAttacks);
  } catch (error) {
    return error.message;
  }
}

function getCurrentWarMembersWithoutAttacks(currentWar, clanTag) {
  if (currentWar.clan.tag === clanTag) {
    return currentWar.clan.members.filter((member) => !member.attacks);
  } else {
    return currentWar.opponent.members.filter((member) => !member.attacks);
  }
}

function constructLeagueWarMessage(currentWar, membersWithoutAttacks) {
  let message = `Comienzo -> ${formatDate(
    currentWar.startTime
  )} / Final -> ${formatDate(currentWar.endTime)} (hora Española)\n\n`;
  message += `${currentWar.clan.name} ${currentWar.clan.stars} ⭐ - ${currentWar.opponent.stars} ⭐ ${currentWar.opponent.name}\n\n`;
  message += `${currentWar.clan.name} ${currentWar.clan.destructionPercentage}% destruido - ${currentWar.opponent.name} ${currentWar.opponent.destructionPercentage}% destruido\n\n`;
  message += `${currentWar.clan.name} ${currentWar.clan.attacks} ataques - ${currentWar.opponent.name} ${currentWar.opponent.attacks} ataques\n\n`;

  const alignmentMembers =
    currentWar.clan.tag === clanTag
      ? currentWar.clan.members
      : currentWar.opponent.members;
  message += `Alineación: ${alignmentMembers
    .sort((a, b) => b.townhallLevel - a.townhallLevel)
    .map((member) => member.name)
    .join(", ")}`;

  if (membersWithoutAttacks.length > 0) {
    message += `\n\nFaltan por atacar: ${membersWithoutAttacks
      .sort((a, b) => b.townhallLevel - a.townhallLevel)
      .map((member) => member.name)
      .join(", ")}`;
  }

  return message;
}

function constructWarData(warsInfo) {
  let warsData = {};

  for (const war of warsInfo) {
    const {
      tag: clanTag,
      stars: clanStars,
      destructionPercentage: clanDestructionPercentage,
      name: clanName,
    } = war.clan;
    const {
      tag: opponentTag,
      stars: opponentStars,
      destructionPercentage: opponentDestructionPercentage,
      name: opponentName,
    } = war.opponent;

    // Inicializar los datos de los clanes si no existen
    if (!warsData[clanTag]) {
      warsData[clanTag] = {
        stars: 0,
        name: clanName,
      };
    }

    if (!warsData[opponentTag]) {
      warsData[opponentTag] = {
        stars: 0,
        name: opponentName,
      };
    }

    // Actualizar las estrellas de los clanes
    warsData[clanTag].stars += clanStars;
    warsData[opponentTag].stars += opponentStars;

    // Comprobar el ganador de la guerra y sumar las estrellas extras al ganar la guerra
    const endTime = moment(war.endTime).add(2, "hours").toDate();
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + 2);

    if (clanStars > opponentStars && endTime < currentTime) {
      warsData[clanTag].stars += 10;
    }

    if (clanStars < opponentStars && endTime < currentTime) {
      warsData[opponentTag].stars += 10;
    }

    if (clanStars === opponentStars && endTime < currentTime) {
      if (clanDestructionPercentage > opponentDestructionPercentage) {
        warsData[clanTag].stars += 10;
      } else if (clanDestructionPercentage < opponentDestructionPercentage) {
        warsData[opponentTag].stars += 10;
      } else {
        warsData[clanTag].stars += 5;
        warsData[opponentTag].stars += 5;
      }
    }
  }

  return warsData;
}

function constructLeagueClassificationMessage(sortedWarData) {
  let message = "";
  let counter = 1;

  for (const [tag, data] of Object.entries(sortedWarData)) {
    if (counter <= 2) {
      message += `${counter}. 🔼 ${data.name}  ${data.stars} ⭐\n`;
    } else if (counter > 6) {
      message += `${counter}. 🔽 ${data.name}  ${data.stars} ⭐\n`;
    } else {
      message += `${counter}. ${data.name}  ${data.stars} ⭐\n`;
    }

    counter++;
  }

  return message;
}

module.exports = {
  getClanMembersListOrderByTrophiesDescendent,
  getClanMembersListOrderByNameDescending,
  getClanDonationsDifference,
  chooseInsult,
  getAllMembersCapitalContribution,
  getCurrentWarInformation,
  getClanLeagueClassification,
  getCurrentLeagueWar,
};
