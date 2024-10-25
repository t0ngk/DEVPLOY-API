import { createMiddleware } from "hono/factory";
import { Context } from "../types/Context";
import { getUser } from "../auth";
import { getCookie } from "hono/cookie";

export const isUserLoggedInByCookie = createMiddleware<Context>(
  async (c, next) => {
    const token = getCookie(c, "accessToken");
    const user = await getUser(token);
    if (!user) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    c.set("user", user);
    await next();
  }
);
