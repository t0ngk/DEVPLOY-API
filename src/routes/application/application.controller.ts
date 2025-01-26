import { createRoute, z } from "@hono/zod-openapi";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const applicationCreateRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create Application",
  description: "Create Application",
  tags: ["Application"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string(),
            github: z.string().url(),
            branch: z.string(),
            buildPack: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Return Application",
    },
    401: {
      description: "Unauthorized",
    },
  },
});
