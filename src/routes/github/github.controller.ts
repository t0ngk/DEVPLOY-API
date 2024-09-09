import { createRoute } from "@hono/zod-openapi";
import { githubInstallAppRequest } from "./github.schema";
import { isUserLoggedInByCookie } from "../../libs/middlewares/isUserLoggedInByCookie";

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
