import { initTRPC, TRPCError } from "@trpc/server";
import Session from "supertokens-node/recipe/session";
import { z } from "zod";

import { IContext } from "./context";

export const t = initTRPC.context<IContext>().create();

// Middleware
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const session = await Session.getSession(ctx.req, ctx.res);
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: {
        userId: session.getUserId(),
      },
    },
  });
});

const authenticatedProcedure = t.procedure.use(isAuthenticated);

// Router

export const router = t.router({
  getHelloMessage: t.procedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(async ({ input }) => {
      return {
        message: `Hellom ${input.name}`,
      };
    }),
  getSession: authenticatedProcedure
    .output(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .query(async ({ ctx }) => {
      return {
        userId: ctx.session.userId,
      };
    }),
});

export type IRouter = typeof router;
