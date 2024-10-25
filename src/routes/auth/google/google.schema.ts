import { z } from "@hono/zod-openapi";

export const refreshRequest = z.object({
  authorization: z.string().openapi({
    param: {
      in: "header",
      name: "authorization",
    },
  }),
});

export const refreshResponse = z.object({
  accessToken: z.string(),
  expiresAt: z.string().datetime()
})
