FROM node:22-alpine
WORKDIR /usr/src/app
# Copy root package.json and lockfile
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

RUN corepack enable
# Copy the api package.json
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile
# Copy app source
COPY . .

EXPOSE 4000

CMD [ "pnpm","--filter","api","dev" ]