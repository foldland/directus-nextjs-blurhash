####################################################################################################
## Build Packages

FROM ghcr.io/pnpm/pnpm:12@sha256:349c846c6c9dab76b2f6fbf4b2df14d5a8c9b2a0fce92fc7e5c2eec3f437e801 AS build
COPY . /extensions
WORKDIR /extensions/packages/directus-extensions

RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --store-dir /var/cache/pnpm --frozen-lockfile &&\
    pnpm run build

####################################################################################################
## Create Production Image
FROM docker.io/directus/directus:12.7@sha256:f197911d949a37d882f781b0381955b851c86625435014cd67bdaf3eabcff2a7 AS directus

COPY --chown=node:node \
    --from=build /extensions/dist /directus/extensions/@foldland-directus-nextjs-blurhash/dist
COPY --chown=node:node \
    --from=build /extensions/package.json /directus/extensions/@foldland-directus-nextjs-blurhash/package.json
