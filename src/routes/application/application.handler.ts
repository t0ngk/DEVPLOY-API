import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import {
  deleteApplicationRoute,
  deployApplicationRoute,
  disableApplicationRoute,
  editApplicationRoute,
  getApplicationFromIdRoute,
  setURLApplicationRoute,
} from "./application.controller";
import prisma from "../../libs/prisma";
import { deployApplication, disableApplication } from "../../libs/deploy";
import { docker } from "../../libs/docker";
import { spawnAsync } from "../../libs/spawnAsync";
import { errorHook } from "../../libs/errorHook";

const app = new OpenAPIHono<Context>({
  defaultHook: errorHook,
});

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
      status: true,
      logs: true,
      url: true,
      Souce: {
        select: {
          installID: true,
        },
      },
    },
  });

  const isApplicationRunningInDocker = await docker.listServices({
    filters: {
      name: [`devploy-${id}`],
    },
    status: true,
  });

  if (
    isApplicationRunningInDocker.length > 0 &&
    (isApplicationRunningInDocker[0].ServiceStatus?.RunningTasks ?? 0) > 0 &&
    application?.status !== "inProgress" &&
    application?.status !== "Failed"
  ) {
    await prisma.appication.update({
      where: {
        id,
      },
      data: {
        status: "notStarted",
      },
    });
  }

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
  let body = await c.req.json();
  if (body.souceId) {
    const souce = await prisma.souce.findFirst({
      where: {
        userId: user.id,
        installID: body.sourceId,
      },
    });
    if (!souce) {
      return c.json({ message: "Source not found" }, 404);
    }
    body = {
      ...body,
      souceId: souce.id,
    };
  }
  await prisma.appication.update({
    where: {
      id,
    },
    data: {
      ...body,
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

app.openapi(deployApplicationRoute, async (c) => {
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id format" }, 400);
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
    include: {
      Souce: true,
    },
  });
  if (!application) {
    return c.json({ message: "Application not found" }, 404);
  }

  try {
    deployApplication(application);
  } catch (error) {
    console.error(error);
    return c.json(
      { message: "Failed to deploy application try to read logs" },
      500
    );
  }

  return c.json({ message: "Application started deploying" });
});

app.openapi(disableApplicationRoute, async (c) => {
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id format" }, 400);
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
    return c.json({ message: "Application not found" }, 404);
  }
  if (await disableApplication(application.id)) {
    return c.json({ message: "Application disabled" });
  }
  return c.json({ message: "Failed to disable application" }, 500);
});

app.openapi(setURLApplicationRoute, async (c) => {
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  const setting = await prisma.setting.findFirst();
  if (!setting) {
    return c.json({ message: "Setting not found" }, 404);
  }
  if (isNaN(id)) {
    return c.json({ message: "Invalid id format" }, 400);
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
    return c.json({ message: "Application not found" }, 404);
  }
  let body = await c.req.json();
  if (body.url == "traefik") {
    return c.json({ message: "this url has been restict" }, 400);
  }
  const urlExists = await prisma.appication.findFirst({
    where: {
      url: body.url,
    },
  });
  if (urlExists) {
    return c.json({ message: "URL already exists" }, 400);
  }
  await prisma.appication.update({
    where: {
      id,
    },
    data: {
      url: body.url,
    },
  });
  const findService = await docker.listServices({
    filters: {
      name: [`devploy-${id}`],
    },
  });
  if (findService.length > 0) {
    spawnAsync("docker", [
      "service",
      "update",
      "--label-add",
      `traefik.http.routers.devploy-app${id}.rule=Host("${body.url}.${setting.baseUrl}")`,
      `devploy-${id}`,
    ]);
  }
  return c.json({ message: "URL set" });
});

export default app;
