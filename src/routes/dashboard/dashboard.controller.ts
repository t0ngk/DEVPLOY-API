import { createRoute, z } from "@hono/zod-openapi";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const getAllUserRoute = createRoute({
  method: "get",
  path: "/user",
  summary: "Get All Users",
  description: "Get all users",
  tags: ["Dashboard"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    query: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
    }),
  },
  responses: {
    200: {
      description: "Return all users",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

export const getUserByIdRoute = createRoute({
  method: "get",
  path: "/user/:id",
  summary: "Get User",
  description: "Get user by id",
  tags: ["Dashboard"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Return user",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "User not found",
    },
  },
});

export const editUserRoute = createRoute({
  method: "put",
  path: "/user/:id",
  summary: "Edit User",
  description: "Edit user by id",
  tags: ["Dashboard"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            role: z.enum(["OWNER", "ADMIN", "USER"]).optional(),
            applicationQuota: z.number().optional(),
            databaseQuota: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Return user",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "User not found",
    },
  },
});
