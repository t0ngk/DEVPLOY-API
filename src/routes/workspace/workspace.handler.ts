import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import {
  createWorkspaceRoute,
  getWorkspaceBySlugRoute,
  getWorkspacesRoute,
} from "./workspace.controller";
import prisma from "../../libs/prisma";

const app = new OpenAPIHono<Context>();

app.openapi(getWorkspacesRoute, async (c) => {
  const workspaces = await prisma.workspace.findMany({
    where: {
      Members: {
        some: {
          userId: c.get("user").id,
        },
      },
    },
    select: {
      name: true,
      slug: true,
    },
  });
  return c.json(workspaces);
});

app.openapi(getWorkspaceBySlugRoute, async (c) => {
  const slug = c.req.param("slug");
  const workspace = await prisma.workspace.findFirst({
    where: {
      slug,
      Members: {
        some: {
          userId: c.get("user").id,
        },
      },
    },
  });
  if (!workspace) {
    return c.json({ message: "Workspace not found" }, 404);
  }
  return c.json(workspace);
});

app.openapi(createWorkspaceRoute, async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  const workspace = await prisma.workspace.findFirst({
    where: {
      name,
    },
  });
  if (workspace) {
    return c.json(
      {
        message: "Workspace already taken",
      },
      406
    );
  }
  await prisma.userOfWorkspace.create({
    data: {
      User: {
        connect: {
          id: c.get("user").id,
        },
      },
      Workspace: {
        create: {
          name,
          slug: name
            .toLowerCase()
            .replaceAll(" ", "-")
            .replace(/[^a-zA-Z0-9-_\.]/g, ""),
          permission: {
            create: {
              role: "OWNER",
              User: {
                connect: {
                  id: c.get("user").id,
                },
              },
            },
          },
        },
      },
    },
  });
  return c.json({
    message: "Workspace created",
  });
});

export default app;
