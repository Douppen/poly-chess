import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { pusherServerClient } from "$server/common/pusher";
import { Question } from "@prisma/client";

export const questionRouter = router({
  add: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const sentAt = new Date().valueOf();

      const timestampBeforeDb = new Date().valueOf();
      const question: Question = await ctx.prisma.question.create({
        data: {
          body: input.text,
        },
      });
      const timestampAfterDb = new Date().valueOf();
      console.log("dbLatency: ", timestampAfterDb - timestampBeforeDb);

      const timestampBeforePusher = new Date().valueOf();
      await pusherServerClient.trigger("questions", "new-question", {
        sentAt,
        body: input.text,
      });
      const timestampAfterPusher = new Date().valueOf();
      console.log(
        "pusherSendLatency: ",
        timestampAfterPusher - timestampBeforePusher
      );

      return question;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.question.findMany();
  }),
});
