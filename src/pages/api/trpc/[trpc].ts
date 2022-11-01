import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/trpc/router/_app";
import { createContext } from "../../../server/trpc/context";
import { env } from "../../../env/server.mjs";

export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path}: ${error}`);
        }
      : ({ error }) => {
          if (error.code === "INTERNAL_SERVER_ERROR") {
            // send to bug reporting
            console.error("Something went wrong", error);
          }
        },
});
