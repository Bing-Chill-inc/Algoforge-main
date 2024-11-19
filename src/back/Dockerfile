FROM oven/bun:alpine
WORKDIR /app/src/back

# Setup image
COPY ./src/back/package.json /app/src/back/
RUN cd /app/src/back && bun install

# Run app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "start" ]