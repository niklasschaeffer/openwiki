# OpenWiki

OpenWiki is a CLI that writes and maintains documentation for your codebase, built specifically for agents.

![OpenWiki](https://raw.githubusercontent.com/langchain-ai/openwiki/main/static/openwiki.png)

## Install

```sh
npm install -g openwiki
```

## Quick Start

Initialize OpenWiki, configure your model and API key, then generate documentation

```sh
openwiki --init
```

Then to ensure your documentation stays up-to-date, add the GitHub action to your repository to automatically open a PR once a day with documentation updates: [openwiki-update.yml](./examples/openwiki-update.yml)

Copy the contents of that file into `.github/workflows/openwiki-update.yml` in your repository.

## Usage

Start the interactive CLI:

```sh
openwiki
```

Start OpenWiki with an initial request:

```sh
openwiki "Please generate documentation for this repository"
```

Run a single command and exit:

```sh
openwiki -p "Summarize what you can do"
```

Initialize OpenWiki:

```sh
openwiki --init
```

Update existing documentation:

```sh
openwiki --update
```

Show help:

```sh
openwiki --help
```

`openwiki` creates initial documentation in `openwiki/` when no wiki exists. If `openwiki/` already exists, it refreshes that documentation from repository changes. By default, the CLI stays open after each run so you can send follow-up messages. Use `-p` or `--print` for a one-shot non-interactive run that prints the final assistant output.

`openwiki` will automatically append prompting to your `AGENTS.md` and/or `CLAUDE.md` files to instruct your coding agent to reference it when searching for context. If the file does not already exist in your repository, OpenWiki will create it for you.

On the first interactive run, OpenWiki will have you configure your inference provider, API key, and LLM. You will also be able to set a LangSmith API key to trace your OpenWiki runs to a LangSmith tracing project named "openwiki" (optional).

These configuration options and secrets will be saved to `~/.openwiki/.env` on your local machine.

## Customizing

OpenWiki supports OpenRouter, Fireworks, Baseten, OpenAI, an OpenAI-compatible provider, Anthropic, and Ollama out of the box. By default, there are a few models pre-defined (GLM 5.2, Kimi K2.6, Sonnet 5, Llama 3.2, etc) but for each inference provider, OpenWiki will allow you to specify your own custom model ID.

### Alternative base URLs

To route the Anthropic provider at an alternative, Anthropic-compatible endpoint
(for example a self-hosted or proxied gateway) instead of the default API, set
`ANTHROPIC_BASE_URL` alongside `ANTHROPIC_API_KEY`:

```bash
OPENWIKI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key
ANTHROPIC_BASE_URL=https://your-gateway.example.com/anthropic
```

### OpenAI-compatible endpoints

The `openai-compatible` provider targets any OpenAI-compatible chat-completions
endpoint via a required base URL. This can be used for OpenAI-compatible LLM
endpoints like those exposed by a LiteLLM gateway when it is used as a gateway —
letting you reach whatever upstream providers the gateway fronts through a single
OpenAI-shaped API. Set the model ID to whatever name the gateway exposes:

```bash
OPENWIKI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_API_KEY=your-gateway-key
OPENAI_COMPATIBLE_BASE_URL=https://your-gateway.example.com/v1
OPENWIKI_MODEL_ID=your-gateway-model-name
```

Base URLs (and all credentials) can be set in your environment or stored in `~/.openwiki/.env`.

### Ollama

The `ollama` provider talks to [Ollama](https://ollama.com) via its native
`/api/chat` endpoint. By default it targets **Ollama Cloud** (base URL
`https://ollama.com`, which `ChatOllama` resolves to `https://ollama.com/api/chat`),
which requires an API key:

```bash
OPENWIKI_PROVIDER=ollama
OLLAMA_API_KEY=your-ollama-cloud-key
OPENWIKI_MODEL_ID=llama3.2
```

To point at a self-hosted or local Ollama server instead, override the base URL
with `OLLAMA_BASE_URL` (the value should be the host root, without `/api/chat`):

```bash
# Local Ollama running on the default port
OPENWIKI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_API_KEY=local
OPENWIKI_MODEL_ID=qwen2.5-coder
```

An `OLLAMA_API_KEY` value is always required by the CLI's credential checks;
use any non-empty string for a local server that does not authenticate. Use any
model name your Ollama instance exposes (e.g. `llama3.2`, `qwen2.5-coder`,
`deepseek-coder-v2`). For a local server, pull the model first with
`ollama pull <model>` so it is available.

If there's an inference provider or model you'd like to see added, please open a PR!
