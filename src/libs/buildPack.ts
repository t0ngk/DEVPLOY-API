export const createStaticBuildpack = (config?: { [key: string]: string }) => {
  return `FROM nginx:latest
COPY . /usr/share/nginx/html
`;
};

export const createNodeBuildpack = (config?: { [key: string]: string }) => {
  return `FROM node as build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node as production
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000

ENV NODE_ENV=production
CMD [ "node", "build/index.js" ]
`;
};
