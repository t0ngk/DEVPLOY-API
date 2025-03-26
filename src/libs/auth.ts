import { verify } from "hono/jwt";
import prisma from "./prisma";

export const getUser = async (token: string | undefined) => {
  if (!token) {
    return null;
  }
  const payload = await verify(token, process.env.JWT_SECRET) as { id: number };
  if (!payload) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
  });
  if (!user) {
    return null;
  }
  return user;
};
