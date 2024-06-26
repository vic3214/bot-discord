// All posibles clash of clans API requests for clans

const header = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.TOKEN_API,
  },
};

function manageErrors(error) {
  if (error.status === 400) {
    return { message: "No se encontró el clan" };
  }
  if (error.status === 403) {
    return { message: "Acceso denegado" };
  }
  if (error.status === 404) {
    return { message: "No se encontro la liga" };
  }
  if (error.status === 429) {
    return {
      message: "Límite de solicitudes alcanzado, debe esperar un tiempo",
    };
  }
  if (error.status === 500) {
    return { message: "Error del servidor" };
  }
  if (error.status === 503) {
    return { message: "Servidor no disponible actualmente" };
  }
  return { message: "Error desconocido" };
}

function getLeagueGroup(clanTag) {
  const url =
    process.env.URL_API +
    `clans/${encodeURIComponent(clanTag)}/currentwar/leaguegroup`;
  return fetch(url, header)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return manageErrors(error);
    });
}

function getClanLeagueWarInformation(warTag) {
  const url =
    process.env.URL_API + `clanwarleagues/wars/${encodeURIComponent(warTag)}`;
  return fetch(url, header)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return manageErrors(error);
    });
}

function getClanWarLog(clanTag) {
  const url =
    process.env.URL_API + `clans/${encodeURIComponent(clanTag)}/warlog`;
  return fetch(url, header)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return manageErrors(error);
    });
}

function searchClan(search) {
  const url =
    process.env.URL_API + `clans?search=${encodeURIComponent(search)}`;
  return fetch(url, header)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return manageErrors(error);
    });
}

function getCurrentWarInformation(clanTag) {
  const url =
    process.env.URL_API + `clans/${encodeURIComponent(clanTag)}/currentwar`;
  return fetch(url, header)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return manageErrors(error);
    });
}

function getClanInformation(clanTag) {
  const url = process.env.URL_API + `clans/${encodeURIComponent(clanTag)}`;
  return fetch(url, header)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return manageErrors(error);
    });
}

function getClanMembers(clanTag) {
  const url =
    process.env.URL_API + `clans/${encodeURIComponent(clanTag)}/members`;
  return fetch(url, header)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return manageErrors(error);
    });
}

function getCapitalRaidSeasons(clanTag) {
  const url =
    process.env.URL_API +
    `clans/${encodeURIComponent(clanTag)}/capitalraidseasons`;
  return fetch(url, header)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return manageErrors(error);
    });
}

module.exports = {
  getCapitalRaidSeasons,
  getClanInformation,
  getClanMembers,
  getClanLeagueWarInformation,
  getClanWarLog,
  getCurrentWarInformation,
  getLeagueGroup,
  searchClan,
};
