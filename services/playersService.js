// All posibles clash of clans API requests for players

const header = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.TOKEN_API,
  },
};

function manageErrors(error) {
  if (error.status === 400) {
    return { message: "Parámetros incorrectos" };
  }
  if (error.status === 403) {
    return { message: "Acceso denegado" };
  }
  if (error.status === 404) {
    return { message: "No se encontro el jugador" };
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

function getPlayerInformation(playerTag) {
  const url = process.env.URL_API + `players/${encodeURIComponent(clanTag)}`;
  return fetch(url, header)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return manageErrors(error);
    });
}

module.exports = { getPlayerInformation };
