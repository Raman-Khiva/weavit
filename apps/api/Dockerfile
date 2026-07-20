FROM node:22-alpine
WORKDIR /usr/src/app
RUN corepack enable
# Copy root package.json and lockfile
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copy the api package.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages ./

RUN pnpm install --frozen-lockfile
# Copy app source
COPY . .

EXPOSE 4000

CMD [ "pnpm","--filter","api","dev" ]