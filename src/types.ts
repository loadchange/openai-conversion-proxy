type OPEN_AI_MODELS =
	| 'gpt-4-0125-preview'
	| 'gpt-4-turbo-preview'
	| 'gpt-4-1106-preview'
	| 'gpt-4-vision-preview'
	| 'gpt-4-1106-vision-preview'
	| 'gpt-4'
	| 'gpt-4-0613'
	| 'gpt-4-32k'
	| 'gpt-4-32k-0613'
	| 'gpt-3.5-turbo-0125'
	| 'gpt-3.5-turbo'
	| 'gpt-3.5-turbo-1106'
	| 'gpt-3.5-turbo-instruct'
	| 'gpt-3.5-turbo-16k'
	| 'gpt-3.5-turbo-0613'
	| 'gpt-3.5-turbo-16k-0613';

type IProxy = (request: Request, token: string, body: any, url: URL, env: Env) => Promise<Response>;

interface AzureKey {
	resourceName: string;
	token: string;
	default?: boolean;
	models?: string[];
}
interface AzureDeployName {
	deployName: string;
	modelName: string;
	/**
	 * Override the default values for all gpt3.5 models
	 */
	gpt35Default?: boolean;
	/**
	 * Override the default values for all gpt4 models
	 */
	gpt4Default?: boolean;
}

interface Env {
	/**
	 * Azure Open AI Custom Key:
	 * The configuration here is not an actual Azure API Key, but a custom key you define.
	 * When the service receives this key, the program will understand that Azure services need to be used.
	 * Since Azure is region-specific, you may need to configure multiple real keys.
	 * However, the key here is used solely for service routing identification and can also ensure the security of the key.
	 * You can change it at any time as you wish.
	 */
	AZURE_OPENAI_CUSTOM_KEY: string;
	AZURE_API_KEYS: AzureKey[];
	AZURE_DEPLOY_NAME: AzureDeployName[];
	AZURE_API_VERSION?: string;
	GROQ_CLOUD_TOKEN: string;
	OPENAI_API_KEY: string;
	AZURE_GATEWAY_URL?: string;
	OPENAI_GATEWAY_URL?: string;

	GLOBALGPT_API_KEY: string;
}
