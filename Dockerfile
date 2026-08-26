# syntax=docker/dockerfile:1
FROM node:25-alpine AS build

WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
# `.dockerignore` keeps this from copying the host's `node_modules` over the tree `npm ci` just
# installed — the image is linux/amd64 and a macOS host's native binaries do not run here.
COPY . ./
# The bundle budget runs here rather than in a separate CI job because this is the only place a
# production build actually happens — an oversized chunk now fails the image instead of shipping.
RUN --mount=type=secret,id=sentry_auth_token,required=false \
    set -eu; \
    if [ -f /run/secrets/sentry_auth_token ]; then \
      SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token)"; \
      export SENTRY_AUTH_TOKEN; \
    fi; \
    npm run build; \
    npm run bundle:check; \
    find build -type f -name '*.map' -delete

# production environment
FROM nginx:stable-perl
COPY --from=build /app/build/client /usr/share/nginx/html
COPY --from=build /app/build/nginx-redirects.conf /etc/nginx/conf.d/00-legacy-redirects-map.conf
COPY etc/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
