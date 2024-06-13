import mongoose from "mongoose";

export default defineNitroPlugin(async (_nitro) => {
  if (mongoose.connection.readyState !== 1) {
    const config = useRuntimeConfig();
    try {
      await mongoose.connect(config.mongodbUri, {
        dbName: config.dbName,
        authSource: "admin",
      });
    } catch (error: any) {
      console.error("Failed to connect to MongoDB:", error);
      useBugsnag().notify(error); // Notify Bugsnag about the error when connecting to MongoDB
      throw error;
    }
  }
});
