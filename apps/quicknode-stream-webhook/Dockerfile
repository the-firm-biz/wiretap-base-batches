FROM node:18-slim

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY src ./src

# Build the application
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"] 