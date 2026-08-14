####################################################################################################
## Build Packages

FROM docker.io/node:24.19.0-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS build
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
FROM docker.io/directus/directus:12.1@sha256:27fd291463f4e746a7911139377a1dbc7a5c09ae82ee15b028b97bcc4950c69d AS directus

COPY --chown=node:node \
    --from=build /extensions/dist /directus/extensions/@foldland-directus-nextjs-blurhash/dist
COPY --chown=node:node \
    --from=build /extensions/package.json /directus/extensions/@foldland-directus-nextjs-blurhash/package.json
