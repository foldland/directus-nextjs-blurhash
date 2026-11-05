####################################################################################################
## Build Packages

FROM docker.io/node:24.22.2-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /extensions
WORKDIR /extensions

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile &&\
    pnpm run build

####################################################################################################
## Create Production Image
FROM docker.io/directus/directus:12.6@sha256:e1561b5e526e8e7a2ac19b7bb6eab63611dd84a862a8c45b864118768a2baff4 AS directus

COPY --chown=node:node \
    --from=build /extensions/dist /directus/extensions/@foldland-directus-nextjs-blurhash/dist
COPY --chown=node:node \
    --from=build /extensions/package.json /directus/extensions/@foldland-directus-nextjs-blurhash/package.json
