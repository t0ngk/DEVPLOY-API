import { createRoute, z } from "@hono/zod-openapi";
import { githubGetRepoRequest, githubInstallAppRequest } from "./github.schema";
import { isUserLoggedInByCookie } from "../../libs/middlewares/isUserLoggedInByCookie";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const githubInstallCallbackRoute = createRoute({
  method: "post",
  path: "/app",
  summary: "GitHub App Callback",
  description: "Install GitHub App to user's account",
  tags: ["GitHub"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    // query: githubInstallAppRequest,
    body: {
      content: {
        "application/json": {
          schema: z.object({
            installation_id: z.string(),
            setup_action: z.string(),
            code: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    302: {
      description: "Redirect to DevPloy",
    },
  },
});

export const githubGetRepoRoute = createRoute({
  method: "get",
  path: "/repos/:installation_id",
  summary: "Get GitHub Repo",
  description: "Get GitHub Repo from user's account",
  tags: ["GitHub"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: githubGetRepoRequest,
    query: z.object({
      repo: z
        .string()
        .optional()
        .openapi({
          param: {
            in: "query",
            name: "repo",
          },
        }),
    }),
  },
  responses: {
    200: {
      description: "Return GitHub Repo",
    },
  },
});

export const githubInstallAppRoute = createRoute({
  method: "get",
  path: "/install",
  summary: "Install GitHub App",
  description: "Install GitHub App to user's account",
  tags: ["GitHub"],
  responses: {
    302: {
      description: "Redirect to GitHub App",
    },
  },
});
