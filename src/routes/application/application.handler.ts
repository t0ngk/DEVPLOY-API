import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import {
  deleteApplicationRoute,
  deployApplicationRoute,
  editApplicationRoute,
  getApplicationFromIdRoute,
} from "./application.controller";
import prisma from "../../libs/prisma";
import { deployApplication } from "../../libs/deploy";

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
      status: true,
      logs: true,
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

export default app;
