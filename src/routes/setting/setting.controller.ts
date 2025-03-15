import { createRoute, z } from "@hono/zod-openapi";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const getSettingRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all settings",
  description: "Get all settings",
  tags: ["Setting"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  responses: {
    200: {
      description: "Return all settings",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

export const editSettingRoute = createRoute({
  method: "put",
  path: "/",
  summary: "Edit setting",
  description: "Edit setting",
  tags: ["Setting"],
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
            baseUrl: z.string().optional(),
            reservePort: z.number().optional(),
            reservePortEnd: z.number().optional(),
            defaultApplictionQuota: z.number().optional(),
            defaultDatabaseQuota: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Return setting",
    },
    401: {
      description: "Unauthorized",
    },
  },
});
