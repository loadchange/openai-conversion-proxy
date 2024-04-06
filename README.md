# OpenAI Conversion Proxy

Welcome to the OpenAI Conversion Proxy project! This innovative edge computing script is designed to run on Cloudflare Workers, taking full advantage of Cloudflare's generous policy that allows up to 100,000 free invocations per day. This setup makes it perfectly suitable for personal, research, and learning purposes, offering a cost-effective way to leverage AI services from Azure, OpenAI, and Groq Cloud.

## Getting Started

To deploy your own instance of the OpenAI Conversion Proxy, follow these simple steps:

1. **Clone the Repository**
   Start by cloning the repository to your local machine using the following command:
   ```
   git clone https://github.com/loadchange/openai-conversion-proxy.git
   ```

2. **Install Dependencies**
   Navigate into the cloned repository directory and install the necessary dependencies by running:
   ```
   npm install
   ```

3. **Deploy to Cloudflare Workers**
   Once the dependencies are installed, you can deploy your proxy to Cloudflare Workers by executing:
   ```
   npm run deploy
   ```
   This command will automatically handle the deployment process, making your OpenAI proxy available online.

## Configuration Guide

Before deploying, you'll need to configure your project to work with the respective AI services. We've prepared a detailed [Project Configuration Guide](https://github.com/loadchange/openai-conversion-proxy/pull/7) to help you set up your project correctly. This guide covers everything from Azure API versions to Cloudflare Gateway URLs, ensuring you have all the information needed to customize the proxy according to your needs.

## Usage

Once deployed, your OpenAI Conversion Proxy will act as a middleman between your applications and the AI services, allowing you to:
- Leverage different AI models from Azure, OpenAI, and Groq Cloud.
- Take advantage of Cloudflare's caching and usage monitoring to optimize costs.
- Easily switch between AI service providers without major changes to your base code.

## Contributing

We welcome contributions from the community! Whether you have a feature request, a bug report, or want to contribute code, please feel free to open an issue or a pull request. For more details on how to contribute, please review our contribution guidelines.

## License

This project is licensed under the [Apache 2.0 License](LICENSE). Feel free to fork, modify, and use it in your own projects.

## Acknowledgements

A big thank you to Cloudflare for their Workers platform, which makes projects like this possible. We also appreciate the AI services provided by Azure, OpenAI, and Groq Cloud, which power the intelligence behind this proxy.

---

By deploying this OpenAI Conversion Proxy, you're unlocking a powerful, cost-effective tool for AI research and development. We're excited to see what you build with it!