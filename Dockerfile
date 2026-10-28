####################################################################################################
## Build Packages

FROM docker.io/node:24.22.1-slim@sha256:be8204d4bd327363357f532187b752ff62759c31bedf98e9e18fc08c9cbd605c AS build
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
FROM docker.io/directus/directus:12.6@sha256:5a475c31cf547da604b3ef1bd85097145825ca6aab8841dc784bb08eaa21681b AS directus

COPY --chown=node:node \
    --from=build /extensions/dist /directus/extensions/@foldland-directus-nextjs-blurhash/dist
COPY --chown=node:node \
    --from=build /extensions/package.json /directus/extensions/@foldland-directus-nextjs-blurhash/package.json
