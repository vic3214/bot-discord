const services = require("../services/services");
const fs = require("fs");
const moment = require("moment");

async function getClanMemebersListOrderByTrophiesDescendent() {
  let response_message = "";
  try {
    const clanMembers = await services.clans_services.getClanMembers(
      process.env.CLAN_TAG
    );

    const members = clanMembers.items.map((member) => member.name);
    response_message = members.join("\n");
  } catch (error) {
    response_message = error.message;
  }

  return response_message;
}

async function getClanMembersListAlphabeticalOrderByNameDescendent() {
  let response_message = "";
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
    response_message = members.join("\n");
  } catch (error) {
    response_message = error.message;
  }

  return response_message;
}

async function getClanDonationsDifference() {
  let response_message = "";
  try {
    const clanMembers = await services.clans_services.getClanMembers(
      process.env.CLAN_TAG
    );

    clanMembers.items.sort((a, b) => {
      return (
        b.donations - b.donationsReceived - (a.donations - a.donationsReceived)
      );
    });

    const members = clanMembers.items.map(
      (member) =>
        member.name + " -> " + (member.donations - member.donationsReceived)
    );

    response_message = members.join("\n");
  } catch (error) {
    response_message = error.message;
  }

  return response_message;
}

async function chooseInsult() {
  // Escoge un insulto aleatorio de la lista que hay en el archio de texto insultos.txt
  const insultos = await fs.promises.readFile("insultos.txt", "utf-8");
  const insultosArray = insultos.split("\n");
  const randomIndex = Math.floor(Math.random() * insultosArray.length);
  return insultosArray[randomIndex];
}

async function getAllMembersCapitalContribution() {
  let response_message = "";
  try {
    const clanMembers = await services.clans_services.getClanMembers(
      process.env.CLAN_TAG
    );

    const playerPromises = clanMembers.items.map((member) =>
      services.players_services.getPlayerInformation(member.tag)
    );

    const membersInfo = await Promise.all(playerPromises);

    membersInfo.sort((a, b) => {
      return b.clanCapitalContributions - a.clanCapitalContributions;
    });

    const members = membersInfo.map(
      (member) =>
        member.name +
        " -> " +
        member.clanCapitalContributions.toLocaleString("es-ES") +
        " puntos"
    );

    response_message = members.join("\n");
  } catch (error) {
    response_message = error.message;
  }

  return response_message;
}

async function getCurrentWarInformation() {
  let response_message = "";
  try {
    const currentWar = await services.clans_services.getCurrentWarInformation(
      process.env.CLAN_TAG
    );

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
    return date.format("LL, LT");
  } catch (error) {
    throw new Error("Invalid date string format");
  }
}

module.exports = {
  getClanMemebersListOrderByTrophiesDescendent,
  getClanMembersListAlphabeticalOrderByNameDescendent,
  getClanDonationsDifference,
  chooseInsult,
  getAllMembersCapitalContribution,
  getCurrentWarInformation,
};
