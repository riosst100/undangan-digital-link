FROM node:22-slim

RUN npm install -g pnpm

WORKDIR /app

EXPOSE 3000
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm dev --hostname 0.0.0.0 --port 3000"]
