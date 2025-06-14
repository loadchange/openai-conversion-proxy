# ⚠️ Project Migration Notice

Thank you for your interest in [**openai-conversion-proxy**](https://github.com/loadchange/openai-conversion-proxy)! Here’s an important update:

While this repository served well, I’ve created a more powerful successor — [**apex-ai-proxy**](https://github.com/loadchange/apex-ai-proxy)! 🎉

---

`openai-conversion-proxy` was a project I put a lot of effort into, stable and reliable, and it’s had its time to shine.
As needs grew, I developed `apex-ai-proxy`, with more features and greater flexibility. There’s some overlap between the two, but going forward all updates and maintenance will focus on `apex-ai-proxy`.

**Please note:**
- `apex-ai-proxy` offers more features, better architecture, and an improved experience;
- This repository is now frozen — no further updates or maintenance will be done here;
- Please prioritize and follow [`apex-ai-proxy`](https://github.com/loadchange/apex-ai-proxy) for the latest features and fixes;
- Thanks very much if you’ve contributed or provided feedback on this repo!

In short, `openai-conversion-proxy` will rest quietly as an old friend, while `apex-ai-proxy` continues to shine bright. 💡

---

# OpenAI Conversion Proxy

The OpenAI Conversion Proxy is an efficient proxy server designed to provide users access to a variety of different AI model services through a unified interface. Currently, it supports services including but not limited to GROQ, Azure, OpenAI, Coze, and DeepInfra.

## Main Features

- **Request Forwarding**: Forwards user requests to the specified AI model service.
- **Response Management**: Processes and returns the responses from AI services to the user.
- **Data Format Handling**: Ensures correct data formats for requests and responses.

## Quick Start

### Setting Up the Development Environment

1. Clone the repository locally:
   ```bash
   git clone [Repository URL]
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Sending Requests

Send HTTP requests to `http://localhost:8787`. Ensure that your request headers contain a valid authorization key.

## Deployment

This project is deployed using the Cloudflare Workers environment, ensuring high performance and low latency globally. Use the following command to deploy the project:

```bash
npm run deploy
```

## Configuration

Configuration information is stored in the `wrangler.toml` file, with key configurations including:

- **name**: The name of the project.
- **main**: The entry file.
- **compatibility_date**: Compatibility date for Cloudflare Workers.

### Environment Variables

The following environment variables are used at runtime, defined in the `[vars]` section:

- `CUSTOM_KEY`: A custom key used to validate request authorization.
- `GOOGLE_API_KEY`: API key for accessing Google services.
- `GOOGLE_CSE_ID`: ID for Google Custom Search Engine.

### Azure Configuration Details

#### API Key Configuration

`AZURE_API_KEYS` configuration array defines the API keys for different resources and model access permissions. Each entry contains the resource name (`resourceName`), corresponding token, and a list of accessible models (`models`). If `default` is set to `true`, it indicates that this resource will provide a default route for requests that do not specify a model explicitly.

Example:

```json
AZURE_API_KEYS = [
    { "resourceName": "us-w", "token": "xxxxxx", "default": true },
    { "resourceName": "us-e", "token": "xxxxxx", "models": [
        "dall-e-3",
        "text-embedding-3-small",
        "text-embedding-3-large"
    ] },
    { "resourceName": "us-nc", "token": "xxxxxx", "models": [
        "gpt-3.5-turbo-0125",
        "gpt-4-0125-preview"
    ] }
]
```

#### Deployment Name Configuration

`AZURE_DEPLOY_NAME` array defines the mapping between model names and deployment names. Each configuration object includes the deployment name (`deployName`), model name (`modelName`), and a default status marker (`gpt35Default` or `gpt4Default`). If set to `gpt35Default` or `gpt4Default`, it indicates that the related GPT-3.5 or GPT-4 requests will by default use this deployment unless another model is specifically requested.

Example:

```json
AZURE_DEPLOY_NAME = [
    { "deployName": "gpt-35-turbo", "modelName": "gpt-3.5-turbo", "gpt35Default": true },
    { "deployName": "gpt-4-turbo", "modelName": "gpt-4-turbo-preview", "gpt4Default": true },
    { "deployName": "gpt-4-vision-preview", "modelName": "gpt-4-vision-preview" },
    { "deployName": "gpt-4-vision-preview", "modelName": "gpt-4-1106-vision-preview" },
    { "deployName": "text-embedding-ada-002-2", "modelName": "text-embedding-ada-002" },
    { "deployName": "Dalle3", "modelName": "dall-e-3" },
    { "deployName": "text-embedding-3-large", "modelName": "text-embedding-3-large" },
    { "deployName": "text-embedding-3-small", "modelName": "text-embedding-3-small" },
    { "deployName": "gpt-35-turbo-0125", "modelName": "gpt-3.5-turbo-0125" },
    { "deployName": "gpt-4-turbo-0125", "modelName": "gpt-4-0125-preview" }
]
```

### Other Service Configurations

- **OpenAI**: Configured with `OPENAI_API_KEY` and `OPENAI_GATEWAY_URL`.
- **Coze**: Configured with `COZE_API_KEY` and `COZE_BOT_IDS`.
- **DeepInfra**: Configured with `DEEPINFRA_API_KEY` and `DEEPINFRA_DEPLOY_NAME`.
- **GROQ**: Configured with `GROQ_API_KEY`.

## Supplementary Explanation for the Current Revision

With the latest update, Groq now supports the configuration of gateway proxies, enhancing the flexibility and control over request routing. This feature is particularly useful for managing traffic and optimizing performance across different regions or networks. The `wrangler.toml` file has been updated to include a new variable `GROQ_GATEWAY_URL`, allowing users to specify the Groq gateway URL directly. This addition ensures that requests to Groq can be efficiently routed through the specified gateway proxy, providing an additional layer of customization for users leveraging Groq's powerful AI capabilities.

## Usage Details

### Token Rules

When using this project's proxy for the OpenAI interface, the token rule is three segments, separated by `##`, in the following format:

```
CUSTOM_KEY##vendor name##(whether to enable Google search)
```

For example, `sk-xxxx##openai##enable`. The built-in internet search functionality is only available for OpenAI and Azure.

### Internet Search Functionality

In this proxy service, the built-in internet search functionality is only supported for OpenAI and Azure services. When enabled, it allows direct use of internet search capabilities within AI model requests, enhancing the relevance and quality of results.

### Cloudflare AI Gateway

`AZURE_GATEWAY_URL` and `OPENAI_GATEWAY_URL` are set up at the Cloudflare AI Gateway URLs. These gateways not only serve as intermediaries for API requests but also offer billing management and response caching capabilities, effectively reducing operational costs and enhancing response speeds.

## Contributions

We welcome and encourage contributions from community members in any form! If you encounter any problems or have suggestions for improvements while using the product, please share your thoughts through submitting an issue or pull request.

## License

This project is released under the MIT license. More details can be found in the [LICENSE](LICENSE) file.

## Supported Models

The project supports the following models:

- GPT-4o
- GPT-4o-mini
- GPT-4o-2024-05-13
- GPT-4-0125-preview
- GPT-4-turbo-preview
- GPT-4-1106-preview
- GPT-4-vision-preview
- GPT-4-1106-vision-preview
- GPT-4
- GPT-4-0613
- GPT-4-32k
- GPT-4-32k-0613
- GPT-3.5-turbo-0125
- GPT-3.5-turbo
- GPT-3.5-turbo-1106
- GPT-3.5-turbo-instruct
- GPT-3.5-turbo-16k
- GPT-3.5-turbo-0613
- GPT-3.5-turbo-16k-0613
