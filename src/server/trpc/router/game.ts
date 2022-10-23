import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { SQUARES } from "$utils/constants";
import { Chess } from "chess.js";
import { randomId } from "$utils/nanoId";

export const gameRouter = router({
  create: publicProcedure.mutation(async ({ input, ctx }) => {
    // TODO: game type should be inferred
    const game: { id: string; fen: string } = await ctx.prisma.chessgame.create(
      {
        data: {
          id: randomId(),
        },
      }
    );

    return game;
  }),
  get: publicProcedure.query(({ ctx }) => {
    const game = ctx.prisma.chessgame.findFirst();
    return game;
  }),
  getAll: publicProcedure.query(({ ctx }) => {
    const games = ctx.prisma.chessgame.findMany();
    return games;
  }),
  move: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        from: z.enum(SQUARES),
        to: z.enum(SQUARES),
        fen: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const chessObject = new Chess(input.fen);
      const move = chessObject.move({ from: input.from, to: input.to });
      if (!move) {
        return {
          success: false,
          fen: input.fen,
        };
      } else {
        const game: { id: string; fen: string } =
          await ctx.prisma.chessgame.update({
            where: {
              id: input.gameId,
            },
            data: {
              fen: chessObject.fen(),
            },
          });

        return {
          success: true,
          fen: game.fen,
        };
      }
    }),
});
