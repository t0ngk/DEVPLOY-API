import { createRoute, z } from "@hono/zod-openapi";
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

export const getSourceRepoRoute = createRoute({
  method: "get",
  path: "/:installID/repos",
  summary: "Get Source Repos",
  description: "Get Source Repos from Installation ID",
  tags: ["Source"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      installID: z.string(),
    }),
    query: z.object({
      search: z.string().optional(),
    })
  },
  responses: {
    200: {
      description: "Return Source Repos",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Source not found",
    },
  },
});

export const getRepoBranchesRoute = createRoute({
  method: "get",
  path: "/:installID/:repo/branches",
  summary: "Get Repo Branchs",
  description: "Get Repo Branchs from Installation ID and Repo",
  tags: ["Source"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      installID: z.string(),
      repo: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Return Repo Branchs",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Source not found",
    },
  },
})
