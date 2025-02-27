import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import { errorHook } from "../../libs/errorHook";
import prisma from "../../libs/prisma";
import {
  deleteDatabaseRoute,
  editDatabaseRoute,
  getDatabaseFromIdRoute,
  startDatabaseRoute,
} from "./database.controller";
import { startDatabase } from "../../libs/deploy";

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
  return c.json(database);
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
})

export default app;
