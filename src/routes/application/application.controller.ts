import { createRoute, z } from "@hono/zod-openapi";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const getApplicationFromIdRoute = createRoute({
  method: "get",
  path: "/:id",
  summary: "Get Application",
  description: "Get Application by id",
  tags: ["Application"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Return Application",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Application not found or user is not in the application",
    },
  },
});

export const editApplicationRoute = createRoute({
  method: "put",
  path: "/:id",
  summary: "Edit Application",
  description: "Edit Application by id",
  tags: ["Application"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string(),
            github: z.string().url(),
            branch: z.string(),
            buildPack: z.string(),
            souceId: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Application edited",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Application not found or user is not in the application",
    },
  },
});

export const deleteApplicationRoute = createRoute({
  method: "delete",
  path: "/:id",
  summary: "Delete Application",
  description: "Delete Application by id",
  tags: ["Application"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Application deleted",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Application not found or user is not in the application",
    },
  },
});

export const deployApplicationRoute = createRoute({
  method: "post",
  path: "/:id/deploy",
  summary: "Deploy Application",
  description: "Deploy Application by id",
  tags: ["Application"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Application deployed",
    }
  }
})
