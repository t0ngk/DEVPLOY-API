import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import { getAllSourcesRoute, getSourceRepoRoute } from "./source.controller";
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
    try {
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
    } catch (error) {
      if ((error as any).status === 404) {
        await prisma.souce.delete({
          where: {
            installID: souce.installID,
          },
        });
      }
    }
  }
  console.log(sourceWithInfo);
  return c.json(sourceWithInfo);
});

app.openapi(getSourceRepoRoute, async (c) => {
  const installID = c.req.param("installID");
  const source = await prisma.souce.findFirst({
    where: {
      installID: installID,
      userId: c.get("user").id,
    },
  });
  if (!source) {
    return c.json({ message: "Source not found" }, 404);
  }
  const githubApp = await githubAuth({
    type: "installation",
    installationId: source.installID,
  });
  const octokit = new Octokit({
    auth: githubApp.token,
  });
  const MAX_REPOS = 100;
  const { data } = await octokit.request("GET /installation/repositories", {
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
    per_page: MAX_REPOS,
  });
  const remainFetch = (data.total_count - data.repositories.length) / MAX_REPOS;
  for (let i = 0; i < remainFetch; i++) {
    console.log("fetching", i + 2);
    const { data: data2 } = await octokit.request(
      "GET /installation/repositories",
      {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
        per_page: MAX_REPOS,
        page: i + 2,
      }
    );
    data.repositories = data.repositories.concat(data2.repositories);
  }
  data.repositories = data.repositories.sort((a, b) => {
    return Date.parse(b.updated_at!) - Date.parse(a.updated_at!);
  });
  
  const repos = data.repositories.map((repo) => {
    return {
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      language: repo.language,
    };
  });

  return c.json(repos);
});

export default app;
