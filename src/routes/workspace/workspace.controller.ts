import { createRoute, z } from "@hono/zod-openapi";
import { isUserLoggedIn } from "../../libs/middlewares/isUserLoggedIn";

export const getWorkspacesRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Get All Workspace",
  description: "Get All Workspace from current user",
  tags: ["Workspace"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  responses: {
    200: {
      description: "Return All Workspace",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

export const getWorkspaceBySlugRoute = createRoute({
  method: "get",
  path: "/:slug",
  summary: "Get Workspace",
  description: "Get Workspace by slug",
  tags: ["Workspace"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      slug: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Return Workspace",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Workspace not found or user is not in the workspace",
    },
  },
});

export const createWorkspaceRoute = createRoute({
  method: "post",
  path: "/",
  summary: "Create Workspace",
  description: "Create Workspace",
  tags: ["Workspace"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Workspace created",
    },
    401: {
      description: "Unauthorized",
    },
    406: {
      description: "Workspace already taken",
    },
  },
});

export const renameWorkspaceRoute = createRoute({
  method: "put",
  path: "/:slug",
  summary: "Rename Workspace",
  description: "Rename Workspace",
  tags: ["Workspace"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      slug: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Workspace renamed",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Permission denied or workspace not found",
    },
    406: {
      description: "Workspace name is already taken",
    },
  },
});

export const deleteWorkspaceRoute = createRoute({
  method: "delete",
  path: "/:slug",
  summary: "Delete Workspace",
  description: "Delete Workspace",
  tags: ["Workspace"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      slug: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Workspace deleted",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Permission denied or workspace not found",
    },
  },
});

export const sentInvaitationRoute = createRoute({
  method: "post",
  path: "/:slug/invite",
  summary: "Sent Invitation",
  description: "Sent Invitation to user",
  tags: ["Workspace"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      slug: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.string().email(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Invitation sent",
    },
    400: {
      description: "You can't invite yourself",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Permission denied or workspace not found",
    },
    406: {
      description: "User not found",
    },
    409: {
      description: "User already invited",
    },
  },
});

export const deleteInvitationRoute = createRoute({
  method: "delete",
  path: "/:slug/invite",
  summary: "Delete Invitation",
  description: "Delete Invitation",
  tags: ["Workspace"],
  middleware: [isUserLoggedIn],
  security: [
    {
      GoogleOAuthJWT: [],
    },
  ],
  request: {
    params: z.object({
      slug: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            email: z.string().email(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Invitation deleted",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Permission denied or workspace not found",
    },
    406: {
      description: "User not found",
    },
  },
});
