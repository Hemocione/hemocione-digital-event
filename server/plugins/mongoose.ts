import mongoose from "mongoose";

export default defineNitroPlugin(async (_nitro) => {
  if (mongoose.connection.readyState !== 1) {
    const config = useRuntimeConfig();

    await mongoose.connect(config.mongodbUri, {
      dbName: config.dbName,
      authSource: "admin",
    });
  }
});
