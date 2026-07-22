FROM node:22-alpine
WORKDIR /usr/src/app
RUN corepack enable


RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' \
    -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' \
    >> /etc/apk/repositories && \
    apk add --no-cache doppler 

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

RUN pnpm --filter api exec prisma generate

CMD [ "pnpm","--filter","api","ddev" ]