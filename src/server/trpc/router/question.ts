import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { pusherServerClient } from "$server/common/pusher";
import { Question } from "@prisma/client";

export const questionRouter = router({
  add: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const question: Question = await ctx.prisma.question.create({
        data: {
          body: input.text,
        },
      });

      await pusherServerClient.trigger("questions", "new-question", {
        body: input.text,
      });

      return question;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.question.findMany();
  }),
});
