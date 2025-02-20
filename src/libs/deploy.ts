import { Prisma } from "@prisma/client";
import { getGithubUserToken } from "./githubAuth";
import { spawnAsync } from "./spawnAsync";
import type { SpawnAsyncOutput } from "./spawnAsync";
import { writeFile } from "node:fs/promises";
import { CreateServiceOptions } from "dockerode";
import { docker } from "./docker";
import prisma from "./prisma";

export const createDynamicTraefikRule = (key: string, value: string) => {
  const obj: {
    [key: string]: string;
  } = {};
  obj[key] = value;
  return obj;
};

type ApplicationWithSource = Prisma.AppicationGetPayload<{
  include: {
    Souce: true;
  };
}>;

export const deployApplication = async (application: ApplicationWithSource) => {
  await prisma.appication.update({
    where: {
      id: application.id,
    },
    data: {
      status: "inProgress",
    },
  });
  console.log("Starting deployment for application", application.id);
  const gitHubInstallID = parseInt(application.Souce?.installID || "");
  if (isNaN(gitHubInstallID)) {
    throw new Error("Invalid GitHub Install ID");
  }
  const token = await getGithubUserToken(gitHubInstallID);
  const cloneUrl = application.gitHub.replace(
    "https://",
    `https://oauth2:${token}@`
  );
  const logs: string[] = [];
  const outputPath = `./app/${application.name}`;

  try {
    await spawnAsync("rm", ["-rf", outputPath]);
    const gitClone = await spawnAsync("git", [
      "clone",
      "--branch",
      application.branch,
      cloneUrl,
      outputPath,
      "--progress",
    ]);

    logs.push(...gitClone.output);
  } catch (error) {
    if ((error as SpawnAsyncOutput).output) {
      const errorOutput = error as SpawnAsyncOutput;
      logs.push(...errorOutput.output);
    }
    await prisma.appication.update({
      where: {
        id: application.id,
      },
      data: {
        status: "Failed",
        logs: logs,
      },
    });
    console.error("Application failed to clone", application.id, logs);
    return false;
  }

  const serviceName = `devploy-${application.id}`;

  let dockerFile = "";

  switch (application.buildPack) {
    case "static":
      dockerFile = `FROM nginx:latest
COPY . /usr/share/nginx/html
`;
      break;
    default:
      throw new Error("Invalid build pack");
  }

  await writeFile(`${outputPath}/Dockerfile`, dockerFile);

  try {
    const buildOutput = await spawnAsync("docker", [
      "build",
      "-t",
      serviceName,
      outputPath,
    ]);
    logs.push(...buildOutput.output);
  } catch (error) {
    if ((error as SpawnAsyncOutput).output) {
      const errorOutput = error as SpawnAsyncOutput;
      logs.push(...errorOutput.output);
    }
    await prisma.appication.update({
      where: {
        id: application.id,
      },
      data: {
        status: "Failed",
        logs: logs,
      },
    });
    console.error("Application failed to build", application.id, logs);
    return false;
  }

  const traefikURL = createDynamicTraefikRule(
    `traefik.http.routers.devploy-app${application.id}.rule`,
    `Host("${application.url}.localhost")`
  );
  const traefikPort = createDynamicTraefikRule(
    `traefik.http.services.devploy-app${application.id}.loadbalancer.server.port`,
    "80"
  );

  const serviceOptions: CreateServiceOptions = {
    Name: serviceName,
    TaskTemplate: {
      ContainerSpec: {
        Image: serviceName,
      },
      Networks: [
        {
          Target: "traefik-public",
          Aliases: [serviceName],
        },
      ],
    },
    Networks: [
      {
        Target: "traefik-public",
        Aliases: [serviceName],
      },
    ],
    Labels: {
      "traefik.enable": "true",
      ...traefikURL,
      ...traefikPort,
    },
  };

  const isExistService = await docker.listServices({
    filters: {
      name: [serviceName],
    },
  });

  if (isExistService.length > 0) {
    await spawnAsync("docker", ["service", "rm", serviceName]);
  }

  try {
    await docker.createService(serviceOptions);
    await prisma.appication.update({
      where: {
        id: application.id,
      },
      data: {
        status: "Deployed",
        logs: [...logs],
      },
    });
    console.log("Application deployed", application.id);
    await spawnAsync("rm", ["-rf", outputPath]);
    return true;
  } catch (error) {
    await prisma.appication.update({
      where: {
        id: application.id,
      },
      data: {
        status: "Failed",
        logs: [...logs],
      },
    });
    console.error("Application failed to deploy", application.id, error);
    await spawnAsync("rm", ["-rf", outputPath]);
    return false;
  }
};

export const disableApplication = async (appication: Prisma.AppicationGetPayload<{}>) => {
  console.log("Disabling application", appication.id);
  const serviceName = `devploy-${appication.id}`;
  const isExistService = await docker.listServices({
    filters: {
      name: [serviceName],
    },
  });
  if (isExistService.length > 0) {
    await spawnAsync("docker", ["service", "rm", serviceName]);
    return true;
  }
  return false;
};
