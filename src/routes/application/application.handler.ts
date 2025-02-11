import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import {
  deleteApplicationRoute,
  deployApplication,
  editApplicationRoute,
  getApplicationFromIdRoute,
} from "./application.controller";
import prisma from "../../libs/prisma";
import { docker } from "../../libs/docker";
import { getGithubUserToken } from "../../libs/githubAuth";
import util from 'node:util';
import { exec, spawn } from "node:child_process";
import { spawnAsync } from "../../libs/spawnAsync";
import type { CreateServiceOptions } from "dockerode";
import { writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const app = new OpenAPIHono<Context>();

app.openapi(getApplicationFromIdRoute, async (c) => {
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const application = await prisma.appication.findFirst({
    where: {
      id,
      Workspace: {
        Members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      gitHub: true,
      branch: true,
      buildPack: true,
      config: true,
      Souce: {
        select: {
          installID: true,
        },
      },
    },
  });
  if (!application) {
    return c.json(
      { message: "Application not found or user is not in the application" },
      404
    );
  }
  return c.json(application);
});

app.openapi(editApplicationRoute, async (c) => {
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const application = await prisma.appication.findFirst({
    where: {
      id,
      Workspace: {
        Members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
  });
  if (!application) {
    return c.json(
      { message: "Application not found or user is not in the application" },
      404
    );
  }
  const body = await c.req.json();
  const souce = await prisma.souce.findFirst({
    where: {
      userId: user.id,
      installID: body.sourceId,
    },
  });
  await prisma.appication.update({
    where: {
      id,
    },
    data: {
      name: body.name,
      gitHub: body.github,
      branch: body.branch,
      buildPack: body.buildPack,
      config: {},
      souceId: souce?.id,
    },
  });
  return c.json({ message: "Application updated" });
});

app.openapi(deleteApplicationRoute, async (c) => {
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const application = await prisma.appication.findFirst({
    where: {
      id,
      Workspace: {
        Members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
  });
  if (!application) {
    return c.json(
      { message: "Application not found or user is not in the application" },
      404
    );
  }
  await prisma.appication.delete({
    where: {
      id,
    },
  });
  return c.json({ message: "Application deleted" });
});

app.openapi(deployApplication, async (c) => {
  const id = 5;
  const application = await prisma.appication.findFirst({
    where: {
      id,
    },
    include: {
      Souce: true
    }
  });
  if (!application) {
    return c.json({ message: "Application not found" }, 404);
  }
  const githubInstallID = parseInt(application.Souce?.installID || "");
  const token = await getGithubUserToken(githubInstallID);
  const repo = application.gitHub;
  const branch = application.branch;
  const outputPath = `./app/${application.name}`;
  const cloneUrl = repo.replace("https://", `https://oauth2:${token}@`);
  const command = `clone --branch ${branch} ${cloneUrl} ${outputPath} --progress`;

  await spawnAsync("rm", ["-rf", outputPath]);
  const output = await spawnAsync("git", command.split(" "));
  const serviceName = `devploy-${application.id}`;

  const dockerFile = `FROM nginx:latest
COPY . /usr/share/nginx/html`;

  await writeFile(`${outputPath}/Dockerfile`, dockerFile);
  await spawnAsync("docker", ["build", "-t", serviceName, outputPath]);
  const serviceSetting: CreateServiceOptions = {
    Name: serviceName,
    TaskTemplate: {
      ContainerSpec: {
        Image: serviceName,
      },
      Networks: [{
        Target: "traefik-public",
        Aliases: [serviceName]
      }]
    },
    Networks: [{
      Target: "traefik-public",
      Aliases: [serviceName]
    }],
    Labels: {
      "traefik.enable": "true",
      "traefik.http.routers.devploy-app5.rule": "Host(`webtest.localhost`)",
      "traefik.http.services.devploy-app5.loadbalancer.server.port": "80",
    }
  }
  const isExistService = await docker.listServices({
    filters: {
      name: [serviceName]
    }
  });
  if (isExistService.length > 0) {
    await spawnAsync("docker", ["service", "rm", serviceName]);
  }
  try {
    await docker.createService(serviceSetting);
    return c.json({ message: "Application deployed", output: output });
  } catch (error) {
    return c.json({ message: "Application failed to deploy", output: output }, 500);
  }
});

export default app;
