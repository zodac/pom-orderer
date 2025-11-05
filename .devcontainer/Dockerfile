# Use official Node LTS image
FROM node:25-trixie-slim

# Set working directory
WORKDIR /workspace

# Install VS Code devcontainer dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    wget \
    xvfb \
    && \
    rm -rf /var/lib/apt/lists/*

# Install NPM packages
COPY package.json .
RUN npm install --include=dev
ENV PATH=node_modules/.bin:$PATH

COPY ./.devcontainer/config/.bashrc ./.devcontainer/config/.bash_completion /root/

RUN mkdir -p /root/.npm/ && chown -R 1000:0 "/root/.npm"

# Default shell
CMD ["bash"]
