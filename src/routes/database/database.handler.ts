import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import { errorHook } from "../../libs/errorHook";
import prisma from "../../libs/prisma";
import {
  deleteDatabaseRoute,
  editDatabaseRoute,
  getDatabaseFromIdRoute,
  startDatabaseRoute,
  stopDatabaseRoute,
} from "./database.controller";
import { startDatabase, stopDatabase } from "../../libs/deploy";
import { docker } from "../../libs/docker";

const app = new OpenAPIHono<Context>({
  defaultHook: errorHook,
});

app.openapi(getDatabaseFromIdRoute, async (c) => {
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }

  const database = await prisma.database.findFirst({
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
  if (!database) {
    return c.json({ message: "Database not found" }, 404);
  }
  const dockerService = await docker.listServices({
    filters: {
      name: [`devploy-db-${database.id}`],
    },
    status: true,
  });
  return c.json({
    ...database,
    status:
      dockerService.length > 0 &&
      (dockerService[0].ServiceStatus?.RunningTasks ?? 0) > 0
        ? "Deployed"
        : "Stopped",
  });
});

app.openapi(editDatabaseRoute, async (c) => {
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const database = await prisma.database.findFirst({
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
  if (!database) {
    return c.json({ message: "Database not found" }, 404);
  }
  const body = await c.req.json();
  const updatedDatabase = await prisma.database.update({
    where: {
      id,
    },
    data: {
      ...body,
    },
  });
  return c.json(updatedDatabase);
});

app.openapi(deleteDatabaseRoute, async (c) => {
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const database = await prisma.database.findFirst({
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
  if (!database) {
    return c.json({ message: "Database not found" }, 404);
  }
  stopDatabase(database);
  await prisma.database.delete({
    where: {
      id,
    },
  });
  return c.json({ message: "Database deleted" });
});

app.openapi(startDatabaseRoute, async (c) => {
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const database = await prisma.database.findFirst({
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
  if (!database) {
    return c.json({ message: "Database not found" }, 404);
  }
  startDatabase(database);
  return c.json({ message: "Database deployment started" });
});

app.openapi(stopDatabaseRoute, async (c) => {
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const database = await prisma.database.findFirst({
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
  if (!database) {
    return c.json({ message: "Database not found" }, 404);
  }
  stopDatabase(database);
  return c.json({ message: "Database deployment stopped" });
});

export default app;
