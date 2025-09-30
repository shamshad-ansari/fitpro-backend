import mongoose from "mongoose";

export async function connectDB(uri) {
  // Tune Mongoose behaviour before connecting
  mongoose.set("strictQuery", true);

  // Connect once at startup
  await mongoose.connect(uri);

  // Helpful diagnostics
  const { host, name } = mongoose.connection;
  console.log(`MongoDB connected: ${host}/${name}`);

  // Listeners for visibility
  mongoose.connection.on("disconnected", () => {
    console.error("MongoDB disconnected");
  });
}
