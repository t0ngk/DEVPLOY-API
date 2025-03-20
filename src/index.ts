import "dotenv/config";
import { serve } from "@hono/node-server";
import { showRoutes } from "hono/dev";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import authRoute from "./routes/auth/auth.handler";
import githubRoute from "./routes/github/github.handler";
import workspaceRoute from "./routes/workspace/workspace.handler";
import inviteRoute from "./routes/invite/invite.handler";
import source from "./routes/source/source.handler";
import application from "./routes/application/application.handler";
import database from "./routes/database/database.handler";
import setting from "./routes/setting/setting.handler";
import dashboard from "./routes/dashboard/dashboard.handler";
import { docker } from "./libs/docker";
import { spawnAsync } from "./libs/spawnAsync";
import prisma from "./libs/prisma";
import { CronJob } from "cron";
import fs from "fs";
import { TraefikLog } from "./libs/types/TraefikLog";
import { disableApplication } from "./libs/deploy";
import { createNodeWebSocket } from "@hono/node-ws";

const app = new OpenAPIHono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

async function main() {
  app.openAPIRegistry.registerComponent("securitySchemes", "GoogleOAuthJWT", {
    type: "http",
    scheme: "bearer",
    in: "header",
    description: "Bearer JWT token",
  });

  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "DevPloy API",
      version: "1.0.0",
    },
  });

  app.get(
    "/doc",
    apiReference({
      spec: {
        url: "/openapi.json",
      },
    })
  );

  app.get(
    "/log/build/:id",
    upgradeWebSocket(async (c) => {
      let fileWatcher: fs.StatWatcher;

      return {
        onOpen: async (evt, ws) => {
          if (!fs.existsSync(`./app/${c.req.param("id")}/build.log`)) {
            console.log("Create build log file");
            fs.mkdirSync(
              `./app/${c.req.param("id")}`,
              {
                recursive: true,
              }
            );
            fs.writeFileSync(`./app/${c.req.param("id")}/build.log`, "", {});
          }
          fileWatcher = fs.watchFile(`./app/${c.req.param("id")}/build.log`, {interval: 10}, (curr, prev) => {
            if (fs.existsSync(`./app/${c.req.param("id")}/build.log`)) {            
              const log = fs.readFileSync(
                `./app/${c.req.param("id")}/build.log`,
                "utf-8"
              );
              ws.send(log);
            }
          });
        },
        onClose() {
          fileWatcher.removeAllListeners();
          console.log("closed");
        }
      }
    })
  );

  app.use(logger());
  app.use(cors());

  app.route("/auth", authRoute);
  app.route("/github", githubRoute);
  app.route("/workspace", workspaceRoute);
  app.route("/invite", inviteRoute);
  app.route("/source", source);
  app.route("/application", application);
  app.route("/database", database);
  app.route("/setting", setting);
  app.route("/dashboard", dashboard);

  const port = 3000;

  console.log("Check is docker swarm is initialized");
  const isSwarmInitialized = await docker.info();
  if (!isSwarmInitialized.Swarm.LocalNodeState) {
    console.log(
      "Docker swarm is not initialized, Auto initialize docker swarm"
    );
    const initSwarm = await spawnAsync("docker", ["swarm", "init"]);
    if (initSwarm.code != 0) {
      console.log("Error while initializing docker swarm");
      console.log(initSwarm.output.join("\n"));
      process.exit(1);
    } else {
      console.log("Docker swarm initialized successfully");
    }
  } else {
    console.log("Docker swarm is already initialized");
  }

  console.log("Check is traefik network exist");
  const isTraefikNetworkExist = await docker.listNetworks({
    filters: {
      name: ["traefik-public"],
    },
  });
  if (isTraefikNetworkExist.length == 0) {
    console.log("Traefik network not exist, Auto create traefik network");
    const createTraefikNetwork = await spawnAsync("docker", [
      "network",
      "create",
      "--driver",
      "overlay",
      "traefik-public",
    ]);
    if (createTraefikNetwork.code != 0) {
      console.log("Error while creating traefik network");
      console.log(createTraefikNetwork.output.join("\n"));
      process.exit(1);
    } else {
      console.log("Traefik network created successfully");
    }
  } else {
    console.log("Traefik network already exist");
  }

  console.log("Check is traefik running");
  const isTraefikRunning = await docker.listServices({
    filters: {
      name: ["devploy_traefik"],
    },
  });

  if (isTraefikRunning.length == 0) {
    console.log("Traefik is not running");
    console.log("Please run traefik manually with below command");
    console.log("docker stack deploy -c traefik.yml devploy");
    process.exit(1);
  } else {
    console.log("Traefik is running");
  }

  console.log("Is Devploy Setting initialized");
  const isDevploySetting = await prisma.setting.findFirst({});

  if (isDevploySetting) {
    console.log("Devploy Setting already initialized");
  } else {
    console.log(
      "Devploy Setting not initialized, Auto initialize Devploy Setting"
    );
    await prisma.setting.create({
      data: {},
    });
    console.log("Devploy Setting initialized successfully");
  }

  console.log(`Server is running on port ${port}\n`);
  showRoutes(app);

  const server = serve({
    fetch: app.fetch,
    port,
  });
  injectWebSocket(server);

  new CronJob(
    "* * * * * 1",
    async () => {
      if (fs.existsSync("access.log")) {
        console.log("Checking for inactive applications");
        const accessLog = fs.readFileSync("access.log", "utf-8");
        const rawLogs = accessLog.split("\n").filter((log) => log != "");
        const jsonLogs = rawLogs.map((log) => JSON.parse(log) as TraefikLog);
        const filteredLogs = jsonLogs.filter((log) => {
          const requestTime = new Date(log.StartUTC);
          const now = new Date();
          const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
          return requestTime > sevenDaysAgo;
        });
        const removedDupeLogs = filteredLogs.filter((log, index, self) => {
          return (
            index === self.findIndex((t) => t.ServiceName === log.ServiceName)
          );
        });
        const formattedLogs = removedDupeLogs.map((log) =>
          parseInt(log.ServiceName.replaceAll(/[^0-9]/g, ""))
        );
        const applications = await prisma.appication.findMany({
          where: {
            NOT: {
              id: {
                in: formattedLogs,
              },
            },
            status: "Deployed",
          },
          select: {
            id: true,
          },
        });
        for (const application of applications) {
          disableApplication(application.id);
        }
        await prisma.appication.updateMany({
          where: {
            NOT: {
              id: {
                in: formattedLogs,
              },
            },
            status: "Deployed",
          },
          data: {
            status: "notStarted",
          },
        });
        fs.writeFileSync("access.log", "");
      }
    },
    null,
    true
  );
}

main();
