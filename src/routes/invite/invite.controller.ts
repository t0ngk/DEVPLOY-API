import { createRoute, z } from "@hono/zod-openapi";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const getAllInviteRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get all invites",
  description: "Get all invites",
  tags: ["Invite"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  responses: {
    200: {
      description: "Return all invites",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

export const acceptInviteRoute = createRoute({
  method: "post",
  path: "/:slug",
  summary: "Accept Invite",
  description: "Accept Invite",
  tags: ["Invite"],
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
      description: "Invite Accepted",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Invite not found",
    },
  },
});

export const deniedInviteRoute = createRoute({
  method: "delete",
  path: "/:slug",
  summary: "Denied Invite",
  description: "Denied Invite",
  tags: ["Invite"],
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
      description: "Invite Denied",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Invite not found",
    },
  },
});
