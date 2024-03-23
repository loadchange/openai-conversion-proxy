# OPENAI-CONVERSION-PROXY

A versatile Cloudflare Workers-based proxy service designed to standardize AI APIs from multiple vendors, including OpenAI itself, into a single unified interface. Our service enhances integration into the existing OpenAI ecosystem while enabling cost-effective AI solutions through usage monitoring, response caching, and the ability to switch between AI providers with a simple token change.

*Please note that openai-conversion-proxy is an independent project and is not officially affiliated with OpenAI.*

## Features

- Proxy and standardize APIs from multiple AI providers, as well as OpenAI's own API, to a unified OpenAI-style API format.
- Seamless integration for software expecting OpenAI API formats with the added ability to switch AI providers conveniently.
- Integration with Cloudflare AI Gateway for monitoring usage and caching responses, optimizing costs without sacrificing performance.
- Built on Cloudflare Workers for top-tier reliability and scalability.

## Background

The enhanced openai-conversion-proxy addresses the evolving need for a more adaptable and cost-efficient AI API integration. As AI service offerings diversify, the ability to switch between providers, including OpenAI, based on cost, performance, or feature availability becomes essential. This project simplifies these transitions without requiring changes to existing software setups.

## How It Works

The proxy service intercepts AI API requests and reroutes them to the specified AI provider based on the provided token. It performs bidirectional transformation of the requests and responses to ensure compatibility and leverages Cloudflare AI Gateway to monitor usage and cache responses, thus optimizing costs and improving performance.

## Getting Started


### Prerequisites

Before setting up the openai-conversion-proxy, you need to have:

- A Cloudflare account with access to Workers.
- API credentials from your chosen AI service provider(s).
- Basic knowledge of JavaScript and Cloudflare Workers environment.

### Installation Steps

1. **Setup Cloudflare Worker**

   - Log in to your Cloudflare account and navigate to the Workers section.
   - Create a new Worker and name it appropriately.
2. **Clone the openai-conversion-proxy Repository**

   - Clone the repository to your local environment or directly in the Cloudflare Worker editor.

   ```sh
   git clone https://github.com/loadchange/openai-conversion-proxy.git

   cd openai-conversion-proxy
   npm install
   ```

   - Edit the wrangler.toml file and fill in your existing Token.
   - Execute the deployment command, according to the guidance prompt, authorize on the webpage.
3. **Configure AI Provider Credentials**

   - Inside the cloned repository, locate and edit the configuration files to include the credentials for the AI provider(s) you want to proxy.
4. **Deploy to Cloudflare Workers**

   - Upload the script to your Cloudflare Worker.
   - Adjust routes in the Cloudflare dashboard to match the API requests that should be proxied.
5. **Test the Proxy**

   - Ensure that the proxy is correctly intercepting and transforming requests/responses.
   - Use an OpenAI-compatible client to make a request and verify that the service behaves as expected.


## Usage

With the updated proxy, change the API endpoint URL in your OpenAI-compatible client to your Cloudflare Worker's URL and switch between different AI providers by updating the token. The proxy, along with Cloudflare AI Gateway, will manage the rest.

## Limitations

- Feature compatibility will vary based on the chosen AI provider's capabilities.
- OpenAI's advanced features may not be fully supported by other AI providers.
- Performance and latency are subject to the service levels of the third-party AI provider and Cloudflare Worker processing.
-
## Contributing

Contributions to openai-conversion-proxy are welcome! Whether you're fixing bugs, improving the documentation, or adding new features, we appreciate your help in making this project better.

Please submit your contributions via pull requests.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository, and the maintainers will address it as soon as possible.

## License

Open-source licensed under the Apache2.0 License. See the LICENSE file for details.

## Disclaimer

This project is not endorsed by or affiliated with OpenAI. All product names, logos, and brands are property of their respective owners.

---

By using the openai-conversion-proxy, developers and businesses can optimize their costs while still enjoying the compatibility and convenience offered by OpenAI's ecosystem. Happy coding!
