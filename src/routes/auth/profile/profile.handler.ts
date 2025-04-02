import { OpenAPIHono } from "@hono/zod-openapi";
import { profileRoute } from "./profile.controller";
import { Context } from "../../../libs/types/Context";
import { errorHook } from "../../../libs/errorHook";
import { setCookie } from "hono/cookie";

const app = new OpenAPIHono<Context>({
  defaultHook: errorHook
});

app.openapi(profileRoute, async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  setCookie(c, "accessToken", token || '', { secure: true });
  const user = c.get('user');
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  return c.json(user);
});

export default app;
