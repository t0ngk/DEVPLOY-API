import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import {
  createWorkspaceRoute,
  deleteInvitationRoute,
  deleteWorkspaceRoute,
  getWorkspaceBySlugRoute,
  getWorkspacesRoute,
  renameWorkspaceRoute,
  sentInvaitationRoute,
} from "./workspace.controller";
import prisma from "../../libs/prisma";
import { Workspace } from "@prisma/client";

const app = new OpenAPIHono<Context>();

const getWorkspace = async (slug: string, userId: number) => {
  return await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.findFirst({
      where: {
        slug,
        Members: {
          some: {
            userId: userId,
          },
        },
      },
    });
    if (!workspace) {
      return null;
    }
    const permission = await tx.permission.findFirst({
      where: {
        workspaceId: workspace.id,
        userId,
        role: "OWNER",
      },
    });
    if (!permission) {
      return null;
    }
    return workspace;
  });
};

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
    include: {
      Members: {
        select: {
          User: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              picture: true,
              studentId: true,
              Permission: {
                select: {
                  role: true,
                },
                where: {
                  Workspace: {
                    slug: slug,
                  },
                },
              },
            },
          },
        },
      },
      Appication: true,
      Database: true,
      Invite: {
        select: {
          toUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              picture: true,
              studentId: true,
            },
          },
        },
      },
    },
  });
  if (!workspace) {
    return c.json({ message: "Workspace not found" }, 404);
  }
  return c.json({
    ...workspace,
    Members: workspace.Members.map((member) => {
      return {
        ...member.User,
        Permission: member.User?.Permission[0].role,
      }
    }),
    Invite: workspace.Invite.map((invite) => invite.toUser),
  });
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

app.openapi(renameWorkspaceRoute, async (c) => {
  const slug = c.req.param("slug");
  const { name } = await c.req.json<{ name: string }>();
  const newSlug = name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replace(/[^a-zA-Z0-9-_\.]/g, "");
  const workspace: Workspace | null = await getWorkspace(
    slug,
    c.get("user").id
  );
  if (!workspace) {
    return c.json({ message: "Permission denied or workspace not found" }, 404);
  }
  const existedWorkspace = await prisma.workspace.findFirst({
    where: {
      slug: newSlug,
    },
  });
  if (existedWorkspace) {
    return c.json({ message: "Workspace already taken" }, 406);
  }
  await prisma.workspace.update({
    where: {
      slug,
    },
    data: {
      name,
      slug: newSlug,
    },
  });
  return c.json({
    message: "Workspace renamed",
  });
});

app.openapi(deleteWorkspaceRoute, async (c) => {
  const slug = c.req.param("slug");
  const workspace: Workspace | null = await getWorkspace(
    slug,
    c.get("user").id
  );
  if (!workspace) {
    return c.json({ message: "Permission denied or workspace not found" }, 404);
  }
  await prisma.workspace.delete({
    where: {
      slug,
    },
  });
  return c.json({
    message: "Workspace deleted",
  });
});

app.openapi(sentInvaitationRoute, async (c) => {
  const slug = c.req.param("slug");
  const { email } = await c.req.json<{ email: string }>();
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if (!user) {
    return c.json({ message: "User not found" }, 406);
  }
  if (user.id === c.get("user").id) {
    return c.json({ message: "You can't invite yourself" }, 400);
  }
  const workspace = await getWorkspace(slug, c.get("user").id);
  if (!workspace) {
    return c.json({ message: "Permission denied or workspace not found" }, 404);
  }
  const isInvited = await prisma.invite.findFirst({
    where: {
      toUserId: user.id,
      workspaceId: workspace.id,
    },
  });
  if (isInvited) {
    return c.json({ message: "User already invited" }, 409);
  }
  await prisma.invite.create({
    data: {
      toUser: {
        connect: {
          id: user.id,
        },
      },
      Workspace: {
        connect: {
          id: workspace.id,
        },
      },
    },
  });
  return c.json({
    message: "Invitation sent",
  });
});

app.openapi(deleteInvitationRoute, async (c) => {
  const slug = c.req.param("slug");
  const { email } = await c.req.json<{ email: string }>();
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if (!user) {
    return c.json({ message: "User not found" }, 406);
  }
  const workspace = await getWorkspace(slug, c.get("user").id);
  if (!workspace) {
    return c.json({ message: "Permission denied or workspace not found" }, 404);
  }
  await prisma.invite.deleteMany({
    where: {
      toUserId: user.id,
      workspaceId: workspace.id,
    },
  });
  return c.json({
    message: "Invitation deleted",
  });
});

export default app;
