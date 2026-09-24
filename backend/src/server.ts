import app from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";

async function start() {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Lions CMS API listening on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
