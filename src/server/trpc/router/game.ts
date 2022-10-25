import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { SQUARES } from "$utils/constants";
import { Chess } from "chess.js";
import { randomId } from "$utils/nanoId";
import { TRPCError } from "@trpc/server";
import { validateMove } from "$utils/validateMove";
import { makeMove } from "$utils/makeMove";
import { PreGameColor } from "@prisma/client";

export const gameRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        blackBaseTimeSeconds: z.number().min(10).max(86400),
        blackIncrementSeconds: z.number().min(0).max(6000).default(0),
        whiteBaseTimeSeconds: z.number().min(10).max(86400),
        whiteIncrementSeconds: z.number().min(0).max(6000).default(0),
        startingFen: z.string().optional(),
        isRated: z.boolean().default(false),
        isInviteOnly: z.boolean().default(false),
        color: z.enum(["black", "white", "random"]),
        opponentUsername: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        blackBaseTimeSeconds,
        blackIncrementSeconds,
        whiteBaseTimeSeconds,
        whiteIncrementSeconds,
        startingFen,
        isRated,
        isInviteOnly,
        color,
        opponentUsername,
      } = input;

      const preGame = await ctx.prisma.preGame.create({
        data: {
          blackBaseTimeSeconds,
          blackIncrementSeconds,
          whiteBaseTimeSeconds,
          whiteIncrementSeconds,
          isRated,
          isInviteOnly,
          startingFen,
          gameCreatorColor: color,
          preGameCreator: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          preGameOpponent: {
            connect: {
              username: opponentUsername,
            },
          },
        },
      });

      return preGame;
    }),
  get: publicProcedure.query(({ ctx }) => {
    const game = ctx.prisma.chessGame.findFirst();
    return game;
  }),
  getAll: publicProcedure.query(({ ctx }) => {
    const games = ctx.prisma.chessGame.findMany();
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
      const game = await ctx.prisma.chessGame.findUnique({
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

      await ctx.prisma.chessGame.update({
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
