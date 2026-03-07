# Cheerful CLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Rust CLI binary that exposes the full Cheerful platform (campaigns, creators, threads, drafts, email, workflows, analytics, integrations, lists, Temporal) as structured commands for automation, AI agents, and team power users.

**Architecture:** Dual-client Rust binary — HTTP client (reqwest) for CRUD against FastAPI backend, Temporal client (temporalio-sdk-core) for direct workflow orchestration. JSON output by default, `--pretty` for tables. Config in `~/.cheerful/config.toml` with env var overrides.

**Tech Stack:** Rust, clap (derive API), reqwest (async, rustls), temporalio-sdk-core, serde/serde_json, toml, tabled, keyring, tokio, assert_cmd + wiremock (testing).

**Design doc:** `docs/plans/2026-03-07-cheerful-cli-design.md`

**Location:** `projects/cheerful/apps/cli/`

---

## Phase 1: Foundation

### Task 1: Cargo Project Scaffold

**Files:**
- Create: `projects/cheerful/apps/cli/Cargo.toml`
- Create: `projects/cheerful/apps/cli/src/main.rs`
- Create: `projects/cheerful/apps/cli/.gitignore`

**Step 1: Create Cargo project**

```bash
cd projects/cheerful/apps
cargo init --name cheerful cli
```

**Step 2: Add dependencies to Cargo.toml**

```toml
[package]
name = "cheerful"
version = "0.1.0"
edition = "2021"
description = "Cheerful platform CLI — campaigns, creators, workflows"

[dependencies]
clap = { version = "4", features = ["derive", "env"] }
reqwest = { version = "0.12", features = ["json", "rustls-tls"], default-features = false }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
toml = "0.8"
tokio = { version = "1", features = ["full"] }
tabled = "0.17"
dirs = "6"
thiserror = "2"

[dev-dependencies]
assert_cmd = "2"
predicates = "3"
wiremock = "0.6"
tempfile = "3"
```

**Step 3: Write minimal main.rs with clap**

```rust
use clap::Parser;

#[derive(Parser)]
#[command(name = "cheerful", about = "Cheerful platform CLI")]
struct Cli {
    /// Output in pretty table format instead of JSON
    #[arg(long, global = true)]
    pretty: bool,

    /// Request timeout in seconds
    #[arg(long, global = true, default_value = "30")]
    timeout: u64,

    #[command(subcommand)]
    command: Commands,
}

#[derive(clap::Subcommand)]
enum Commands {
    /// Authentication management
    Auth,
    /// Campaign management
    Campaigns,
    /// Creator discovery and management
    Creators,
    /// Email thread management
    Threads,
    /// Draft management
    Drafts,
    /// Email sending and scheduling
    Email,
    /// Campaign workflow automation rules
    Workflows,
    /// Dashboard analytics
    Analytics,
    /// Integration management (Gmail, SMTP, Shopify, etc.)
    Integrations,
    /// Creator list management
    Lists,
    /// Temporal workflow operations
    Temporal,
    /// CLI configuration
    Config,
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();
    match cli.command {
        _ => {
            eprintln!("Command not yet implemented");
            std::process::exit(2);
        }
    }
}
```

**Step 4: Verify it compiles and runs**

Run: `cd projects/cheerful/apps/cli && cargo build`
Expected: Compiles with no errors.

Run: `cargo run -- --help`
Expected: Shows help text with all 12 subcommands listed.

**Step 5: Commit**

```bash
git add projects/cheerful/apps/cli/
git commit -m "cheerful-cli: scaffold Cargo project with clap"
```

---

### Task 2: Error Types and Exit Codes

**Files:**
- Create: `projects/cheerful/apps/cli/src/error.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write error module**

```rust
// src/error.rs
use std::fmt;
use std::process;

#[derive(Debug)]
pub enum ExitCode {
    ApiError = 1,
    UsageError = 2,
    AuthError = 3,
    NetworkError = 4,
    TemporalError = 5,
}

#[derive(Debug, thiserror::Error)]
pub enum CliError {
    #[error("API error ({status}): {message}")]
    Api { status: u16, error: String, message: String },

    #[error("Auth error: {0}")]
    Auth(String),

    #[error("Network error: {0}")]
    Network(String),

    #[error("Temporal error: {0}")]
    Temporal(String),

    #[error("Config error: {0}")]
    Config(String),

    #[error("{0}")]
    Other(String),
}

impl CliError {
    pub fn exit_code(&self) -> i32 {
        match self {
            CliError::Api { .. } => ExitCode::ApiError as i32,
            CliError::Auth(_) => ExitCode::AuthError as i32,
            CliError::Network(_) => ExitCode::NetworkError as i32,
            CliError::Temporal(_) => ExitCode::TemporalError as i32,
            CliError::Config(_) | CliError::Other(_) => ExitCode::ApiError as i32,
        }
    }

    pub fn to_json(&self) -> serde_json::Value {
        match self {
            CliError::Api { status, error, message } => serde_json::json!({
                "error": error,
                "message": message,
                "status": status,
            }),
            other => serde_json::json!({
                "error": "cli_error",
                "message": other.to_string(),
            }),
        }
    }

    pub fn print_and_exit(self, pretty: bool) -> ! {
        if pretty {
            eprintln!("Error: {}", self);
        } else {
            eprintln!("{}", self.to_json());
        }
        process::exit(self.exit_code());
    }
}

impl From<reqwest::Error> for CliError {
    fn from(e: reqwest::Error) -> Self {
        if e.is_timeout() {
            CliError::Network(format!("Request timed out: {e}"))
        } else if e.is_connect() {
            CliError::Network(format!("Connection failed: {e}"))
        } else {
            CliError::Other(e.to_string())
        }
    }
}
```

**Step 2: Write test for error JSON output**

Create `projects/cheerful/apps/cli/src/error.rs` test section at bottom:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_api_error_json() {
        let err = CliError::Api {
            status: 404,
            error: "not_found".into(),
            message: "Campaign not found".into(),
        };
        let json = err.to_json();
        assert_eq!(json["status"], 404);
        assert_eq!(json["error"], "not_found");
        assert_eq!(json["message"], "Campaign not found");
    }

    #[test]
    fn test_exit_codes() {
        assert_eq!(CliError::Auth("test".into()).exit_code(), 3);
        assert_eq!(CliError::Network("test".into()).exit_code(), 4);
        assert_eq!(CliError::Temporal("test".into()).exit_code(), 5);
    }
}
```

**Step 3: Add mod to main.rs**

Add `mod error;` to `src/main.rs`.

**Step 4: Run tests**

Run: `cargo test`
Expected: 2 tests pass.

**Step 5: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: error types with exit codes and JSON output"
```

---

### Task 3: Config Module

**Files:**
- Create: `projects/cheerful/apps/cli/src/config.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write config module with tests**

```rust
// src/config.rs
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub struct Config {
    #[serde(default)]
    pub api: ApiConfig,
    #[serde(default)]
    pub temporal: TemporalConfig,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub struct ApiConfig {
    pub url: Option<String>,
    pub key: Option<String>,
    pub token: Option<String>,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub struct TemporalConfig {
    pub server: Option<String>,
    pub namespace: Option<String>,
    pub tls_cert: Option<String>,
}

impl Config {
    pub fn config_dir() -> PathBuf {
        dirs::home_dir()
            .expect("Could not determine home directory")
            .join(".cheerful")
    }

    pub fn config_path() -> PathBuf {
        Self::config_dir().join("config.toml")
    }

    /// Load config from file, falling back to defaults if file doesn't exist.
    pub fn load() -> Result<Self, crate::error::CliError> {
        let path = Self::config_path();
        if !path.exists() {
            return Ok(Self::default());
        }
        let contents = std::fs::read_to_string(&path)
            .map_err(|e| crate::error::CliError::Config(format!("Failed to read config: {e}")))?;
        toml::from_str(&contents)
            .map_err(|e| crate::error::CliError::Config(format!("Failed to parse config: {e}")))
    }

    /// Load config with env var overrides applied.
    pub fn load_with_env() -> Result<Self, crate::error::CliError> {
        let mut config = Self::load()?;

        if let Ok(v) = std::env::var("CHEERFUL_API_URL") { config.api.url = Some(v); }
        if let Ok(v) = std::env::var("CHEERFUL_API_KEY") { config.api.key = Some(v); }
        if let Ok(v) = std::env::var("CHEERFUL_TEMPORAL_SERVER") { config.temporal.server = Some(v); }
        if let Ok(v) = std::env::var("CHEERFUL_TEMPORAL_NAMESPACE") { config.temporal.namespace = Some(v); }
        if let Ok(v) = std::env::var("CHEERFUL_TEMPORAL_TLS_CERT") { config.temporal.tls_cert = Some(v); }

        Ok(config)
    }

    /// Save config to file with 0600 permissions.
    pub fn save(&self) -> Result<(), crate::error::CliError> {
        let dir = Self::config_dir();
        std::fs::create_dir_all(&dir)
            .map_err(|e| crate::error::CliError::Config(format!("Failed to create config dir: {e}")))?;

        let path = Self::config_path();
        let contents = toml::to_string_pretty(self)
            .map_err(|e| crate::error::CliError::Config(format!("Failed to serialize config: {e}")))?;
        std::fs::write(&path, &contents)
            .map_err(|e| crate::error::CliError::Config(format!("Failed to write config: {e}")))?;

        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o600))
                .map_err(|e| crate::error::CliError::Config(format!("Failed to set permissions: {e}")))?;
        }

        Ok(())
    }

    /// Return a redacted copy for display (secrets masked).
    pub fn redacted(&self) -> Self {
        let mut c = self.clone();
        if let Some(ref k) = c.api.key {
            if k.len() > 6 {
                c.api.key = Some(format!("{}...{}", &k[..3], &k[k.len()-3..]));
            }
        }
        if let Some(ref t) = c.api.token {
            if t.len() > 6 {
                c.api.token = Some(format!("{}...{}", &t[..3], &t[t.len()-3..]));
            }
        }
        c
    }

    /// Get the API base URL, with default fallback.
    pub fn api_url(&self) -> String {
        self.api.url.clone().unwrap_or_else(|| "http://localhost:8000".into())
    }

    /// Get the Temporal server address, with default fallback.
    pub fn temporal_server(&self) -> String {
        self.temporal.server.clone().unwrap_or_else(|| "localhost:7233".into())
    }

    /// Get the Temporal namespace, with default fallback.
    pub fn temporal_namespace(&self) -> String {
        self.temporal.namespace.clone().unwrap_or_else(|| "default".into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = Config::default();
        assert_eq!(config.api_url(), "http://localhost:8000");
        assert_eq!(config.temporal_server(), "localhost:7233");
        assert_eq!(config.temporal_namespace(), "default");
    }

    #[test]
    fn test_parse_toml() {
        let toml_str = r#"
[api]
url = "https://api.cheerful.com"
key = "ck_live_abc123"

[temporal]
server = "temporal.cheerful.internal:7233"
namespace = "cheerful-production"
"#;
        let config: Config = toml::from_str(toml_str).unwrap();
        assert_eq!(config.api_url(), "https://api.cheerful.com");
        assert_eq!(config.api.key.unwrap(), "ck_live_abc123");
        assert_eq!(config.temporal_server(), "temporal.cheerful.internal:7233");
    }

    #[test]
    fn test_redaction() {
        let config = Config {
            api: ApiConfig {
                key: Some("ck_live_abc123456".into()),
                token: Some("eyJhbGciOiJIUzI1NiJ9.payload".into()),
                ..Default::default()
            },
            ..Default::default()
        };
        let redacted = config.redacted();
        assert_eq!(redacted.api.key.unwrap(), "ck_...456");
        assert_eq!(redacted.api.token.unwrap(), "eyJ...oad");
    }

    #[test]
    fn test_roundtrip_save_load() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("config.toml");

        let config = Config {
            api: ApiConfig {
                url: Some("https://test.com".into()),
                key: Some("ck_test".into()),
                ..Default::default()
            },
            ..Default::default()
        };

        let contents = toml::to_string_pretty(&config).unwrap();
        std::fs::write(&path, &contents).unwrap();

        let loaded: Config = toml::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
        assert_eq!(loaded.api_url(), "https://test.com");
        assert_eq!(loaded.api.key.unwrap(), "ck_test");
    }
}
```

**Step 2: Add mod to main.rs**

Add `mod config;` to `src/main.rs`.

**Step 3: Run tests**

Run: `cargo test`
Expected: All tests pass (2 error + 4 config).

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: config module with TOML parsing, env overrides, redaction"
```

---

### Task 4: Output Formatting Module

**Files:**
- Create: `projects/cheerful/apps/cli/src/output.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write output module**

```rust
// src/output.rs
use serde::Serialize;
use tabled::Tabled;

/// Print a single item as JSON or pretty.
pub fn print_one<T: Serialize + std::fmt::Display>(item: &T, pretty: bool) {
    if pretty {
        println!("{item}");
    } else {
        println!("{}", serde_json::to_string(item).unwrap());
    }
}

/// Print a list as JSON array or pretty table.
pub fn print_list<T: Serialize + Tabled>(items: &[T], pretty: bool) {
    if pretty {
        if items.is_empty() {
            println!("No results.");
        } else {
            let table = tabled::Table::new(items)
                .with(tabled::settings::Style::rounded())
                .to_string();
            println!("{table}");
        }
    } else {
        println!("{}", serde_json::to_string(items).unwrap());
    }
}

/// Print raw JSON value.
pub fn print_json(value: &serde_json::Value, pretty: bool) {
    if pretty {
        println!("{}", serde_json::to_string_pretty(value).unwrap());
    } else {
        println!("{}", serde_json::to_string(value).unwrap());
    }
}

/// Print a success message.
pub fn print_success(message: &str, pretty: bool) {
    if pretty {
        println!("{message}");
    } else {
        println!("{}", serde_json::json!({"ok": true, "message": message}));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::Serialize;
    use tabled::Tabled;

    #[derive(Serialize, Tabled)]
    struct TestItem {
        id: String,
        name: String,
    }

    impl std::fmt::Display for TestItem {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "{}: {}", self.id, self.name)
        }
    }

    #[test]
    fn test_print_list_json() {
        // Just verify serialization doesn't panic
        let items = vec![
            TestItem { id: "1".into(), name: "Alice".into() },
            TestItem { id: "2".into(), name: "Bob".into() },
        ];
        let json = serde_json::to_string(&items).unwrap();
        assert!(json.contains("Alice"));
        assert!(json.contains("Bob"));
    }
}
```

**Step 2: Add mod to main.rs**

Add `mod output;` to `src/main.rs`.

**Step 3: Run tests**

Run: `cargo test`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: output formatting module (JSON + pretty tables)"
```

---

### Task 5: HTTP API Client

**Files:**
- Create: `projects/cheerful/apps/cli/src/api.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write API client**

```rust
// src/api.rs
use crate::config::Config;
use crate::error::CliError;
use reqwest::{Client, Method, Response};
use serde::de::DeserializeOwned;
use std::time::Duration;

pub struct ApiClient {
    client: Client,
    base_url: String,
    api_key: Option<String>,
    token: Option<String>,
}

impl ApiClient {
    pub fn from_config(config: &Config, timeout_secs: u64) -> Result<Self, CliError> {
        let client = Client::builder()
            .timeout(Duration::from_secs(timeout_secs))
            .build()
            .map_err(|e| CliError::Network(format!("Failed to build HTTP client: {e}")))?;

        Ok(Self {
            client,
            base_url: config.api_url(),
            api_key: config.api.key.clone(),
            token: config.api.token.clone(),
        })
    }

    fn auth_header(&self) -> Result<(String, String), CliError> {
        if let Some(ref key) = self.api_key {
            Ok(("X-Service-Api-Key".into(), key.clone()))
        } else if let Some(ref token) = self.token {
            Ok(("Authorization".into(), format!("Bearer {token}")))
        } else {
            Err(CliError::Auth("No API key or token configured. Run `cheerful auth login` first.".into()))
        }
    }

    pub async fn request(
        &self,
        method: Method,
        path: &str,
        body: Option<serde_json::Value>,
    ) -> Result<Response, CliError> {
        let url = format!("{}{}", self.base_url, path);
        let (header_name, header_value) = self.auth_header()?;

        let mut req = self.client.request(method, &url)
            .header(&header_name, &header_value);

        if let Some(body) = body {
            req = req.json(&body);
        }

        let resp = req.send().await?;

        if !resp.status().is_success() {
            let status = resp.status().as_u16();
            let body: serde_json::Value = resp.json().await.unwrap_or_else(|_| {
                serde_json::json!({"detail": "Unknown error"})
            });
            let message = body["detail"].as_str()
                .or_else(|| body["message"].as_str())
                .unwrap_or("Unknown error")
                .to_string();
            let error = body["error"].as_str().unwrap_or("api_error").to_string();
            return Err(CliError::Api { status, error, message });
        }

        Ok(resp)
    }

    pub async fn get<T: DeserializeOwned>(&self, path: &str) -> Result<T, CliError> {
        let resp = self.request(Method::GET, path, None).await?;
        resp.json::<T>().await.map_err(|e| CliError::Other(format!("Failed to parse response: {e}")))
    }

    pub async fn post<T: DeserializeOwned>(&self, path: &str, body: serde_json::Value) -> Result<T, CliError> {
        let resp = self.request(Method::POST, path, Some(body)).await?;
        resp.json::<T>().await.map_err(|e| CliError::Other(format!("Failed to parse response: {e}")))
    }

    pub async fn put<T: DeserializeOwned>(&self, path: &str, body: serde_json::Value) -> Result<T, CliError> {
        let resp = self.request(Method::PUT, path, Some(body)).await?;
        resp.json::<T>().await.map_err(|e| CliError::Other(format!("Failed to parse response: {e}")))
    }

    pub async fn patch<T: DeserializeOwned>(&self, path: &str, body: serde_json::Value) -> Result<T, CliError> {
        let resp = self.request(Method::PATCH, path, Some(body)).await?;
        resp.json::<T>().await.map_err(|e| CliError::Other(format!("Failed to parse response: {e}")))
    }

    pub async fn delete(&self, path: &str) -> Result<(), CliError> {
        self.request(Method::DELETE, path, None).await?;
        Ok(())
    }

    pub async fn get_json(&self, path: &str) -> Result<serde_json::Value, CliError> {
        self.get(path).await
    }

    pub async fn post_json(&self, path: &str, body: serde_json::Value) -> Result<serde_json::Value, CliError> {
        self.post(path, body).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_auth_header_api_key() {
        let client = ApiClient {
            client: Client::new(),
            base_url: "http://localhost".into(),
            api_key: Some("ck_test".into()),
            token: None,
        };
        let (name, value) = client.auth_header().unwrap();
        assert_eq!(name, "X-Service-Api-Key");
        assert_eq!(value, "ck_test");
    }

    #[test]
    fn test_auth_header_token() {
        let client = ApiClient {
            client: Client::new(),
            base_url: "http://localhost".into(),
            api_key: None,
            token: Some("eyJ123".into()),
        };
        let (name, value) = client.auth_header().unwrap();
        assert_eq!(name, "Authorization");
        assert_eq!(value, "Bearer eyJ123");
    }

    #[test]
    fn test_auth_header_prefers_api_key() {
        let client = ApiClient {
            client: Client::new(),
            base_url: "http://localhost".into(),
            api_key: Some("ck_test".into()),
            token: Some("eyJ123".into()),
        };
        let (name, _) = client.auth_header().unwrap();
        assert_eq!(name, "X-Service-Api-Key");
    }

    #[test]
    fn test_auth_header_no_credentials() {
        let client = ApiClient {
            client: Client::new(),
            base_url: "http://localhost".into(),
            api_key: None,
            token: None,
        };
        assert!(client.auth_header().is_err());
    }
}
```

**Step 2: Add mod to main.rs**

Add `mod api;` to `src/main.rs`.

**Step 3: Run tests**

Run: `cargo test`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: HTTP API client with auth header resolution"
```

---

### Task 6: App Context (Wiring Config + API + Output)

**Files:**
- Create: `projects/cheerful/apps/cli/src/context.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write context module**

The `Context` struct bundles config, API client, and output preferences so command handlers receive one object.

```rust
// src/context.rs
use crate::api::ApiClient;
use crate::config::Config;
use crate::error::CliError;

pub struct Context {
    pub config: Config,
    pub api: ApiClient,
    pub pretty: bool,
}

impl Context {
    pub fn new(pretty: bool, timeout: u64) -> Result<Self, CliError> {
        let config = Config::load_with_env()?;
        let api = ApiClient::from_config(&config, timeout)?;
        Ok(Self { config, api, pretty })
    }
}
```

**Step 2: Add mod to main.rs and wire into Cli**

```rust
// Update main.rs
mod api;
mod config;
mod context;
mod error;
mod output;

use clap::Parser;
use context::Context;

#[derive(Parser)]
#[command(name = "cheerful", about = "Cheerful platform CLI", version)]
struct Cli {
    #[arg(long, global = true)]
    pretty: bool,

    #[arg(long, global = true, default_value = "30")]
    timeout: u64,

    #[command(subcommand)]
    command: Commands,
}

// ... Commands enum stays the same ...

#[tokio::main]
async fn main() {
    let cli = Cli::parse();
    let ctx = match Context::new(cli.pretty, cli.timeout) {
        Ok(ctx) => ctx,
        Err(e) => e.print_and_exit(cli.pretty),
    };

    let result = match cli.command {
        _ => {
            Err(crate::error::CliError::Other("Command not yet implemented".into()))
        }
    };

    if let Err(e) = result {
        e.print_and_exit(ctx.pretty);
    }
}
```

**Step 3: Verify it compiles**

Run: `cargo build`
Expected: Compiles with no errors.

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: context module wiring config, API client, output prefs"
```

---

## Phase 2: Domain Models

### Task 7: Campaign Models

**Files:**
- Create: `projects/cheerful/apps/cli/src/models/mod.rs`
- Create: `projects/cheerful/apps/cli/src/models/campaign.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Create models module and campaign structs**

```rust
// src/models/mod.rs
pub mod campaign;
```

```rust
// src/models/campaign.rs
use serde::{Deserialize, Serialize};
use tabled::Tabled;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CampaignType {
    PaidPromotion,
    Creator,
    Gifting,
    Sales,
    Other,
}

impl std::fmt::Display for CampaignType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::PaidPromotion => write!(f, "Paid"),
            Self::Creator => write!(f, "Creator"),
            Self::Gifting => write!(f, "Gifting"),
            Self::Sales => write!(f, "Sales"),
            Self::Other => write!(f, "Other"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CampaignStatus {
    Active,
    Paused,
    Draft,
    Completed,
}

impl std::fmt::Display for CampaignStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Active => write!(f, "Active"),
            Self::Paused => write!(f, "Paused"),
            Self::Draft => write!(f, "Draft"),
            Self::Completed => write!(f, "Completed"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Campaign {
    pub id: String,
    pub name: String,
    pub campaign_type: Option<CampaignType>,
    pub status: Option<CampaignStatus>,
    pub product_id: Option<String>,
    pub is_external: Option<bool>,
    pub sent_count: Option<i64>,
    pub thread_count: Option<i64>,
    pub pending_count: Option<i64>,
    pub failed_count: Option<i64>,
    pub total_recipients: Option<i64>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Tabled)]
pub struct CampaignRow {
    #[tabled(rename = "ID")]
    pub id: String,
    #[tabled(rename = "Name")]
    pub name: String,
    #[tabled(rename = "Type")]
    pub campaign_type: String,
    #[tabled(rename = "Status")]
    pub status: String,
    #[tabled(rename = "Sent")]
    pub sent: String,
    #[tabled(rename = "Threads")]
    pub threads: String,
}

impl From<&Campaign> for CampaignRow {
    fn from(c: &Campaign) -> Self {
        Self {
            id: truncate_id(&c.id),
            name: c.name.clone(),
            campaign_type: c.campaign_type.as_ref().map(|t| t.to_string()).unwrap_or_default(),
            status: c.status.as_ref().map(|s| s.to_string()).unwrap_or_default(),
            sent: c.sent_count.map(|n| n.to_string()).unwrap_or("-".into()),
            threads: c.thread_count.map(|n| n.to_string()).unwrap_or("-".into()),
        }
    }
}

fn truncate_id(id: &str) -> String {
    if id.len() > 8 {
        format!("{}..{}", &id[..3], &id[id.len()-3..])
    } else {
        id.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deserialize_campaign() {
        let json = r#"{
            "id": "abc-123-def-456",
            "name": "Summer 2026",
            "campaign_type": "gifting",
            "status": "active",
            "sent_count": 142,
            "thread_count": 89
        }"#;
        let campaign: Campaign = serde_json::from_str(json).unwrap();
        assert_eq!(campaign.name, "Summer 2026");
        assert_eq!(campaign.sent_count, Some(142));
    }

    #[test]
    fn test_campaign_row_truncation() {
        assert_eq!(truncate_id("abc-123-def-456"), "abc..456");
        assert_eq!(truncate_id("short"), "short");
    }
}
```

**Step 2: Add models mod to main.rs**

Add `mod models;` to `src/main.rs`.

**Step 3: Run tests**

Run: `cargo test`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: campaign domain models with table formatting"
```

---

### Task 8: Creator Models

**Files:**
- Create: `projects/cheerful/apps/cli/src/models/creator.rs`
- Modify: `projects/cheerful/apps/cli/src/models/mod.rs`

**Step 1: Write creator models**

```rust
// src/models/creator.rs
use serde::{Deserialize, Serialize};
use tabled::Tabled;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocialMediaHandle {
    pub platform: Option<String>,
    pub handle: Option<String>,
    pub url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Creator {
    pub id: String,
    pub platform: Option<String>,
    pub handle: Option<String>,
    pub email: Option<String>,
    pub follower_count: Option<i64>,
    pub is_verified: Option<bool>,
    pub location: Option<String>,
    pub keywords: Option<Vec<String>>,
    pub profile_data: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CampaignCreator {
    pub id: String,
    pub campaign_id: Option<String>,
    pub email: Option<String>,
    pub name: Option<String>,
    pub role: Option<String>,
    pub gifting_status: Option<String>,
    pub paid_promotion_status: Option<String>,
    pub outreach_status: Option<String>,
    pub social_media_handles: Option<Vec<SocialMediaHandle>>,
    pub confidence_score: Option<f64>,
    pub latest_interaction_at: Option<String>,
}

#[derive(Tabled)]
pub struct CreatorRow {
    #[tabled(rename = "ID")]
    pub id: String,
    #[tabled(rename = "Handle")]
    pub handle: String,
    #[tabled(rename = "Platform")]
    pub platform: String,
    #[tabled(rename = "Followers")]
    pub followers: String,
    #[tabled(rename = "Email")]
    pub email: String,
    #[tabled(rename = "Location")]
    pub location: String,
}

impl From<&Creator> for CreatorRow {
    fn from(c: &Creator) -> Self {
        Self {
            id: super::campaign::truncate_id(&c.id),
            handle: c.handle.clone().unwrap_or_default(),
            platform: c.platform.clone().unwrap_or_default(),
            followers: c.follower_count.map(format_count).unwrap_or("-".into()),
            email: c.email.clone().unwrap_or("-".into()),
            location: c.location.clone().unwrap_or("-".into()),
        }
    }
}

#[derive(Tabled)]
pub struct CampaignCreatorRow {
    #[tabled(rename = "ID")]
    pub id: String,
    #[tabled(rename = "Name")]
    pub name: String,
    #[tabled(rename = "Email")]
    pub email: String,
    #[tabled(rename = "Role")]
    pub role: String,
    #[tabled(rename = "Gifting")]
    pub gifting: String,
    #[tabled(rename = "Outreach")]
    pub outreach: String,
}

impl From<&CampaignCreator> for CampaignCreatorRow {
    fn from(c: &CampaignCreator) -> Self {
        Self {
            id: super::campaign::truncate_id(&c.id),
            name: c.name.clone().unwrap_or("-".into()),
            email: c.email.clone().unwrap_or("-".into()),
            role: c.role.clone().unwrap_or("-".into()),
            gifting: c.gifting_status.clone().unwrap_or("-".into()),
            outreach: c.outreach_status.clone().unwrap_or("-".into()),
        }
    }
}

fn format_count(n: i64) -> String {
    if n >= 1_000_000 {
        format!("{:.1}M", n as f64 / 1_000_000.0)
    } else if n >= 1_000 {
        format!("{:.1}K", n as f64 / 1_000.0)
    } else {
        n.to_string()
    }
}

pub use super::campaign::truncate_id;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_count() {
        assert_eq!(format_count(500), "500");
        assert_eq!(format_count(1500), "1.5K");
        assert_eq!(format_count(2_500_000), "2.5M");
    }

    #[test]
    fn test_deserialize_campaign_creator() {
        let json = r#"{
            "id": "cc-123",
            "campaign_id": "camp-456",
            "name": "Jane Creator",
            "email": "jane@example.com",
            "role": "creator",
            "gifting_status": "opted_in",
            "social_media_handles": [{"platform": "instagram", "handle": "@jane"}]
        }"#;
        let cc: CampaignCreator = serde_json::from_str(json).unwrap();
        assert_eq!(cc.name, Some("Jane Creator".into()));
        assert_eq!(cc.gifting_status, Some("opted_in".into()));
    }
}
```

**Step 2: Add to models/mod.rs**

```rust
pub mod campaign;
pub mod creator;
```

Make `truncate_id` in campaign.rs public: `pub fn truncate_id(...)`.

**Step 3: Run tests**

Run: `cargo test`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: creator and campaign-creator models"
```

---

### Task 9: Thread, Message, and Draft Models

**Files:**
- Create: `projects/cheerful/apps/cli/src/models/thread.rs`
- Create: `projects/cheerful/apps/cli/src/models/draft.rs`
- Modify: `projects/cheerful/apps/cli/src/models/mod.rs`

**Step 1: Write thread models**

```rust
// src/models/thread.rs
use serde::{Deserialize, Serialize};
use tabled::Tabled;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ThreadStatus {
    ReadyForAttachmentExtraction,
    ReadyForCampaignAssociation,
    ReadyForResponseDraft,
    WaitingForDraftReview,
    WaitingForInbound,
    Ignore,
    Done,
    NotLatest,
}

impl std::fmt::Display for ThreadStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::ReadyForAttachmentExtraction => write!(f, "Extracting"),
            Self::ReadyForCampaignAssociation => write!(f, "Associating"),
            Self::ReadyForResponseDraft => write!(f, "Drafting"),
            Self::WaitingForDraftReview => write!(f, "Review"),
            Self::WaitingForInbound => write!(f, "Waiting"),
            Self::Ignore => write!(f, "Ignored"),
            Self::Done => write!(f, "Done"),
            Self::NotLatest => write!(f, "Superseded"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MessageDirection {
    Inbound,
    Outbound,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailThread {
    pub id: String,
    pub gmail_thread_id: Option<String>,
    pub email_thread_id: Option<String>,
    pub status: Option<ThreadStatus>,
    pub latest_internal_date: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailMessage {
    pub id: String,
    pub direction: Option<MessageDirection>,
    pub sender_email: Option<String>,
    pub recipient_emails: Option<Vec<String>>,
    pub cc_emails: Option<Vec<String>>,
    pub subject: Option<String>,
    pub body_text: Option<String>,
    pub internal_date: Option<String>,
}

#[derive(Tabled)]
pub struct ThreadRow {
    #[tabled(rename = "ID")]
    pub id: String,
    #[tabled(rename = "Thread ID")]
    pub thread_id: String,
    #[tabled(rename = "Status")]
    pub status: String,
    #[tabled(rename = "Last Activity")]
    pub last_activity: String,
}

impl From<&EmailThread> for ThreadRow {
    fn from(t: &EmailThread) -> Self {
        Self {
            id: super::campaign::truncate_id(&t.id),
            thread_id: t.gmail_thread_id.clone()
                .or_else(|| t.email_thread_id.clone())
                .map(|id| super::campaign::truncate_id(&id))
                .unwrap_or("-".into()),
            status: t.status.as_ref().map(|s| s.to_string()).unwrap_or("-".into()),
            last_activity: t.latest_internal_date.clone().unwrap_or("-".into()),
        }
    }
}
```

```rust
// src/models/draft.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Draft {
    pub gmail_thread_state_id: Option<String>,
    pub internal_date: Option<String>,
    pub draft_subject: Option<String>,
    pub draft_body_text: Option<String>,
    pub source: Option<String>,
    pub alternative_drafts: Option<Vec<serde_json::Value>>,
}

impl std::fmt::Display for Draft {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "Thread State: {}", self.gmail_thread_state_id.as_deref().unwrap_or("-"))?;
        writeln!(f, "Source: {}", self.source.as_deref().unwrap_or("-"))?;
        writeln!(f, "Subject: {}", self.draft_subject.as_deref().unwrap_or("-"))?;
        writeln!(f, "---")?;
        write!(f, "{}", self.draft_body_text.as_deref().unwrap_or("(empty)"))
    }
}
```

**Step 2: Update models/mod.rs**

```rust
pub mod campaign;
pub mod creator;
pub mod draft;
pub mod thread;
```

**Step 3: Run tests**

Run: `cargo test`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: thread, message, and draft models"
```

---

### Task 10: Remaining Models (Lists, Workflows, Analytics, Integrations, Email)

**Files:**
- Create: `projects/cheerful/apps/cli/src/models/list.rs`
- Create: `projects/cheerful/apps/cli/src/models/workflow.rs`
- Create: `projects/cheerful/apps/cli/src/models/analytics.rs`
- Create: `projects/cheerful/apps/cli/src/models/integration.rs`
- Create: `projects/cheerful/apps/cli/src/models/email.rs`
- Modify: `projects/cheerful/apps/cli/src/models/mod.rs`

**Step 1: Write all remaining models**

```rust
// src/models/list.rs
use serde::{Deserialize, Serialize};
use tabled::Tabled;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatorList {
    pub id: String,
    pub user_id: Option<String>,
    pub title: String,
    pub creator_count: Option<i64>,
    pub creators_without_email_count: Option<i64>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Tabled)]
pub struct CreatorListRow {
    #[tabled(rename = "ID")]
    pub id: String,
    #[tabled(rename = "Title")]
    pub title: String,
    #[tabled(rename = "Creators")]
    pub count: String,
    #[tabled(rename = "No Email")]
    pub no_email: String,
    #[tabled(rename = "Created")]
    pub created: String,
}

impl From<&CreatorList> for CreatorListRow {
    fn from(l: &CreatorList) -> Self {
        Self {
            id: super::campaign::truncate_id(&l.id),
            title: l.title.clone(),
            count: l.creator_count.map(|n| n.to_string()).unwrap_or("-".into()),
            no_email: l.creators_without_email_count.map(|n| n.to_string()).unwrap_or("-".into()),
            created: l.created_at.clone().unwrap_or("-".into()),
        }
    }
}
```

```rust
// src/models/workflow.rs
use serde::{Deserialize, Serialize};
use tabled::Tabled;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CampaignWorkflow {
    pub id: String,
    pub campaign_id: Option<String>,
    pub name: String,
    pub instructions: Option<String>,
    pub tool_slugs: Option<Vec<String>>,
    pub is_enabled: Option<bool>,
    pub created_at: Option<String>,
}

#[derive(Tabled)]
pub struct WorkflowRow {
    #[tabled(rename = "ID")]
    pub id: String,
    #[tabled(rename = "Name")]
    pub name: String,
    #[tabled(rename = "Enabled")]
    pub enabled: String,
    #[tabled(rename = "Tools")]
    pub tools: String,
}

impl From<&CampaignWorkflow> for WorkflowRow {
    fn from(w: &CampaignWorkflow) -> Self {
        Self {
            id: super::campaign::truncate_id(&w.id),
            name: w.name.clone(),
            enabled: w.is_enabled.map(|b| if b { "Yes" } else { "No" }.into()).unwrap_or("-".into()),
            tools: w.tool_slugs.as_ref().map(|t| t.join(", ")).unwrap_or("-".into()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowExecution {
    pub id: Option<String>,
    pub workflow_id: Option<String>,
    pub status: Option<String>,
    pub created_at: Option<String>,
}
```

```rust
// src/models/analytics.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardAnalytics {
    pub active_campaigns_count: Option<i64>,
    pub paused_campaigns_count: Option<i64>,
    pub total_opted_in: Option<i64>,
    pub total_opted_out: Option<i64>,
    pub total_new: Option<i64>,
    pub total_contacts: Option<i64>,
    pub opt_in_rate: Option<f64>,
    pub response_rate: Option<f64>,
    pub email_stats: Option<serde_json::Value>,
    pub recent_optins: Option<Vec<serde_json::Value>>,
    pub active_campaigns: Option<Vec<serde_json::Value>>,
    pub gifting_pipeline: Option<serde_json::Value>,
    pub paid_promotion_pipeline: Option<serde_json::Value>,
    pub follow_up_stats: Option<serde_json::Value>,
}

impl std::fmt::Display for DashboardAnalytics {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "=== Dashboard ===")?;
        writeln!(f, "Active Campaigns:  {}", self.active_campaigns_count.unwrap_or(0))?;
        writeln!(f, "Paused Campaigns:  {}", self.paused_campaigns_count.unwrap_or(0))?;
        writeln!(f, "Total Contacts:    {}", self.total_contacts.unwrap_or(0))?;
        writeln!(f, "Opted In:          {}", self.total_opted_in.unwrap_or(0))?;
        writeln!(f, "Opted Out:         {}", self.total_opted_out.unwrap_or(0))?;
        writeln!(f, "Opt-In Rate:       {:.1}%", self.opt_in_rate.unwrap_or(0.0) * 100.0)?;
        writeln!(f, "Response Rate:     {:.1}%", self.response_rate.unwrap_or(0.0) * 100.0)?;
        Ok(())
    }
}
```

```rust
// src/models/integration.rs
use serde::{Deserialize, Serialize};
use tabled::Tabled;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectedAccount {
    pub id: String,
    pub email: Option<String>,
    pub account_type: Option<String>,
    pub is_active: Option<bool>,
    pub sync_in_progress: Option<bool>,
    pub created_at: Option<String>,
}

#[derive(Tabled)]
pub struct AccountRow {
    #[tabled(rename = "ID")]
    pub id: String,
    #[tabled(rename = "Email")]
    pub email: String,
    #[tabled(rename = "Type")]
    pub account_type: String,
    #[tabled(rename = "Active")]
    pub active: String,
    #[tabled(rename = "Syncing")]
    pub syncing: String,
}

impl From<&ConnectedAccount> for AccountRow {
    fn from(a: &ConnectedAccount) -> Self {
        Self {
            id: super::campaign::truncate_id(&a.id),
            email: a.email.clone().unwrap_or("-".into()),
            account_type: a.account_type.clone().unwrap_or("-".into()),
            active: a.is_active.map(|b| if b { "Yes" } else { "No" }.into()).unwrap_or("-".into()),
            syncing: a.sync_in_progress.map(|b| if b { "Yes" } else { "No" }.into()).unwrap_or("-".into()),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailSignature {
    pub id: String,
    pub name: String,
    pub content: Option<String>,
    pub is_default: Option<bool>,
    pub is_enabled: Option<bool>,
    pub campaign_id: Option<String>,
}

#[derive(Tabled)]
pub struct SignatureRow {
    #[tabled(rename = "ID")]
    pub id: String,
    #[tabled(rename = "Name")]
    pub name: String,
    #[tabled(rename = "Default")]
    pub is_default: String,
    #[tabled(rename = "Enabled")]
    pub enabled: String,
}

impl From<&EmailSignature> for SignatureRow {
    fn from(s: &EmailSignature) -> Self {
        Self {
            id: super::campaign::truncate_id(&s.id),
            name: s.name.clone(),
            is_default: s.is_default.map(|b| if b { "Yes" } else { "No" }.into()).unwrap_or("-".into()),
            enabled: s.is_enabled.map(|b| if b { "Yes" } else { "No" }.into()).unwrap_or("-".into()),
        }
    }
}
```

```rust
// src/models/email.rs
use serde::{Deserialize, Serialize};
use tabled::Tabled;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduledEmail {
    pub id: String,
    pub recipient_email: Option<String>,
    pub subject: Option<String>,
    pub dispatch_at: Option<String>,
    pub status: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Tabled)]
pub struct ScheduledEmailRow {
    #[tabled(rename = "ID")]
    pub id: String,
    #[tabled(rename = "To")]
    pub recipient: String,
    #[tabled(rename = "Subject")]
    pub subject: String,
    #[tabled(rename = "Scheduled At")]
    pub dispatch_at: String,
    #[tabled(rename = "Status")]
    pub status: String,
}

impl From<&ScheduledEmail> for ScheduledEmailRow {
    fn from(e: &ScheduledEmail) -> Self {
        Self {
            id: super::campaign::truncate_id(&e.id),
            recipient: e.recipient_email.clone().unwrap_or("-".into()),
            subject: e.subject.clone().unwrap_or("-".into()),
            dispatch_at: e.dispatch_at.clone().unwrap_or("-".into()),
            status: e.status.clone().unwrap_or("-".into()),
        }
    }
}
```

**Step 2: Update models/mod.rs**

```rust
pub mod analytics;
pub mod campaign;
pub mod creator;
pub mod draft;
pub mod email;
pub mod integration;
pub mod list;
pub mod thread;
pub mod workflow;
```

**Step 3: Run tests**

Run: `cargo test`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: list, workflow, analytics, integration, email models"
```

---

## Phase 3: Commands

Each command module follows the same pattern: define clap subcommand enum, implement handler functions that call the API client and format output. Tasks 11-22 each implement one command group.

### Task 11: Config Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Create: `projects/cheerful/apps/cli/src/commands/config_cmd.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write config command handler**

```rust
// src/commands/mod.rs
pub mod config_cmd;
```

```rust
// src/commands/config_cmd.rs
use clap::Subcommand;
use crate::config::Config;
use crate::error::CliError;

#[derive(Subcommand)]
pub enum ConfigCommands {
    /// Show current configuration (secrets redacted)
    Show,
    /// Set a configuration value (e.g., api.url, api.key, temporal.server)
    Set {
        /// Config key in dot notation (e.g., api.url)
        key: String,
        /// Value to set
        value: String,
    },
    /// Interactive setup wizard
    Init,
}

pub fn run_show(pretty: bool) -> Result<(), CliError> {
    let config = Config::load()?;
    let redacted = config.redacted();
    if pretty {
        let toml_str = toml::to_string_pretty(&redacted)
            .map_err(|e| CliError::Config(e.to_string()))?;
        println!("{toml_str}");
    } else {
        println!("{}", serde_json::to_string(&redacted)
            .map_err(|e| CliError::Other(e.to_string()))?);
    }
    Ok(())
}

pub fn run_set(key: &str, value: &str) -> Result<(), CliError> {
    let mut config = Config::load()?;
    match key {
        "api.url" => config.api.url = Some(value.into()),
        "api.key" => config.api.key = Some(value.into()),
        "api.token" => config.api.token = Some(value.into()),
        "temporal.server" => config.temporal.server = Some(value.into()),
        "temporal.namespace" => config.temporal.namespace = Some(value.into()),
        "temporal.tls_cert" => config.temporal.tls_cert = Some(value.into()),
        _ => return Err(CliError::Config(format!("Unknown config key: {key}"))),
    }
    config.save()?;
    Ok(())
}

pub fn run_init(pretty: bool) -> Result<(), CliError> {
    // Non-interactive init: just create default config if it doesn't exist
    let path = Config::config_path();
    if path.exists() {
        if pretty {
            println!("Config already exists at {}", path.display());
        } else {
            println!("{}", serde_json::json!({"ok": true, "message": "Config already exists", "path": path.display().to_string()}));
        }
    } else {
        let config = Config::default();
        config.save()?;
        if pretty {
            println!("Config created at {}", path.display());
        } else {
            println!("{}", serde_json::json!({"ok": true, "message": "Config created", "path": path.display().to_string()}));
        }
    }
    Ok(())
}
```

**Step 2: Wire into main.rs**

Update the `Commands` enum to use subcommands for Config:

```rust
#[derive(clap::Subcommand)]
enum Commands {
    // ... other variants ...
    /// CLI configuration
    Config {
        #[command(subcommand)]
        command: commands::config_cmd::ConfigCommands,
    },
}
```

In `main()` match:

```rust
Commands::Config { command } => match command {
    commands::config_cmd::ConfigCommands::Show => commands::config_cmd::run_show(ctx.pretty),
    commands::config_cmd::ConfigCommands::Set { key, value } => commands::config_cmd::run_set(&key, &value),
    commands::config_cmd::ConfigCommands::Init => commands::config_cmd::run_init(ctx.pretty),
},
```

Note: Config commands don't need auth, so handle them before creating Context, or make Context creation lazy. The simplest approach: match Config commands before `Context::new()` in main.

**Step 3: Verify it works**

Run: `cargo run -- config init`
Expected: Creates `~/.cheerful/config.toml` or reports it exists.

Run: `cargo run -- config set api.url https://api.cheerful.com`
Expected: Writes value to config file.

Run: `cargo run -- config show --pretty`
Expected: Prints TOML with redacted secrets.

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: config show/set/init commands"
```

---

### Task 12: Auth Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/auth.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write auth command handler**

```rust
// src/commands/auth.rs
use clap::Subcommand;
use crate::config::Config;
use crate::error::CliError;

#[derive(Subcommand)]
pub enum AuthCommands {
    /// Log in with OAuth (browser) or API key
    Login {
        /// Set API key directly instead of OAuth flow
        #[arg(long)]
        api_key: Option<String>,
    },
    /// Log out and clear credentials
    Logout,
    /// Show current authenticated user
    Whoami,
}

pub fn run_login(api_key: Option<String>, pretty: bool) -> Result<(), CliError> {
    if let Some(key) = api_key {
        let mut config = Config::load()?;
        config.api.key = Some(key);
        config.save()?;
        crate::output::print_success("API key stored", pretty);
        Ok(())
    } else {
        // OAuth flow - placeholder for now
        Err(CliError::Other("OAuth browser flow not yet implemented. Use --api-key instead.".into()))
    }
}

pub fn run_logout(pretty: bool) -> Result<(), CliError> {
    let mut config = Config::load()?;
    config.api.key = None;
    config.api.token = None;
    config.save()?;
    crate::output::print_success("Logged out, credentials cleared", pretty);
    Ok(())
}

pub async fn run_whoami(pretty: bool) -> Result<(), CliError> {
    let config = Config::load_with_env()?;
    let api = crate::api::ApiClient::from_config(&config, 30)?;
    let user: serde_json::Value = api.get("/user/settings").await?;
    crate::output::print_json(&user, pretty);
    Ok(())
}
```

**Step 2: Add to commands/mod.rs**

```rust
pub mod auth;
pub mod config_cmd;
```

**Step 3: Wire into main.rs**

Add `Auth` variant with subcommand to `Commands` enum, and handle in `match`.

**Step 4: Test login --api-key flow**

Run: `cargo run -- auth login --api-key ck_test_123`
Expected: Prints success message, key stored in config.

Run: `cargo run -- config show --pretty`
Expected: Shows `key = "ck_...123"`.

Run: `cargo run -- auth logout`
Expected: Clears credentials.

**Step 5: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: auth login/logout/whoami commands"
```

---

### Task 13: Campaigns Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/campaigns.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write campaigns command handler**

```rust
// src/commands/campaigns.rs
use clap::Subcommand;
use crate::context::Context;
use crate::error::CliError;
use crate::models::campaign::{Campaign, CampaignRow};
use crate::output;

#[derive(Subcommand)]
pub enum CampaignCommands {
    /// List all campaigns
    List,
    /// Get campaign details
    Get { id: String },
    /// Create a new campaign
    Create {
        #[arg(long)]
        name: String,
        #[arg(long, value_name = "TYPE")]
        r#type: Option<String>,
        #[arg(long)]
        from_json: Option<String>,
    },
    /// Update campaign metadata
    Update {
        id: String,
        #[arg(long)]
        name: Option<String>,
        #[arg(long)]
        status: Option<String>,
    },
    /// Delete a campaign
    Delete { id: String },
    /// Launch a campaign
    Launch { id: String },
    /// Get campaign outbox status
    Status { id: String },
    /// Get available merge tags
    MergeTags { id: String },
    /// Generate AI client summary
    Summary { id: String },
}

pub async fn run(ctx: &Context, cmd: CampaignCommands) -> Result<(), CliError> {
    match cmd {
        CampaignCommands::List => {
            let campaigns: Vec<Campaign> = ctx.api.get("/campaigns/").await?;
            if ctx.pretty {
                let rows: Vec<CampaignRow> = campaigns.iter().map(CampaignRow::from).collect();
                output::print_list(&rows, true);
            } else {
                println!("{}", serde_json::to_string(&campaigns).unwrap());
            }
        }
        CampaignCommands::Get { id } => {
            let campaign: Campaign = ctx.api.get(&format!("/campaigns/{id}")).await?;
            if ctx.pretty {
                println!("{}", serde_json::to_string_pretty(&campaign).unwrap());
            } else {
                println!("{}", serde_json::to_string(&campaign).unwrap());
            }
        }
        CampaignCommands::Create { name, r#type, from_json } => {
            let body = if let Some(json_str) = from_json {
                serde_json::from_str(&json_str)
                    .map_err(|e| CliError::Other(format!("Invalid JSON: {e}")))?
            } else {
                let mut map = serde_json::Map::new();
                map.insert("name".into(), serde_json::Value::String(name));
                if let Some(t) = r#type {
                    map.insert("campaign_type".into(), serde_json::Value::String(t));
                }
                serde_json::Value::Object(map)
            };
            let campaign: Campaign = ctx.api.post("/campaigns/", body).await?;
            if ctx.pretty {
                println!("Campaign created: {} ({})", campaign.name, campaign.id);
            } else {
                println!("{}", serde_json::to_string(&campaign).unwrap());
            }
        }
        CampaignCommands::Update { id, name, status } => {
            let mut map = serde_json::Map::new();
            if let Some(n) = name { map.insert("name".into(), n.into()); }
            if let Some(s) = status { map.insert("status".into(), s.into()); }
            let campaign: Campaign = ctx.api.put(
                &format!("/campaigns/{id}"),
                serde_json::Value::Object(map),
            ).await?;
            output::print_success(&format!("Campaign {} updated", campaign.id), ctx.pretty);
        }
        CampaignCommands::Delete { id } => {
            ctx.api.delete(&format!("/campaigns/{id}")).await?;
            output::print_success(&format!("Campaign {id} deleted"), ctx.pretty);
        }
        CampaignCommands::Launch { id } => {
            let result: serde_json::Value = ctx.api.post(
                "/campaigns/launch",
                serde_json::json!({"campaign_id": id}),
            ).await?;
            output::print_json(&result, ctx.pretty);
        }
        CampaignCommands::Status { id } => {
            let result: serde_json::Value = ctx.api.get(
                &format!("/campaigns/{id}/outbox-table"),
            ).await?;
            output::print_json(&result, ctx.pretty);
        }
        CampaignCommands::MergeTags { id } => {
            let result: serde_json::Value = ctx.api.get(
                &format!("/campaigns/{id}/merge-tags"),
            ).await?;
            output::print_json(&result, ctx.pretty);
        }
        CampaignCommands::Summary { id } => {
            let result: serde_json::Value = ctx.api.post(
                &format!("/campaigns/{id}/generate-summary"),
                serde_json::json!({}),
            ).await?;
            output::print_json(&result, ctx.pretty);
        }
    }
    Ok(())
}
```

**Step 2: Wire into main.rs**

Add `Campaigns` variant with subcommand, handle in match with `commands::campaigns::run(&ctx, cmd).await`.

**Step 3: Verify compilation**

Run: `cargo build`
Expected: Compiles.

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: campaigns list/get/create/update/delete/launch/status commands"
```

---

### Task 14: Campaigns Senders and Recipients Subcommands

**Files:**
- Modify: `projects/cheerful/apps/cli/src/commands/campaigns.rs`

**Step 1: Add nested subcommands for senders and recipients**

Add to the `CampaignCommands` enum:

```rust
/// Manage campaign senders
Senders {
    #[command(subcommand)]
    command: SenderCommands,
},
/// Manage campaign recipients
Recipients {
    #[command(subcommand)]
    command: RecipientCommands,
},
```

```rust
#[derive(Subcommand)]
pub enum SenderCommands {
    /// Add a sender to campaign
    Add {
        #[arg(long)]
        campaign_id: String,
        #[arg(long)]
        gmail_account_id: Option<String>,
        #[arg(long)]
        smtp_account_id: Option<String>,
    },
    /// Remove a sender from campaign
    Remove {
        #[arg(long)]
        campaign_id: String,
        sender_id: String,
    },
}

#[derive(Subcommand)]
pub enum RecipientCommands {
    /// Add recipients from CSV
    Add {
        #[arg(long)]
        campaign_id: String,
        #[arg(long)]
        csv: String,
    },
    /// Search for recipients
    Search {
        #[arg(long)]
        campaign_id: String,
        #[arg(long)]
        query: String,
    },
    /// Approve a pending recipient
    Approve {
        #[arg(long)]
        campaign_id: String,
        recipient_id: String,
    },
    /// Remove a recipient
    Remove {
        #[arg(long)]
        campaign_id: String,
        recipient_id: String,
    },
}
```

**Step 2: Implement handlers in the `run` function**

For senders: POST/DELETE to `/campaigns/{campaign_id}/senders[/{sender_id}]`.
For recipients: POST (multipart for CSV), PATCH for approve, DELETE for remove.

Note: CSV upload requires `reqwest::multipart`. Add handling for file reads with `tokio::fs::read`.

**Step 3: Verify compilation**

Run: `cargo build`
Expected: Compiles.

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: campaign senders and recipients subcommands"
```

---

### Task 15: Creators Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/creators.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write creators command handler**

```rust
// src/commands/creators.rs
use clap::Subcommand;
use crate::context::Context;
use crate::error::CliError;
use crate::models::creator::{Creator, CreatorRow, CampaignCreator, CampaignCreatorRow};
use crate::output;

#[derive(Subcommand)]
pub enum CreatorCommands {
    /// Search creators by keyword or similarity
    Search {
        #[arg(long)]
        keyword: Option<String>,
        #[arg(long)]
        similar: Option<String>,
        #[arg(long)]
        platform: Option<String>,
    },
    /// Enrich a creator profile
    Enrich { handle: String },
    /// Get creator profile
    Profile { handle: String },
    /// List creators in a campaign
    List {
        #[arg(long)]
        campaign: String,
    },
    /// Get a specific campaign creator
    Get {
        creator_id: String,
        #[arg(long)]
        campaign: String,
    },
}

pub async fn run(ctx: &Context, cmd: CreatorCommands) -> Result<(), CliError> {
    match cmd {
        CreatorCommands::Search { keyword, similar, platform } => {
            if let Some(handle) = similar {
                let body = serde_json::json!({"handle": handle, "platform": platform.unwrap_or("instagram".into())});
                let result: serde_json::Value = ctx.api.post("/v1/creator-search/similar", body).await?;
                output::print_json(&result, ctx.pretty);
            } else if let Some(q) = keyword {
                let body = serde_json::json!({"query": q, "platform": platform.unwrap_or("instagram".into())});
                let result: serde_json::Value = ctx.api.post("/v1/creator-search/keyword", body).await?;
                output::print_json(&result, ctx.pretty);
            } else {
                return Err(CliError::Other("Provide --keyword or --similar".into()));
            }
        }
        CreatorCommands::Enrich { handle } => {
            let body = serde_json::json!({"handle": handle});
            let result: serde_json::Value = ctx.api.post("/v1/creator-search/enrich", body).await?;
            output::print_json(&result, ctx.pretty);
        }
        CreatorCommands::Profile { handle } => {
            let result: serde_json::Value = ctx.api.get(&format!("/v1/creators/profiles/{handle}")).await?;
            output::print_json(&result, ctx.pretty);
        }
        CreatorCommands::List { campaign } => {
            // Uses service endpoint or campaign-scoped endpoint
            let result: serde_json::Value = ctx.api.get(&format!("/campaigns/{campaign}/recipients")).await?;
            output::print_json(&result, ctx.pretty);
        }
        CreatorCommands::Get { creator_id, campaign } => {
            let result: serde_json::Value = ctx.api.get(
                &format!("/campaigns/{campaign}/recipients/{creator_id}"),
            ).await?;
            output::print_json(&result, ctx.pretty);
        }
    }
    Ok(())
}
```

**Step 2: Wire into main.rs and commands/mod.rs**

**Step 3: Verify compilation**

Run: `cargo build`

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: creators search/enrich/profile/list/get commands"
```

---

### Task 16: Threads Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/threads.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write threads command handler**

Subcommands: `List`, `Get { thread_id }`, `Search { keyword, similar }`, `Hide { thread_id }`, `Unhide { thread_id }`.

API mappings:
- List: `GET /threads/`
- Get: `GET /threads/{thread_id}`
- Search keyword: Uses existing search endpoint or query param on `/threads/`
- Search similar: Uses RAG endpoint (service route)
- Hide: `PATCH /threads/{thread_id}/hide`
- Unhide: `PATCH /threads/{thread_id}/unhide`

Follow the same pattern as campaigns.rs.

**Step 2: Wire in, verify, commit**

```bash
git commit -m "cheerful-cli: threads list/get/search/hide/unhide commands"
```

---

### Task 17: Drafts Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/drafts.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write drafts command handler**

Subcommands: `Get { thread_id }`, `Create { thread_id, subject, body }`, `Update { thread_id, subject?, body? }`, `BulkEdit { campaign, instruction }`, `Generate { thread_id }`.

API mappings:
- Get: `GET /threads/{thread_id}/draft`
- Create: `POST /threads/{thread_id}/draft`
- Update: `PUT /threads/{thread_id}/draft`
- BulkEdit: `POST /bulk-draft-edit`
- Generate: This is a Temporal trigger — will be wired in Task 24 when Temporal client is ready. For now, return "Temporal client not yet available" error.

**Step 2: Wire in, verify, commit**

```bash
git commit -m "cheerful-cli: drafts get/create/update/bulk-edit commands"
```

---

### Task 18: Email Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/email.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write email command handler**

Subcommands: `Send { thread, body, subject? }`, `Schedule { thread, body, at, subject? }`, plus nested `Scheduled { List | Cancel { id } | Reschedule { id, at } }`.

API mappings:
- Send: `POST /emails/send`
- Schedule: `POST /emails/scheduled`
- Scheduled list: `GET /emails/scheduled`
- Scheduled cancel: `DELETE /emails/scheduled/{id}`
- Scheduled reschedule: `PATCH /emails/scheduled/{id}/reschedule`

**Step 2: Wire in, verify, commit**

```bash
git commit -m "cheerful-cli: email send/schedule commands"
```

---

### Task 19: Workflows Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/workflows.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write workflows command handler**

Subcommands: `List { campaign }`, `Get { id }`, `Create { campaign, name, instructions }`, `Update { id, name?, instructions?, enabled? }`, `Delete { id }`, `Executions { id }`.

API mappings:
- List: `GET /v1/campaigns/{campaign_id}/workflows`
- Get: `GET /v1/campaigns/{campaign_id}/workflows/{id}`
- Create: `POST /v1/campaigns/{campaign_id}/workflows`
- Update: `PATCH /v1/campaigns/{campaign_id}/workflows/{id}`
- Delete: `DELETE /v1/campaigns/{campaign_id}/workflows/{id}`
- Executions: `GET /v1/campaigns/{campaign_id}/workflows/{id}/executions`

**Step 2: Wire in, verify, commit**

```bash
git commit -m "cheerful-cli: workflows list/get/create/update/delete/executions commands"
```

---

### Task 20: Analytics Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/analytics.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write analytics command handler**

Single subcommand: `Dashboard { campaign?, time_range? }`.

API mapping: `GET /dashboard/analytics?campaign_id={}&time_range={}`.

Use the `DashboardAnalytics` model for pretty display, raw JSON for default output.

**Step 2: Wire in, verify, commit**

```bash
git commit -m "cheerful-cli: analytics dashboard command"
```

---

### Task 21: Integrations Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/integrations.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write integrations command handler**

Nested subcommands:

```rust
#[derive(Subcommand)]
pub enum IntegrationCommands {
    /// List connected accounts (Gmail + SMTP)
    Accounts { /* no nested, just list */ },
    /// SMTP account management
    Smtp {
        #[command(subcommand)]
        command: SmtpCommands,
    },
    /// Email signature management
    Signatures {
        #[command(subcommand)]
        command: SignatureCommands,
    },
    /// Shopify integration
    Shopify {
        #[command(subcommand)]
        command: ShopifyCommands,
    },
    /// Instantly integration
    Instantly {
        #[command(subcommand)]
        command: InstantlyCommands,
    },
}
```

API mappings:
- Accounts: `GET /user/connected-accounts`
- SMTP: `/v1/smtp-accounts/` CRUD
- Signatures: `/email-signatures/` CRUD
- Shopify: `/v1/shopify/shops`
- Instantly: `/v1/integrations/instantly/{status|connect|disconnect|test}`

**Step 2: Wire in, verify, commit**

```bash
git commit -m "cheerful-cli: integrations accounts/smtp/signatures/shopify/instantly commands"
```

---

### Task 22: Lists Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/lists.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write lists command handler**

Subcommands: `List`, `Get { id }`, `Create { title }`, `Update { id, title }`, `Delete { id }`, `Duplicate { id }`, plus nested `Creators { list of subcommands }`.

API mappings:
- CRUD: `/v1/lists/` endpoints
- Creators: `/v1/lists/{id}/creators` endpoints
- Import: `/v1/lists/{id}/creators/bulk-import` (multipart CSV)

**Step 2: Wire in, verify, commit**

```bash
git commit -m "cheerful-cli: lists CRUD and creator management commands"
```

---

## Phase 4: Temporal Client

### Task 23: Temporal Client Module

**Files:**
- Create: `projects/cheerful/apps/cli/src/temporal.rs`
- Modify: `projects/cheerful/apps/cli/Cargo.toml`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Add Temporal SDK dependency**

Note: The Rust Temporal SDK is `temporal-sdk` or `temporal-client`. Check crates.io for the latest. If the official SDK is not mature enough, use gRPC directly via `tonic` against Temporal's gRPC API.

Add to Cargo.toml:

```toml
# Option A: Official SDK (if available and stable)
temporal-client = "0.1"

# Option B: Direct gRPC (fallback)
tonic = { version = "0.12", features = ["tls"] }
prost = "0.13"
```

**Step 2: Write temporal client wrapper**

```rust
// src/temporal.rs
use crate::config::Config;
use crate::error::CliError;

// Workflow name -> Temporal workflow type mapping
pub fn resolve_workflow_type(name: &str) -> Result<&'static str, CliError> {
    match name {
        "poll-history" => Ok("AllPollHistoryWorkflow"),
        "smtp-sync" => Ok("AllSmtpInboxSyncWorkflow"),
        "thread-sync" => Ok("ThreadSyncWorkflow"),
        "thread-process" => Ok("ThreadProcessingCoordinatorWorkflow"),
        "draft-generate" => Ok("ThreadResponseDraftWorkflow"),
        "draft-generate-corrections" => Ok("ThreadResponseDraftWithCorrectionsWorkflow"),
        "draft-follow-up" => Ok("TriggerThreadFollowUpDraftWorkflow"),
        "draft-bulk-edit" => Ok("BulkDraftEditWorkflow"),
        "send-outbox" => Ok("SendCampaignOutboxWorkflow"),
        "send-follow-ups" => Ok("SendCampaignFollowUpsWorkflow"),
        "send-dispatches" => Ok("SendEmailDispatchesWorkflow"),
        "send-post-optin" => Ok("SendPostOptInFollowUpsWorkflow"),
        "enrich-campaign" => Ok("EnrichForCampaignWorkflow"),
        "campaign-discovery" => Ok("CampaignDiscoveryWorkflow"),
        "campaign-discovery-scheduler" => Ok("CampaignDiscoverySchedulerWorkflow"),
        "post-tracking" => Ok("PostTrackingWorkflow"),
        "post-tracking-scheduler" => Ok("PostTrackingSchedulerWorkflow"),
        "slack-digest" => Ok("SlackOrderDigestWorkflow"),
        "sync-sheet-creators" => Ok("SyncSheetCreatorsWorkflow"),
        "thread-extract-metrics" => Ok("ThreadExtractMetricsWorkflow"),
        "thread-extract-attachments" => Ok("ThreadAttachmentExtractWorkflow"),
        "thread-associate-campaign" => Ok("ThreadAssociateToCampaignWorkflow"),
        _ => Err(CliError::Temporal(format!("Unknown workflow: {name}. Use `cheerful temporal list` to see available workflows."))),
    }
}

// The actual Temporal client implementation depends on SDK availability.
// This will be fleshed out based on what SDK/gRPC approach works best.
// Placeholder struct for now.
pub struct TemporalClient {
    pub server: String,
    pub namespace: String,
}

impl TemporalClient {
    pub fn from_config(config: &Config) -> Self {
        Self {
            server: config.temporal_server(),
            namespace: config.temporal_namespace(),
        }
    }
}
```

**Step 3: Run tests, commit**

```bash
git commit -m "cheerful-cli: temporal client module with workflow name mapping"
```

---

### Task 24: Temporal Commands

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/temporal_cmd.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Write temporal command handler**

```rust
// src/commands/temporal_cmd.rs
use clap::Subcommand;
use crate::context::Context;
use crate::error::CliError;
use crate::temporal;

#[derive(Subcommand)]
pub enum TemporalCommands {
    /// Trigger a workflow
    Trigger {
        /// Workflow name (e.g., poll-history, draft-generate)
        name: String,
        /// JSON params for the workflow
        #[arg(long, default_value = "{}")]
        params: String,
        /// Custom workflow ID (auto-generated if omitted)
        #[arg(long)]
        id: Option<String>,
    },
    /// Get workflow execution status
    Status {
        workflow_id: String,
        /// Poll until completion
        #[arg(long)]
        watch: bool,
    },
    /// List workflow executions
    List {
        #[arg(long)]
        running: bool,
        #[arg(long)]
        campaign: Option<String>,
        #[arg(long)]
        user: Option<String>,
        #[arg(long, value_name = "TYPE")]
        r#type: Option<String>,
    },
    /// Send signal to a running workflow
    Signal {
        workflow_id: String,
        signal_name: String,
        #[arg(long, default_value = "{}")]
        data: String,
    },
    /// Cancel a running workflow
    Cancel { workflow_id: String },
    /// View workflow event history
    History { workflow_id: String },
}

pub async fn run(ctx: &Context, cmd: TemporalCommands) -> Result<(), CliError> {
    let _temporal = temporal::TemporalClient::from_config(&ctx.config);

    match cmd {
        TemporalCommands::Trigger { name, params, id } => {
            let workflow_type = temporal::resolve_workflow_type(&name)?;
            let _params: serde_json::Value = serde_json::from_str(&params)
                .map_err(|e| CliError::Other(format!("Invalid params JSON: {e}")))?;

            // TODO: Call temporal client to start workflow
            // For now, print what would be triggered
            let result = serde_json::json!({
                "workflow_type": workflow_type,
                "workflow_id": id.unwrap_or_else(|| format!("{name}-{}", uuid_stub())),
                "status": "started",
                "note": "Temporal client integration pending SDK selection"
            });
            crate::output::print_json(&result, ctx.pretty);
        }
        TemporalCommands::Status { workflow_id, watch } => {
            // TODO: DescribeWorkflowExecution
            let result = serde_json::json!({
                "workflow_id": workflow_id,
                "watch": watch,
                "note": "Temporal client integration pending"
            });
            crate::output::print_json(&result, ctx.pretty);
        }
        TemporalCommands::List { running, campaign, user, r#type } => {
            // TODO: ListWorkflowExecutions with search attributes
            let result = serde_json::json!({
                "filters": {
                    "running": running,
                    "campaign": campaign,
                    "user": user,
                    "type": r#type,
                },
                "note": "Temporal client integration pending"
            });
            crate::output::print_json(&result, ctx.pretty);
        }
        TemporalCommands::Signal { workflow_id, signal_name, data } => {
            let _data: serde_json::Value = serde_json::from_str(&data)
                .map_err(|e| CliError::Other(format!("Invalid signal data JSON: {e}")))?;
            // TODO: SignalWorkflowExecution
            crate::output::print_success(
                &format!("Signal '{signal_name}' sent to {workflow_id}"),
                ctx.pretty,
            );
        }
        TemporalCommands::Cancel { workflow_id } => {
            // TODO: CancelWorkflowExecution
            crate::output::print_success(
                &format!("Workflow {workflow_id} cancelled"),
                ctx.pretty,
            );
        }
        TemporalCommands::History { workflow_id } => {
            // TODO: GetWorkflowExecutionHistory
            let result = serde_json::json!({
                "workflow_id": workflow_id,
                "note": "Temporal client integration pending"
            });
            crate::output::print_json(&result, ctx.pretty);
        }
    }
    Ok(())
}

fn uuid_stub() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    format!("{secs:x}")
}
```

**Step 2: Wire in, verify, commit**

```bash
git commit -m "cheerful-cli: temporal trigger/status/list/signal/cancel/history commands (stubs)"
```

---

### Task 25: Temporal gRPC Client Implementation

**Files:**
- Modify: `projects/cheerful/apps/cli/src/temporal.rs`
- Modify: `projects/cheerful/apps/cli/Cargo.toml`

**Step 1: Research available Rust Temporal SDKs**

Check crates.io for `temporal-client`, `temporal-sdk-core`, or `temporalio`. If no stable high-level client exists, use `tonic` to call Temporal's gRPC API directly.

The Temporal gRPC service definition is at `temporal.api.workflowservice.v1.WorkflowService`. Key RPCs:
- `StartWorkflowExecution`
- `DescribeWorkflowExecution`
- `ListWorkflowExecutions`
- `SignalWorkflowExecution`
- `RequestCancelWorkflowExecution`
- `GetWorkflowExecutionHistory`

**Step 2: Implement using tonic + proto definitions**

Generate Rust code from Temporal proto files, or use a pre-built crate. Implement the 6 RPCs needed.

**Step 3: Replace stubs in temporal_cmd.rs**

Wire real gRPC calls into each command handler.

**Step 4: Test against local Temporal**

Run: `cargo run -- temporal trigger poll-history --params '{"max_concurrent_accounts": 1}'`
Expected: Starts workflow, returns workflow ID.

Run: `cargo run -- temporal list --running`
Expected: Lists running workflows.

**Step 5: Commit**

```bash
git commit -m "cheerful-cli: temporal gRPC client implementation"
```

---

### Task 26: Wire Temporal into Hybrid Commands

**Files:**
- Modify: `projects/cheerful/apps/cli/src/commands/campaigns.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/drafts.rs`

**Step 1: Wire `campaigns launch` to also trigger Temporal**

After the API call to `/campaigns/launch`, start `SendCampaignOutboxWorkflow` via Temporal and include the workflow ID in the response.

**Step 2: Wire `drafts generate` to trigger Temporal**

Replace the placeholder with a real `ThreadResponseDraftWorkflow` trigger. Return the workflow ID so the user can poll with `cheerful temporal status`.

**Step 3: Test, commit**

```bash
git commit -m "cheerful-cli: wire Temporal into campaign launch and draft generate"
```

---

## Phase 5: Auth & Polish

### Task 27: OAuth Browser Flow

**Files:**
- Modify: `projects/cheerful/apps/cli/src/commands/auth.rs`
- Modify: `projects/cheerful/apps/cli/Cargo.toml`

**Step 1: Add dependencies**

```toml
open = "5"           # Open URLs in browser
tokio = { version = "1", features = ["full", "net"] }
```

**Step 2: Implement OAuth callback server**

In `run_login` when no `--api-key` is provided:

1. Generate a random state parameter
2. Build Supabase OAuth URL with redirect to `http://localhost:9876/callback`
3. Open URL in browser via `open::that()`
4. Start local HTTP server on port 9876 (using `tokio::net::TcpListener` + minimal HTTP parsing)
5. Wait for callback with auth code
6. Exchange code for JWT + refresh token
7. Store in config

**Step 3: Test the flow manually**

Run: `cargo run -- auth login`
Expected: Opens browser, after auth, stores token and prints success.

**Step 4: Commit**

```bash
git commit -m "cheerful-cli: OAuth browser login flow"
```

---

### Task 28: Token Auto-Refresh

**Files:**
- Modify: `projects/cheerful/apps/cli/src/api.rs`

**Step 1: Add retry-on-401 logic**

In `ApiClient::request()`, if response is 401 and a refresh token is available:
1. Call Supabase token refresh endpoint
2. Update stored token in config
3. Retry the original request once

**Step 2: Test, commit**

```bash
git commit -m "cheerful-cli: auto-refresh JWT on 401"
```

---

### Task 29: Multipart File Upload Support

**Files:**
- Modify: `projects/cheerful/apps/cli/src/api.rs`

**Step 1: Add multipart upload method**

```rust
pub async fn post_multipart(
    &self,
    path: &str,
    file_path: &str,
    field_name: &str,
) -> Result<serde_json::Value, CliError> {
    let url = format!("{}{}", self.base_url, path);
    let (header_name, header_value) = self.auth_header()?;

    let file_bytes = tokio::fs::read(file_path).await
        .map_err(|e| CliError::Other(format!("Failed to read file: {e}")))?;
    let file_name = std::path::Path::new(file_path)
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or("upload.csv".into());

    let part = reqwest::multipart::Part::bytes(file_bytes)
        .file_name(file_name)
        .mime_str("text/csv")
        .map_err(|e| CliError::Other(e.to_string()))?;
    let form = reqwest::multipart::Form::new().part(field_name.to_string(), part);

    let resp = self.client.post(&url)
        .header(&header_name, &header_value)
        .multipart(form)
        .send()
        .await?;

    if !resp.status().is_success() {
        let status = resp.status().as_u16();
        let body: serde_json::Value = resp.json().await.unwrap_or_default();
        return Err(CliError::Api {
            status,
            error: "upload_error".into(),
            message: body["detail"].as_str().unwrap_or("Upload failed").into(),
        });
    }

    resp.json().await.map_err(|e| CliError::Other(e.to_string()))
}
```

**Step 2: Add `multipart` feature to reqwest in Cargo.toml**

```toml
reqwest = { version = "0.12", features = ["json", "rustls-tls", "multipart"], default-features = false }
```

**Step 3: Wire into campaigns recipients add and lists creators import**

**Step 4: Commit**

```bash
git commit -m "cheerful-cli: multipart file upload for CSV imports"
```

---

### Task 30: CLI Integration Tests

**Files:**
- Create: `projects/cheerful/apps/cli/tests/cli_test.rs`

**Step 1: Write integration tests using assert_cmd**

```rust
// tests/cli_test.rs
use assert_cmd::Command;
use predicates::prelude::*;

#[test]
fn test_help() {
    Command::cargo_bin("cheerful")
        .unwrap()
        .arg("--help")
        .assert()
        .success()
        .stdout(predicate::str::contains("Cheerful platform CLI"))
        .stdout(predicate::str::contains("campaigns"))
        .stdout(predicate::str::contains("temporal"));
}

#[test]
fn test_version() {
    Command::cargo_bin("cheerful")
        .unwrap()
        .arg("--version")
        .assert()
        .success()
        .stdout(predicate::str::contains("cheerful"));
}

#[test]
fn test_config_init() {
    let tmp = tempfile::tempdir().unwrap();
    Command::cargo_bin("cheerful")
        .unwrap()
        .env("HOME", tmp.path())
        .args(["config", "init"])
        .assert()
        .success();
}

#[test]
fn test_no_auth_error() {
    let tmp = tempfile::tempdir().unwrap();
    Command::cargo_bin("cheerful")
        .unwrap()
        .env("HOME", tmp.path())
        .args(["campaigns", "list"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("No API key or token"));
}

#[test]
fn test_unknown_command() {
    Command::cargo_bin("cheerful")
        .unwrap()
        .arg("nonexistent")
        .assert()
        .failure();
}

#[test]
fn test_temporal_unknown_workflow() {
    let tmp = tempfile::tempdir().unwrap();
    Command::cargo_bin("cheerful")
        .unwrap()
        .env("HOME", tmp.path())
        .env("CHEERFUL_API_KEY", "test")
        .args(["temporal", "trigger", "nonexistent-workflow"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("Unknown workflow"));
}
```

**Step 2: Run tests**

Run: `cargo test --test cli_test`
Expected: All pass.

**Step 3: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: CLI integration tests"
```

---

### Task 31: Cross-Compilation & Release Build

**Files:**
- Create: `projects/cheerful/apps/cli/.cargo/config.toml`
- Modify: `projects/cheerful/apps/cli/Cargo.toml`

**Step 1: Add release profile**

```toml
# Cargo.toml
[profile.release]
lto = true
codegen-units = 1
strip = true
```

**Step 2: Verify release build**

Run: `cargo build --release`
Expected: Produces optimized binary at `target/release/cheerful`.

Run: `ls -lh target/release/cheerful`
Expected: Single binary, reasonably small (< 20MB).

**Step 3: Test the release binary**

Run: `./target/release/cheerful --help`
Expected: Works identically to debug build.

**Step 4: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: release profile with LTO and stripping"
```

---

### Task 32: Final Wiring & Main.rs Cleanup

**Files:**
- Modify: `projects/cheerful/apps/cli/src/main.rs`

**Step 1: Ensure all 12 command groups are wired**

The final `main.rs` should have:
- All `Commands` variants with their subcommand types
- Lazy context creation (Config/Auth commands don't need API client)
- Clean error handling with exit codes

```rust
#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    // Commands that don't need API auth
    let result = match &cli.command {
        Commands::Config { command } => {
            // handle config commands directly
            return handle_config(command, cli.pretty);
        }
        Commands::Auth { command } => {
            return handle_auth(command, cli.pretty).await;
        }
        _ => {
            // All other commands need context
            let ctx = match Context::new(cli.pretty, cli.timeout) {
                Ok(ctx) => ctx,
                Err(e) => e.print_and_exit(cli.pretty),
            };
            match cli.command {
                Commands::Campaigns { command } => commands::campaigns::run(&ctx, command).await,
                Commands::Creators { command } => commands::creators::run(&ctx, command).await,
                Commands::Threads { command } => commands::threads::run(&ctx, command).await,
                Commands::Drafts { command } => commands::drafts::run(&ctx, command).await,
                Commands::Email { command } => commands::email::run(&ctx, command).await,
                Commands::Workflows { command } => commands::workflows::run(&ctx, command).await,
                Commands::Analytics { command } => commands::analytics::run(&ctx, command).await,
                Commands::Integrations { command } => commands::integrations::run(&ctx, command).await,
                Commands::Lists { command } => commands::lists::run(&ctx, command).await,
                Commands::Temporal { command } => commands::temporal_cmd::run(&ctx, command).await,
                _ => unreachable!(),
            }
        }
    };

    if let Err(e) = result {
        e.print_and_exit(cli.pretty);
    }
}
```

**Step 2: Run full test suite**

Run: `cargo test`
Expected: All unit + integration tests pass.

Run: `cargo build --release`
Expected: Compiles clean.

**Step 3: Commit**

```bash
git add -A projects/cheerful/apps/cli/
git commit -m "cheerful-cli: final wiring, all 12 command groups connected"
```

---

## Summary

| Phase | Tasks | What It Delivers |
|-------|-------|-----------------|
| 1: Foundation | 1-6 | Cargo project, errors, config, output, API client, context |
| 2: Models | 7-10 | All domain structs with table formatting |
| 3: Commands | 11-22 | All 12 command groups (config, auth, campaigns, creators, threads, drafts, email, workflows, analytics, integrations, lists, temporal) |
| 4: Temporal | 23-26 | Temporal client, gRPC implementation, hybrid command wiring |
| 5: Polish | 27-32 | OAuth flow, token refresh, multipart uploads, integration tests, release build |

**Total: 32 tasks.** Each task produces a working, testable increment with a commit.

**Key files at completion:**

```
projects/cheerful/apps/cli/
├── Cargo.toml
├── src/
│   ├── main.rs
│   ├── api.rs
│   ├── config.rs
│   ├── context.rs
│   ├── error.rs
│   ├── output.rs
│   ├── temporal.rs
│   ├── models/
│   │   ├── mod.rs
│   │   ├── analytics.rs
│   │   ├── campaign.rs
│   │   ├── creator.rs
│   │   ├── draft.rs
│   │   ├── email.rs
│   │   ├── integration.rs
│   │   ├── list.rs
│   │   ├── thread.rs
│   │   └── workflow.rs
│   └── commands/
│       ├── mod.rs
│       ├── analytics.rs
│       ├── auth.rs
│       ├── campaigns.rs
│       ├── config_cmd.rs
│       ├── creators.rs
│       ├── drafts.rs
│       ├── email.rs
│       ├── integrations.rs
│       ├── lists.rs
│       ├── temporal_cmd.rs
│       ├── threads.rs
│       └── workflows.rs
└── tests/
    └── cli_test.rs
```
