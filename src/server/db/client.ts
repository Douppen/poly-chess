// src/server/db/client.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { env } from "../../env/server.mjs";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaOptions: Prisma.PrismaClientOptions = {
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
};

export const prisma = global.prisma || new PrismaClient(prismaOptions);

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
