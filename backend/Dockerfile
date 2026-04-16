FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy application source
COPY src ./src

EXPOSE 8080

CMD ["node", "src/server.js"]
