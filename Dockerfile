FROM node:22-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo

# Copy repo for pruning
COPY . .

# Use turbo to prune the monorepo to only the required package
ARG PACKAGE_NAME
RUN turbo prune "${PACKAGE_NAME}" --docker

# Base stage for dependency installation
FROM node:22-alpine AS installer
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy pruned package.json files and lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies
RUN pnpm install

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build the package
ARG PACKAGE_NAME
RUN pnpm turbo run build --filter="${PACKAGE_NAME}"

# Final stage
FROM node:22-alpine AS runner
WORKDIR /app

# Copy installed node_modules and built app
COPY --from=installer /app .

# Set environment variables
ENV NODE_ENV=production

# Expose port 8080
EXPOSE 8080

# Run the app from the correct location
ARG ENTRY_POINT_FILE_PATH
# Convert ARG to ENV for runtime access
ENV ENTRY_POINT_FILE_PATH=${ENTRY_POINT_FILE_PATH}
CMD ["sh", "-c", "node apps/${ENTRY_POINT_FILE_PATH}"]