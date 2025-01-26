import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import {
  getAllSourcesRoute,
  getRepoBranchesRoute,
  getSourceRepoRoute,
} from "./source.controller";
import prisma from "../../libs/prisma";
import { githubAppAPI, githubAuth, githubUserAPI } from "../../libs/githubAuth";
import { Octokit } from "octokit";
import { Source } from "./source.schema";
import { components } from "@octokit/openapi-types";

const app = new OpenAPIHono<Context>();

app.openapi(getAllSourcesRoute, async (c) => {
  const souces = await prisma.souce.findMany({
    where: {
      userId: c.get("user").id,
    },
  });
  const githubApp = await githubAppAPI();
  const sourceWithInfo: Source[] = [];

  for (let index = 0; index < souces.length; index++) {
    const souce = souces[index];
    try {
      const { data: sourceInfo } = await githubApp.rest.apps.getInstallation({
        installation_id: parseInt(souce.installID),
      });
      const souceAccount =
        sourceInfo.account as components["schemas"]["simple-user"];
      sourceWithInfo.push({
        installID: souce.installID,
        name: souceAccount.login,
        avatar: souceAccount.avatar_url,
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
  const { search } = c.req.query();
  const source = await prisma.souce.findFirst({
    where: {
      installID: installID,
      userId: c.get("user").id,
    },
  });
  if (!source) {
    return c.json({ message: "Source not found" }, 404);
  }
  const githubApp = await githubAppAPI();
  const userAPI = await githubUserAPI(parseInt(installID));
  const { data: targetRequest } = await githubApp.rest.apps.getInstallation({
    installation_id: parseInt(installID),
  });
  const targetAccount =
    targetRequest.account as components["schemas"]["simple-user"];
  const { data: rawRepos } = await userAPI.rest.search.repos({
    q: `${search ? search + " in:name" : ""} user:${targetAccount.login}`,
    per_page: 5,
    sort: "updated",
  });
  return c.json(
    rawRepos.items.map((repo) => {
      console.log(repo);
      return {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        language: repo.language,
        cloneUrl: repo.clone_url,
      };
    })
  );
});

app.openapi(getRepoBranchesRoute, async (c) => {
  const installID = c.req.param("installID");
  const repo = c.req.param("repo");
  const source = await prisma.souce.findFirst({
    where: {
      installID: installID,
      userId: c.get("user").id,
    },
  });
  if (!source) {
    return c.json({ message: "Source not found" }, 404);
  }
  const githubApp = await githubAppAPI();
  const userAPI = await githubUserAPI(parseInt(installID));
  const { data: targetRequest } = await githubApp.rest.apps.getInstallation({
    installation_id: parseInt(installID),
  });
  const targetAccount =
    targetRequest.account as components["schemas"]["simple-user"];
  const { data: rawBranchs } = await userAPI.rest.repos.listBranches({
    owner: targetAccount.login,
    repo: repo,
  });
  return c.json(
    rawBranchs.map((branch) => {
      return {
        name: branch.name,
      };
    })
  );
});

export default app;
