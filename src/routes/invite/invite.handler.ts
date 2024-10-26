import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import {
  acceptInviteRoute,
  deniedInviteRoute,
  getAllInviteRoute,
} from "./invite.controller";
import prisma from "../../libs/prisma";

const app = new OpenAPIHono<Context>();

app.openapi(getAllInviteRoute, async (c) => {
  const invites = await prisma.invite.findMany({
    where: {
      toUser: {
        email: c.get("user").email,
      },
    },
    select: {
      id: true,
      toUserId: false,
      workspaceId: false,
      toUser: false,
      Workspace: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });
  return c.json(invites);
});

app.openapi(acceptInviteRoute, async (c) => {
  const slug = c.req.param("slug");
  const invite = await prisma.invite.findFirst({
    where: {
      Workspace: {
        slug,
      },
      toUserId: c.get("user").id,
    },
  });
  if (!invite || !invite.toUserId) {
    return c.json({ message: "Invite not found" }, 404);
  }
  await prisma.$transaction([
    prisma.userOfWorkspace.create({
      data: {
        userId: invite.toUserId,
        workspaceId: invite.workspaceId,
      },
    }),
    prisma.permission.create({
      data: {
        userId: invite.toUserId,
        workspaceId: invite.workspaceId,
        role: "MEMBER",
      }
    }),
    prisma.invite.delete({
      where: {
        id: invite.id,
      },
    }),
  ]);
  return c.json({ message: "Invite Accepted" });
});

app.openapi(deniedInviteRoute, async (c) => {
  const slug = c.req.param("slug");
  const invite = await prisma.invite.findFirst({
    where: {
      Workspace: {
        slug,
      },
      toUserId: c.get("user").id,
    },
  });
  if (!invite || !invite.toUserId) {
    return c.json({ message: "Invite not found" }, 404);
  }
  await prisma.invite.delete({
    where: {
      id: invite.id,
    },
  });
  return c.json({ message: "Invite Denied" });
});

export default app;
