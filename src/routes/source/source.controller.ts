import { createRoute } from "@hono/zod-openapi";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const getAllSourcesRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get All Sources",
  description: "Get All Sources from current user",
  tags: ["Source"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  responses: {
    200: {
      description: "Return All Sources",
    },
    401: {
      description: "Unauthorized",
    },
  },
});
