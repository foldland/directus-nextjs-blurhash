####################################################################################################
## Build Packages

FROM ghcr.io/pnpm/pnpm:12@sha256:1228cc16b32505a3e46e9a911c2af766c263928db01f21cd1e8b79c1bdd24431 AS build
COPY . /extensions
WORKDIR /extensions/packages/directus-extensions

RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --store-dir /var/cache/pnpm --frozen-lockfile &&\
    pnpm run build

####################################################################################################
## Create Production Image
FROM docker.io/directus/directus:12.6@sha256:e1561b5e526e8e7a2ac19b7bb6eab63611dd84a862a8c45b864118768a2baff4 AS directus

COPY --chown=node:node \
    --from=build /extensions/dist /directus/extensions/@foldland-directus-nextjs-blurhash/dist
COPY --chown=node:node \
    --from=build /extensions/package.json /directus/extensions/@foldland-directus-nextjs-blurhash/package.json
