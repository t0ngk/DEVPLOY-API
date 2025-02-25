export const createStaticBuildpack = (config?: { [key: string]: string }) => {
  return `FROM nginx:latest
COPY . /usr/share/nginx/html
`;
};

export const createNodeBuildpack = (config: { [key: string]: string } = {
  buildCommand: "npm run build",
  installCommand: "npm install",
  startCommand: "node build/index.js",
}) => {
  return `FROM node as build
WORKDIR /app

COPY package.json ./
RUN ${config.installCommand}

COPY . .

RUN ${config.buildCommand}

FROM node as production
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production
CMD ${JSON.stringify(config.startCommand.split(" "))}
`;
};
