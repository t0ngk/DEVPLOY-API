import { createRoute, z } from "@hono/zod-openapi";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const getWorkspacesRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get All Workspace",
  description: "Get All Workspace from current user",
  tags: ["Workspace"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  responses: {
    200: {
      description: "Return All Workspace",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

export const getWorkspaceBySlugRoute = createRoute({
  method: "get",
  path: "/:slug",
  summary: "Get Workspace",
  description: "Get Workspace by slug",
  tags: ["Workspace"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      slug: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Return Workspace",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Workspace not found or user is not in the workspace",
    },
  },
});

export const createWorkspaceRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create Workspace",
  description: "Create Workspace",
  tags: ["Workspace"],
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
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Workspace created",
    },
    401: {
      description: "Unauthorized",
    },
    406: {
      description: "Workspace already taken",
    },
  },
});
