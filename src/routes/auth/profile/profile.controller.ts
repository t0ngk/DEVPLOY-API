import { createRoute } from "@hono/zod-openapi";
import { profileRequest, profileResponse } from "./profile.schema";
import { isUserLoggedIn } from "../../../libs/middlewares/isUserLoggedIn";

export const profileRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get profile",
  description: "Get the user's profile",
  tags: ["Profile", "Auth"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: []
    }
  ],
  request: {
    headers: profileRequest
  },
  responses: {
    200: {
      description: "User's profile",
      content: {
        'application/json' : {
          schema: profileResponse
        }
      }
    },
    403: {
      description: "Unauthorized",
    }
  },
});
