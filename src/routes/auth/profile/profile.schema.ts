import { z } from "@hono/zod-openapi";

export const profileRequest = z.object({
  authorization: z.string().openapi({
    param: {
      in: "header",
      name: "authorization"
    },
  }),
});

export const profileResponse = z
  .object({
    id: z.number(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    picture: z.string().url().nullable(),
  })
  .openapi("User profile", {
    title: "User profile",
    example: {
      id: 1,
      email: "64070000@kmitl.ac.th",
      firstName: "John",
      lastName: "Doe",
      picture: "https://lh3.googleusercontent.com/a/.....",
    },
  });
