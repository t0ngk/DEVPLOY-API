import { OpenAPIHono } from "@hono/zod-openapi";
import { profileRoute } from "./profile.controller";
import { Context } from "../../../libs/types/Context";

const app = new OpenAPIHono<Context>();

app.openapi(profileRoute, async (c) => {
  // const token = c.req.header("Authorization")?.split(" ")[1];
  // if (!token) {
  //   return c.json({ message: "Unauthorized" }, 401);
  // }
  // const googleProfile = await getGoogleProfile(token);
  // if (!googleProfile) {
  //   return c.json({ message: "Unauthorized" }, 401);
  // }
  // const user = await prisma.user.findUnique({
  //   where: {
  //     email: googleProfile.email,
  //   },
  // });
  const user = c.get('user');
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  return c.json(user);
});

export default app;
