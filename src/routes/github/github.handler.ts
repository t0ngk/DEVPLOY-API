import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import { githubGetRepoRoute, githubInstallAppRoute } from "./github.controller";
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

app.openapi(githubGetRepoRoute, async (c) => {
  const { installation_id } = c.req.param();
  const { repo } = c.req.query();
  console.log(installation_id, repo);
  const user = c.get("user");
  const source = await prisma.souce.findFirst({
    where: {
      installID: installation_id,
    },
  });
  if (!source) {
    return c.json({ message: "Souce not found" }, 404);
  }
  if (source.userId != user.id) {
    return c.json(
      { message: "You not have permission to access this repos" },
      401
    );
  }
  const githubApp = await githutAuth({
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
  data.repositories = data.repositories.filter((repoItem) => {
    if (repoItem.name.includes(repo)) {
      return true;
    }
    return false;
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
