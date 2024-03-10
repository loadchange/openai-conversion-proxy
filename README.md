# OPENAI-CONVERSION-PROXY

A Cloudflare Workers-based proxy service designed to transform AI APIs from various vendors into the style of OpenAI's official API, facilitating seamless integration into the existing OpenAI ecosystem. Our service enables cost-effective AI solutions by leveraging more affordable or even free AI offerings from other providers to satisfy fundamental requirements, thereby offering significant cost savings.

*Please note that openai-conversion-proxy is an independent project and is not officially affiliated with OpenAI.*

## Features

- Proxy any AI provider's API and convert the request/response structure to match that of OpenAI's API.
- Compatible with existing software that expects OpenAI API format, ensuring easy plug-and-play functionality.
- Cost-effective alternative to OpenAI, utilizing cheaper or free AI services while maintaining compatibility.
- Built on Cloudflare Workers for reliability and scalability.

## Background

The openai-conversion-proxy is born out of the need to adapt to OpenAI's API ecosystem while being budget-conscious. Various AI service providers offer comparable capabilities at a lower cost or for free, but integration challenges persist due to differing API interfaces. This project aims to standardize these interfaces, conforming other AI services to OpenAI's API style, thus allowing users to switch AI providers without altering their existing software setup.

## How It Works

The proxy service intercepts API requests intended for OpenAI's platform and reroutes them to an alternative AI provider. It then transforms the request to match the provider's expected format and, upon receiving the response, converts it back to the structure anticipated by OpenAI-compatible software. This bidirectional conversion ensures that the end-user can utilize various AI services transparently.

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

After successful deployment, any software using OpenAI's API can switch to your proxy by simply changing the API endpoint URL to the one provided by your Cloudflare Worker. The proxy will handle all the necessary conversions in the background.

## Limitations

- The conversion is limited by the feature set offered by the alternative AI provider.
- Certain advanced features of OpenAI's API may not be supported by all AI providers and thus might not be available through the proxy.
- Latency and performance may vary based on the third-party AI provider's service and Cloudflare Worker's processing.

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
