import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import { getAllSourcesRoute } from "./source.controller";
import prisma from "../../libs/prisma";
import { githubAuth } from "../../libs/githubAuth";
import { Octokit } from "octokit";
import { Source } from "./source.schema";

const app = new OpenAPIHono<Context>();

app.openapi(getAllSourcesRoute, async (c) => {
  const souces = await prisma.souce.findMany({
    where: {
      userId: c.get("user").id,
    },
  });
  const githubApp = await githubAuth({
    type: "app",
  });
  const octokit = new Octokit({
    auth: githubApp.token,
  });

  const sourceWithInfo: Source[] = [];

  for (let index = 0; index < souces.length; index++) {
    const souce = souces[index];
    const { data: sourceInfo } = await octokit.rest.apps.getInstallation({
      installation_id: parseInt(souce.installID),
    });
    sourceWithInfo.push({
      installID: souce.installID,
      name:
        "login" in sourceInfo.account! ? sourceInfo.account.login : "Unknown",
      avatar:
        "avatar_url" in sourceInfo.account!
          ? sourceInfo.account.avatar_url
          : "",
    });
  }
  console.log(sourceWithInfo);
  return c.json(sourceWithInfo);
});

export default app;
