import { z } from "@hono/zod-openapi";
import { profileResponse } from "../../routes/auth/profile/profile.schema";

export type Context = {
  Variables: {
    user: z.infer<typeof profileResponse>
  };
}
