const services = require("../services/services");

async function getClanMemebersList() {
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

module.exports = { getClanMemebersList, getClanDonationsDifference };
