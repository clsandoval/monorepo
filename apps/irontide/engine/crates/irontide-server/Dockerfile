FROM rust:1.80-slim AS builder
WORKDIR /build

# Copy only what's needed for the server crate
COPY Cargo.toml Cargo.toml
COPY crates/irontide-server crates/irontide-server

# Create stub crates for workspace members so cargo resolves the workspace
RUN mkdir -p crates/irontide-core/src && echo "" > crates/irontide-core/src/lib.rs
RUN mkdir -p crates/irontide-wasm/src && echo "" > crates/irontide-wasm/src/lib.rs

# Create minimal Cargo.toml stubs for workspace members
RUN echo '[package]\nname = "irontide-core"\nversion = "0.1.0"\nedition = "2021"' > crates/irontide-core/Cargo.toml
RUN echo '[package]\nname = "irontide-wasm"\nversion = "0.1.0"\nedition = "2021"' > crates/irontide-wasm/Cargo.toml

RUN cargo build --release -p irontide-server

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/target/release/irontide-server /usr/local/bin/irontide-server
EXPOSE 8080
CMD ["irontide-server"]
