import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { SQUARES } from "$utils/constants";
import { Chess } from "chess.js";
import { randomId } from "$utils/nanoId";
import { TRPCError } from "@trpc/server";
import { validateMove } from "$utils/validateMove";
import { makeMove } from "$utils/makeMove";

export const gameRouter = router({
  create: publicProcedure.mutation(async ({ input, ctx }) => {
    // TODO: game type should be inferred
    const game = await ctx.prisma.chessgame.create({
      data: {
        incrementSeconds: 3,
        initialTimeSeconds: 300,
        state: "ongoing",
      },
      select: {
        id: true,
        fen: true,
      },
    });

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
        promotion: z.enum(["b", "r", "n", "q"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const game = await ctx.prisma.chessgame.findUnique({
        where: {
          id: input.gameId,
        },
        select: {
          fen: true,
        },
      });

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "game not found",
        });
      }

      const { isValid, requiresPromotion } = validateMove(
        game.fen,
        input.from,
        input.to
      );

      if (!isValid) {
        return {
          success: false,
          fen: game.fen, // the initial fen
        };
      }

      if (requiresPromotion && !input.promotion) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "promotion not specified",
        });
      }

      const newFen = makeMove(game.fen, input.from, input.to, input.promotion);

      // Pusher trigger here

      await ctx.prisma.chessgame.update({
        where: {
          id: input.gameId,
        },
        data: {
          fen: newFen,
        },
      });

      return {
        success: true,
        fen: newFen,
      };
    }),
});
