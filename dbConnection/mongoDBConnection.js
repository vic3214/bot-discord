const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado a MongoDB con éxito");
  } catch (error) {
    console.log(error);
    throw new Error("No se pudo conectar a MongoDB");
  }
};

module.exports = {
  connectToMongoDB,
};
