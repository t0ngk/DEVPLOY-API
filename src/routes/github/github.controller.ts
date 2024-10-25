import { createRoute, z } from "@hono/zod-openapi";
import { githubGetRepoRequest, githubInstallAppRequest } from "./github.schema";
import { isUserLoggedInByCookie } from "../../libs/middlewares/isUserLoggedInByCookie";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const githubInstallAppRoute = createRoute({
  method: "get",
  path: "/app",
  summary: "Install GitHub App",
  description: "Install GitHub App to user's account",
  tags: ["GitHub"],
  middleware: [isUserLoggedInByCookie],
  request: {
    query: githubInstallAppRequest,
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
      GoogleOAuthJWT: []
    }
  ],
  request: {
    params: githubGetRepoRequest,
    query: z.object({
      repo: z.string().optional().openapi({
        param: {
          in: "query",
          name: "repo",
        },
      }),
    })
  },
  responses: {
    200: {
      description: "Return GitHub Repo",
    },
  },
});
