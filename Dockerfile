FROM oven/bun:latest
WORKDIR /app

COPY . .

RUN bun install

# Expose Port

EXPOSE 7419

CMD ["bun", "dev"]