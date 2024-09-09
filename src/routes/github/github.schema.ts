import { z } from "@hono/zod-openapi";

export const githubInstallAppRequest = z.object({
  installation_id: z.string().openapi({
    param: {
      in: "query",
      name: "installation_id",
    },
  }),
  setup_action: z.string().openapi({
    param: {
      in: "query",
      name: "setup_action",
    },
  }),
});
