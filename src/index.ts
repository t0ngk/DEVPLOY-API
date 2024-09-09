import "dotenv/config";
import { serve } from "@hono/node-server";
import { showRoutes } from "hono/dev";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import authRoute from "./routes/auth/auth.handler";
import githubRoute from "./routes/github/github.handler";

const app = new OpenAPIHono();

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "DevPloy API",
    version: "1.0.0",
  },
});

app.get(
  "/doc",
  apiReference({
    spec: {
      url: "/openapi.json",
    },
  })
);

app.use(logger());
app.use(cors());

app.route("/auth", authRoute);
app.route("/github", githubRoute);

const port = 3000;

console.log(`Server is running on port ${port}\n`);
showRoutes(app);

serve({
  fetch: app.fetch,
  port,
});
