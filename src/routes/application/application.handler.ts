import { OpenAPIHono } from "@hono/zod-openapi";
import { Context } from "../../libs/types/Context";
import { applicationCreateRoute } from "./application.controller";

const app = new OpenAPIHono<Context>();

app.openapi(applicationCreateRoute, async (c) => {
  console.log(await c.req.json())
  return c.json({});
})

export default app;
