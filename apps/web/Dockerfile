FROM node:22-alpine 

WORKDIR /app

RUN corepack enable

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' \
    -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' \
    >> /etc/apk/repositories && \
    apk add --no-cache doppler 


COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages ./packages

RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD [ "pnpm", "--filter","web","ddev" ]

