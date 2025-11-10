FROM node:25-trixie-slim
WORKDIR /workspace

# Install VS Code devcontainer dependencies
RUN apt-get update && apt-get install -yqq --no-install-recommends \
    ca-certificates \
    curl \
    git \
    iputils-ping \
    jq \
    openssh-client \
    python3-dev \
    python-is-python3 \
    shfmt \
    vim \
    && \
    apt-get autoremove && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    update-ca-certificates

# Install NPM packages
COPY package.json .
ENV PATH=node_modules/.bin:$PATH
RUN mkdir -p /root/.npm/ && chown -R 1000:0 "/root/.npm" && npm install --include=dev

COPY ./.devcontainer/config/.bashrc ./.devcontainer/config/.bash_completion /root/

CMD ["bash"]
