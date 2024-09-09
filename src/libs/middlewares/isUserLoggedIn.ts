import { createMiddleware } from "hono/factory";
import { Context } from "../types/Context";
import { getUser } from "../auth";

export const isUserLoggedIn = createMiddleware<Context>(async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  const user = await getUser(token);
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set("user", user);
  await next();
});
