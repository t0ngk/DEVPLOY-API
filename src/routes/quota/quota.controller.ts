import { createRoute } from "@hono/zod-openapi";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const getUsedApplicationsRoute = createRoute({
  method: "get",
  path: "/application",
  summary: "Get Used Applications",
  description: "Get all used applications",
  tags: ["Quota"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  responses: {
    200: {
      description: "Return Used Applications",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

export const getUsedDatabaseRoute = createRoute({
  method: "get",
  path: "/database",
  summary: "Get Used Database",
  description: "Get all used databases",
  tags: ["Quota"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  responses: {
    200: {
      description: "Return Used Database",
    },
    401: {
      description: "Unauthorized",
    },
  },
});
