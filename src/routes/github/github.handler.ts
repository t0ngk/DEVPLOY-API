import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import { githubInstallAppRoute } from "./github.controller";
import prisma from "../../libs/prisma";
import { githutAuth } from "../../libs/githubAuth";
import { Octokit } from "octokit";

const app = new OpenAPIHono<Context>();

// https://github.com/apps/devploy-dev/installations/new/
app.openapi(githubInstallAppRoute, async (c) => {
  const { installation_id, setup_action } = c.req.query();
  console.log(installation_id, setup_action);
  const user = c.get("user");
  if (setup_action == "install") {
    const newSouce = await prisma.souce.create({
      data: {
        User: {
          connect: {
            id: user.id,
          },
        },
        installID: installation_id,
      },
    });
  }
  return c.redirect("http://localhost:5173");
});

export default app;
