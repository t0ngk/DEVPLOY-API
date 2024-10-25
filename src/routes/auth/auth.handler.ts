import { OpenAPIHono } from "@hono/zod-openapi";
import googleHandler from "./google/google.handler";
import profileHandler from "./profile/profile.handler";

const app = new OpenAPIHono();

app.route("/google", googleHandler);
app.route("/profile", profileHandler);

export default app;
