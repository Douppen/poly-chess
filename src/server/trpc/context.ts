import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { inferAsyncReturnType } from "@trpc/server";
import { prisma } from "../db/client";
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/dist/adapters/node-http";
import { IncomingMessage } from "http";
import { getSession } from "next-auth/react";
import ws from "ws";

export const createContext = async (
  opts:
    | CreateNextContextOptions
    | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
) => {
  // TODO: use serversidesession instead
  const session = await getSession(opts);

  console.log("createContext for", session?.user?.name ?? "unknown user");

  return {
    session,
    prisma,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
