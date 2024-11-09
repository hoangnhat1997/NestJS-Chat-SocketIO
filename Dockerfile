# Stage 1: Build the NestJS application
FROM node:20 AS builder

WORKDIR /app

# Copy package.json and yarn.lock for dependency installation
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application files and build
COPY . .

# Generate Prisma Client with the correct binary target
RUN npx prisma generate

# Build the NestJS application
RUN yarn build

# Stage 2: Runtime setup
FROM node:20
WORKDIR /

# Copy the built application, dependencies, and .env file from the build stage
COPY --from=builder /app/package.json /app/yarn.lock /app
COPY --from=builder /app/.env .env
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma


# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]

