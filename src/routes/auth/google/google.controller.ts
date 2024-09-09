import { createRoute } from "@hono/zod-openapi";
import { refreshRequest, refreshResponse } from "./google.schema";

export const googleLoginRoute = createRoute({
  method: "get",
  path: "/login",
  summary: "Login with Google",
  description: "Redirect to Google for login",
  tags: ["Google", "Auth"],
  responses: {
    302: {
      description: "Redirect to Google",
    },
  },
});

export const googleCallbackRoute = createRoute({
  method: "get",
  path: "/callback",
  summary: "Google callback",
  description: "Callback from Google",
  tags: ["Google", "Auth"],
  responses: {
    302: {
      description: "Redirect to the client",
    },
  },
});

export const googleRefreshTokenRoute = createRoute({
  method: "get",
  path: "/refresh",
  summary: "Refresh Google token",
  description: "Refresh Google token",
  tags: ["Google", "Auth"],
  request: {
    headers: refreshRequest,
  },
  responses: {
    200: {
      description: "Refreshed token",
      content: {
        "application/json": {
          schema: refreshResponse,
        },
      },
    },
    401: {
      description: "Unauthorized",
    },
  },
});