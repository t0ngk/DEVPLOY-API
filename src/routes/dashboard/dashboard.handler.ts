import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import { errorHook } from "../../libs/errorHook";
import prisma from "../../libs/prisma";
import {
  editUserRoute,
  getAllUserRoute,
  getUserByIdRoute,
} from "./dashboard.controller";

const app = new OpenAPIHono<Context>({
  defaultHook: errorHook,
});

app.openapi(getAllUserRoute, async (c) => {
  const user = c.get("user");
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const users = await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
  return c.json(users);
});

app.openapi(getUserByIdRoute, async (c) => {
  const user = c.get("user");
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const userFound = await prisma.user.findFirst({
    where: {
      id,
    },
  });
  if (!userFound) {
    return c.json({ message: "User not found" }, 404);
  }
  return c.json(userFound);
});

app.openapi(editUserRoute, async (c) => {
  const user = c.get("user");
  if (user.role !== "OWNER" && user.role !== "ADMIN") {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ message: "Invalid id" }, 400);
  }
  const userFound = await prisma.user.findFirst({
    where: {
      id,
    },
  });
  if (!userFound) {
    return c.json({ message: "User not found" }, 404);
  }
  const data = await c.req.json();
  if (data.role && user.role !== "OWNER") {
    delete data.role;
  }
  await prisma.user.update({
    where: {
      id,
    },
    data,
  });
  return c.json({ message: "User updated" });
});

export default app;
