# Stage 1: Build
FROM public.ecr.aws/lambda/nodejs:24 AS builder
WORKDIR /usr/app

COPY package*.json ./
# Install all dependencies (including devDependencies) to run tsc
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Prune devDependencies to save space
RUN npm prune --omit=dev --no-fund

# Explicitly remove Prisma CLI, typescript, and other peer deps that bypass pruning
RUN rm -rf node_modules/prisma node_modules/@prisma/engines node_modules/typescript node_modules/effect

# Keep only the Amazon Linux 2023 (RHEL) native Prisma engine needed for Lambda
RUN rm -f node_modules/.prisma/client/*darwin* node_modules/.prisma/client/*windows* node_modules/.prisma/client/*debian*

# Remove broken symlinks
RUN rm -rf node_modules/.bin

# Stage 2: Production Runtime
FROM public.ecr.aws/lambda/nodejs:24
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy compiled code and pruned node_modules from builder
COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/node_modules ./node_modules
COPY --from=builder /usr/app/package.json ./

# Define the Lambda handler
CMD ["dist/lambda.handler"]
