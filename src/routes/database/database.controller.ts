import { createRoute, z } from "@hono/zod-openapi";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const getDatabaseFromIdRoute = createRoute({
  method: "get",
  path: "/:id",
  summary: "Get Database",
  description: "Get Database by id",
  tags: ["Database"],
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
      description: "Return Database",
    },
    404: {
      description: "Database not found",
    },
  },
});

export const editDatabaseRoute = createRoute({
  method: "put",
  path: "/:id",
  summary: "Edit Database",
  description: "Edit Database by id",
  tags: ["Database"],
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
            username: z.string().optional(),
            password: z.string().optional(),
            databaseName: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Return Database",
    },
    404: {
      description: "Database not found",
    },
  },
});

export const deleteDatabaseRoute = createRoute({
  method: "delete",
  path: "/:id",
  summary: "Delete Database",
  description: "Delete Database by id",
  tags: ["Database"],
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
      description: "Database deleted",
    },
    404: {
      description: "Database not found",
    },
  },
});

export const startDatabaseRoute = createRoute({
  method: "post",
  path: "/:id/start",
  summary: "Start Database",
  description: "Start Database by id",
  tags: ["Database"],
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
      description: "Database started",
    },
    404: {
      description: "Database not found",
    },
  },
});
