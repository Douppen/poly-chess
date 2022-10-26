import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { SQUARES } from "$utils/constants";
import { TRPCError } from "@trpc/server";
import { validateMove } from "$utils/validateMove";
import { makeMove } from "$utils/makeMove";
import { randomId } from "$utils/nanoId";
import { Chess } from "chess.js";
import { MovesHistory } from "types/chessTypes";
import { Prisma } from "@prisma/client";
import { getColorFromFen } from "$utils/getColorFromFen";

export const gameRouter = router({
  createPreGame: protectedProcedure
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

      let gameId = randomId();
      while (await ctx.prisma.chessGame.findUnique({ where: { id: gameId } })) {
        gameId = randomId();
      }

      const opponent = await ctx.prisma.user.findUnique({
        where: { username: opponentUsername },
        select: {
          id: true,
        },
      });

      if (!opponent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find opponent with that username",
        });
      }

      if (input.startingFen) {
        const chessEngine = new Chess();
        const isValidFen = chessEngine.load(input.startingFen);
        if (!isValidFen) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid FEN",
          });
        }
      }

      const preGame = await ctx.prisma.preGame.create({
        data: {
          id: gameId,
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
              id: opponent.id,
            },
          },
        },
        select: {
          id: true,
        },
      });

      return preGame;
    }),
  createGameFromPreGame: protectedProcedure
    .input(
      z.object({
        preGameId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // We make it the opponent's responsibility to create the game when they accept the pre-game
      const { preGameId } = input;

      const preGame = await ctx.prisma.preGame.findUnique({
        where: {
          id: preGameId,
        },
        include: {
          preGameCreator: true,
          preGameOpponent: true, // opponent is going to exist here because for the game to be created, the opponent must have accepted the preGame
        },
      });

      if (!preGame) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pre-game not found",
        });
      }

      if (preGame.hasResolved) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pre-game has already been resolved",
        });
      }

      if (
        preGame.isInviteOnly &&
        preGame.preGameOpponentId !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not invited to this game",
        });
      }

      if (preGame.preGameCreatorId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot play against yourself",
        });
      }

      // if no one has been invited to the game yet, the user making the request should be the opponent
      let opponentId: string;
      if (!preGame.preGameOpponent) {
        opponentId = ctx.session.user.id as string;
      } else {
        opponentId = preGame.preGameOpponent.id;
      }

      const gameCreatorColor =
        preGame.gameCreatorColor === "random"
          ? Math.random() > 0.5
            ? "white"
            : "black"
          : preGame.gameCreatorColor;

      const movesHistory: MovesHistory = [];

      const game = await ctx.prisma.chessGame.create({
        data: {
          id: preGameId,
          blackBaseTimeSeconds: preGame.blackBaseTimeSeconds,
          blackIncrementSeconds: preGame.blackIncrementSeconds,
          whiteBaseTimeSeconds: preGame.whiteBaseTimeSeconds,
          whiteIncrementSeconds: preGame.whiteIncrementSeconds,
          isRated: preGame.isRated,
          startingFen: preGame.startingFen,
          gameCreatorColor,
          gameCreator: {
            connect: {
              id: preGame.preGameCreatorId,
            },
          },
          opponent: {
            connect: {
              id: opponentId,
            },
          },
          blackRemainingMillis: preGame.blackBaseTimeSeconds * 1000,
          whiteRemainingMillis: preGame.whiteBaseTimeSeconds * 1000,
          fen: preGame.startingFen,
          isInviteOnly: preGame.isInviteOnly,
          state: "notStarted",
          movesHistory,
        },
      });

      await ctx.prisma.preGame.delete({
        where: {
          id: preGameId,
        },
      });

      return game;
    }),

  get: publicProcedure.query(({ ctx }) => {
    const game = ctx.prisma.chessGame.findFirst();
    return game;
  }),
  getAll: publicProcedure.query(({ ctx }) => {
    const games = ctx.prisma.chessGame.findMany();
    return games;
  }),
  move: protectedProcedure
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
          gameCreatorId: true,
          opponentId: true,
          gameCreatorColor: true,
        },
      });

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "game not found",
        });
      }

      if (
        game.gameCreatorId !== ctx.session.user.id &&
        game.opponentId !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not a part of this game",
        });
      }

      const { isValid, requiresPromotion } = validateMove(
        game.fen,
        input.from,
        input.to
      );

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid move",
        });
      }

      if (requiresPromotion && !input.promotion) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Promotion not specified",
        });
      }

      const colorToMove = getColorFromFen(game.fen);

      if (
        colorToMove === game.gameCreatorColor &&
        ctx.session.user.id !== game.gameCreatorId
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "It is not your turn to move",
        });
      }

      const newFen = makeMove(game.fen, input.from, input.to, input.promotion);

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
