# Build stage
FROM node:18 as build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# Set NODE_ENV to production explicitly
ENV NODE_ENV=production

# Add all environment variables needed at build time
ARG REACT_APP_API_URL
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_SANDBOX_SDK

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_SANDBOX_SDK=$REACT_APP_SANDBOX_SDK

RUN yarn build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/server.js .
COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

ENV NODE_ENV=production
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_SANDBOX_SDK=$REACT_APP_SANDBOX_SDK

EXPOSE 8080

CMD ["node", "server.js"]