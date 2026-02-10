FROM node:22-bookworm

# System dependencies for Playwright browsers
RUN apt-get update && apt-get install -y \
    git \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    libwayland-client0 \
    && rm -rf /var/lib/apt/lists/*

# Global npm packages
RUN npm install -g \
    @anthropic-ai/claude-code \
    netlify-cli \
    replayio \
    tsx \
    typescript

# Install Playwright Chromium and Replay browser (globally accessible)
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright
RUN npx playwright install --with-deps chromium
RUN replayio update

# Git identity for commits inside container (system-level so it works for any uid)
RUN git config --system user.name "App Builder" && \
    git config --system user.email "app-builder@localhost"

# Copy loop script
WORKDIR /app-building
COPY package.json ./
RUN npm install --production
COPY src/ ./src/

ENTRYPOINT ["npx", "tsx", "src/loop.ts"]
