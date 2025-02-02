# Build stage
FROM node:18.17.1-bullseye-slim AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:18.17.1-alpine3.18

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/yarn.lock ./

# Install production dependencies
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copy built application
COPY --from=builder /usr/src/app/dist ./dist

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set ownership and permissions
RUN chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose port (Cloud Run will override this, but it's good for documentation)
EXPOSE 5001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO- http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]