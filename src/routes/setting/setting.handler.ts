import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import { errorHook } from "../../libs/errorHook";
import { editSettingRoute, getSettingRoute } from "./setting.controller";
import prisma from "../../libs/prisma";
import { Prisma } from "@prisma/client";

const app = new OpenAPIHono<Context>({
  defaultHook: errorHook,
});

app.openapi(getSettingRoute, async (c) => {
  const user = c.get("user");
  const userQuery: Prisma.SettingFindFirstArgs = {
    select: {
      baseUrl: true,
    },
  };
  const ownerQuery: Prisma.SettingFindFirstArgs = {
    select: {
      baseUrl: true,
      reservePort: true,
      reservePortEnd: true,
      defaultApplictionQuota: true,
      defaultDatabaseQuota: true,
    },
  };
  const settings = await prisma.setting.findFirst({
    select: user.role === "OWNER" || user.role === 'ADMIN' ? ownerQuery.select : userQuery.select,
  });
  return c.json(settings);
});

app.openapi(editSettingRoute, async (c) => {
  const user = c.get("user");
  const setting = await c.req.json();
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const currentSetting = await prisma.setting.findFirst();
  if (!currentSetting) {
    return c.json({ message: "Setting not found" }, 404);
  }
  if (
    setting.reservePortEnd &&
    setting.reservePortEnd < currentSetting.reservePort
  ) {
    return c.json(
      { message: "reservePortEnd must be greater than reservePort" },
      400
    );
  }
  if (
    setting.reservePort &&
    setting.reservePort > currentSetting.reservePortEnd
  ) {
    return c.json(
      { message: "reservePort must be greater than current reservePort" },
      400
    );
  }
  if (setting.defaultApplictionQuota && setting.defaultApplictionQuota < 0) {
    return c.json(
      { message: "defaultApplictionQuota must be greater than 0" },
      400
    );
  }
  if (setting.defaultDatabaseQuota && setting.defaultDatabaseQuota < 0) {
    return c.json(
      { message: "defaultDatabaseQuota must be greater than 0" },
      400
    );
  }
  const updatedSetting = await prisma.setting.update({
    where: {
      id: 1,
    },
    data: setting,
  });
  return c.json(updatedSetting);
});

export default app;
