import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import { errorHook } from "../../libs/errorHook";
import {
  getUsedApplicationsRoute,
  getUsedDatabaseRoute,
} from "./quota.controller";
import prisma from "../../libs/prisma";

const app = new OpenAPIHono<Context>({
  defaultHook: errorHook,
});

app.openapi(getUsedApplicationsRoute, async (c) => {
  const user = c.get("user");
  const applications = await prisma.appication.count({
    where: {
      userId: user.id,
    },
  });
  return c.json({
    used: applications,
  });
});

app.openapi(getUsedDatabaseRoute, async (c) => {
  const user = c.get("user");
  const databases = await prisma.database.count({
    where: {
      userId: user.id,
    },
  });
  return c.json({
    used: databases,
  });
});

export default app;
