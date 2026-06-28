import app from "./app.js";
import logger from "./config/logger.js";
import { env } from "./config/index.js";
import prisma from "./prisma/client.js";

const server = app.listen(env.port, () => {
  logger.info(`Server listening on port ${env.port}`);
});

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection:", reason instanceof Error ? reason : String(reason));
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
