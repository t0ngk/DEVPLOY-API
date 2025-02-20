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
            name: z.string().min(1).optional(),
            gitHub: z.string().url().optional(),
            branch: z.string().optional(),
            buildPack: z.string().optional(),
            souceId: z.string().optional(),
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
    },
  },
});

export const setURLApplicationRoute = createRoute({
  method: "post",
  path: "/:id/url",
  summary: "Set URL Application",
  description: "Set URL Application by id",
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
            url: z.string().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Set URL Application Success",
    },
  },
});

export const disableApplicationRoute = createRoute({
  method: "post",
  path: "/:id/disable",
  summary: "Disable Application",
  description: "Disable Application by id",
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
      description: "Application disabled",
    },
  },
});
