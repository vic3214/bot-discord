const services = require("../services/services");
const fs = require("fs");

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

module.exports = {
  getClanMemebersListOrderByTrophiesDescendent,
  getClanMembersListAlphabeticalOrderByNameDescendent,
  getClanDonationsDifference,
  chooseInsult,
  getAllMembersCapitalContribution,
};
