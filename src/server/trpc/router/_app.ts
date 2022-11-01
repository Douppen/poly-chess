import { observable } from "@trpc/server/observable";
import { publicProcedure, router } from "../trpc";
import { authRouter } from "./auth";
import { gameRouter } from "./game";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => "A-OK"),
  auth: authRouter,
  game: gameRouter,
  randomNumber: publicProcedure.subscription(() => {
    return observable<number>((emit) => {
      const int = setInterval(() => {
        emit.next(Math.random());
      }, 500);
      return () => {
        clearInterval(int);
      };
    });
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
