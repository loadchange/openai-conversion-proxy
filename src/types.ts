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

interface Env {
	GROQ_CLOUD_TOKEN: string;
	AZURE_API_KEY: string;
	AZURE_USE_API_KEY: string;
	OPENAI_API_KEY: string;
	AZURE_GATEWAY_URL?: string;
	OPENAI_GATEWAY_URL?: string;
}
