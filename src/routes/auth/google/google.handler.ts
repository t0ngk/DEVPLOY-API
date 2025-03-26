import { OpenAPIHono } from "@hono/zod-openapi";
import {
  googleCallbackRoute,
  googleLoginRoute,
  googleRefreshTokenRoute,
} from "./google.controller";
import { generateCodeVerifier, generateState } from "arctic";
import { getGoogleProfile, google } from "../../../libs/googleAuth";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import prisma from "../../../libs/prisma";
import { errorHook } from "../../../libs/errorHook";
import { sign } from "hono/jwt";

const app = new OpenAPIHono({
  defaultHook: errorHook
});

app.openapi(googleLoginRoute, async (c) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url: URL = google.createAuthorizationURL(state, codeVerifier, ["profile", "email"]);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  setCookie(c, "state", state, { secure: true });
  setCookie(c, "codeVerifier", codeVerifier, { secure: true });
  return c.redirect(url.toString());
});

app.openapi(googleCallbackRoute, async (c) => {
  const codeVerifier = getCookie(c, "codeVerifier");
  const cookieState = getCookie(c, "state");

  const { code, state } = c.req.query();

  if (!code || !cookieState || !codeVerifier || state !== cookieState) {
    return c.json(
      {
        message: "Invalid request",
      },
      400
    );
  }

  const setting = await prisma.setting.findFirst();
  if (!setting) {
    return c.json(
      {
        message: "Setting not found",
      },
      500
    );
  }

  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const googleProfile = await getGoogleProfile(tokens.accessToken());
  const isOwner = (await prisma.user.count()) === 0;
  if (!googleProfile) {
    return c.json(
      {
        message: "Invalid request",
      },
      400
    );
  }
  let user = await prisma.user.findUnique({
    where: {
      email: googleProfile.email,
    },
  });
  if (!user) {
    const DEFAULT_WORKSPACE_NAME = `${googleProfile.given_name}'s Workspace`;
    user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: googleProfile.email,
          studentId: googleProfile.email.split("@")[0],
          firstName: googleProfile.given_name,
          lastName: googleProfile.family_name,
          picture: googleProfile.picture,
          applicationQuota: setting.defaultApplictionQuota,
          databaseQuota: setting.defaultDatabaseQuota,
          role: isOwner ? "OWNER" : "MEMBER",
        },
      });
      const workspace = await tx.workspace.create({
        data: {
          name: DEFAULT_WORKSPACE_NAME,
          slug: DEFAULT_WORKSPACE_NAME.toLowerCase()
            .replaceAll(" ", "-")
            .replace(/[^a-zA-Z0-9-_\.]/g, ""),
          permission: {
            create: {
              role: "OWNER",
              User: {
                connect: {
                  id: user.id,
                },
              },
            },
          },
        },
      });
      await tx.userOfWorkspace.create({
        data: {
          User: {
            connect: {
              id: user.id,
            },
          },
          Workspace: {
            connect: {
              id: workspace.id,
            },
          },
        },
      });
      return user;
    });
  }
  // setCookie(c, "accessToken", tokens.accessToken(), {
  //   secure: true,
  //   expires: tokens.accessTokenExpiresAt(),
  // });
  // if (tokens.hasRefreshToken()) {
  //   setCookie(c, "refreshToken", tokens.refreshToken(), {
  //     secure: true,
  //   });
  // }
  const jwt = await sign({ id: user.id }, process.env.JWT_SECRET);
  setCookie(c, "accessToken", jwt, {
    secure: true
  });
  deleteCookie(c, "codeVerifier");
  deleteCookie(c, "state");
  return c.redirect(process.env.BASE_URL);
});

app.openapi(googleRefreshTokenRoute, async (c) => {
  const refreshToken = c.req.header("Authorization")?.split(" ")[1];
  if (!refreshToken) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const tokens = await google.refreshAccessToken(refreshToken);
  setCookie(c, "accessToken", tokens.accessToken(), {
    secure: true,
    expires: tokens.accessTokenExpiresAt(),
  });
  return c.json({
    accessToken: tokens.accessToken(),
    expiresAt: tokens.accessTokenExpiresAt(),
  });
});

export default app;
