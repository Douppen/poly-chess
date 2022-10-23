// src/server/trpc/router/_app.ts
import { router } from "../trpc";
import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { questionRouter } from "./question";
import { gameRouter } from "./game";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  question: questionRouter,
  game: gameRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
