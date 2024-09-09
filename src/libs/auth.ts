import { getGoogleProfile } from "./googleAuth";
import prisma from "./prisma";

export const getUser = async (token: string | undefined) => {
  if (!token) {
    return null;
  }
  const googleProfile = await getGoogleProfile(token);
  if (!googleProfile) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: {
      email: googleProfile.email,
    },
  });
  if (!user) {
    return null;
  }
  return user;
};
