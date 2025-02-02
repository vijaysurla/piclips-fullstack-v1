# Build stage
FROM node:18 as build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN yarn build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/server.js .
COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

EXPOSE 8080

CMD ["node", "server.js"]