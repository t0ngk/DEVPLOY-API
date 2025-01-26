import "dotenv/config";
import { serve } from "@hono/node-server";
import { showRoutes } from "hono/dev";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import authRoute from "./routes/auth/auth.handler";
import githubRoute from "./routes/github/github.handler";
import workspaceRoute from "./routes/workspace/workspace.handler";
import inviteRoute from "./routes/invite/invite.handler";
import source from "./routes/source/source.handler";
import application from "./routes/application/application.handler";

const app = new OpenAPIHono();

app.openAPIRegistry.registerComponent("securitySchemes", "GoogleOAuthJWT", {
  type: "http",
  scheme: "bearer",
  in: "header",
  description: "Bearer JWT token",
});

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
app.route("/workspace", workspaceRoute);
app.route("/invite", inviteRoute);
app.route("/source", source);
app.route("/application", application);

const port = 3000;

console.log(`Server is running on port ${port}\n`);
showRoutes(app);

serve({
  fetch: app.fetch,
  port,
});
