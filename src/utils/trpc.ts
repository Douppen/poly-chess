import superjson from "superjson";
import {
  createWSClient,
  httpBatchLink,
  loggerLink,
  wsLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { GetInferenceHelpers } from "@trpc/server";
import type { AppRouter } from "../server/trpc/router/_app";
import { NextPageContext } from "next";
import { env } from "env/client.mjs";

const getEndingLink = (ctx: NextPageContext | undefined) => {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url: `${env.NEXT_PUBLIC_APP_URL}/api/trpc`,
      headers() {
        if (ctx?.req) {
          // on ssr, forward client's headers to the server
          return {
            ...ctx.req.headers,
            "x-ssr": "1",
          };
        }
        return {};
      },
    });
  }
  const client = createWSClient({
    url: env.NEXT_PUBLIC_WS_URL,
  });
  return wsLink<AppRouter>({
    client,
  });
};

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      transformer: superjson,
      queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        getEndingLink(ctx),
      ],
    };
  },
  ssr: true,
});

/**
 * Inference helpers
 * @example type HelloOutput = AppRouterTypes['example']['hello']['output']
 **/
export type AppRouterTypes = GetInferenceHelpers<AppRouter>;
