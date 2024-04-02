import { sleep, models, generativeModelMappings } from '../utils';

const MODEL_DEPLOY_NAME_LIST = ['gpt-35-turbo', 'gpt-4-turbo', 'gpt-4-vision-preview'];
const [GPT35_TURBO, GPT4_TURBO, GPT4_VISION] = MODEL_DEPLOY_NAME_LIST;

const MODELS_MAPPING = generativeModelMappings(GPT35_TURBO, GPT4_TURBO, {
	'gpt-4-vision-preview': GPT4_VISION,
	'gpt-4-1106-vision-preview': GPT4_VISION,
	'text-embedding-ada-002': 'text-embedding-ada-002-2',
	'dall-e-3': 'Dalle3',
	'text-embedding-3-large': 'text-embedding-3-large',
	'text-embedding-3-small': 'text-embedding-3-small',
	'gpt-3.5-turbo-0125': 'gpt-35-turbo-0125', // north-central-us region
	'gpt-4-0125-preview': 'gpt-4-turbo-0125', // north-central-us region
});

const API_VERSION = '2024-02-15-preview';

// support printer mode and add newline
async function stream(readable: ReadableStream, writable: WritableStream) {
	const reader = readable.getReader();
	const writer = writable.getWriter();

	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	const newline = '\n';
	const delimiter = '\n\n';
	const encodedNewline = encoder.encode(newline);

	let buffer = '';
	while (true) {
		let { value, done } = await reader.read();
		if (done) {
			break;
		}
		buffer += decoder.decode(value, { stream: true });
		let lines = buffer.split(delimiter);

		for (let i = 0; i < lines.length - 1; i++) {
			await writer.write(encoder.encode(lines[i] + delimiter));
			await sleep(20);
		}

		buffer = lines[lines.length - 1];
	}

	if (buffer) {
		await writer.write(encoder.encode(buffer));
	}
	await writer.write(encodedNewline);
	await writer.close();
}

/**
 * Due to varying quota limits across different regions when deploying models on Microsoft Azure,
 * it is necessary to perform region mapping. Most models are located in West US,
 * text-embedding-3-large and text-embedding-3-small, are in the EASTUS region.
 * @param model
 * @returns
 */
const getResourceNameAndToken = (model: string, env: Env) => {
	if (['dall-e-3', 'text-embedding-3-small', 'text-embedding-3-large'].includes(model)) {
		return { resourceName: 'min-east-us', token: env.AZURE_USE_API_KEY };
	}
	if (['gpt-3.5-turbo-0125', 'gpt-4-0125-preview'].includes(model)) {
		return { resourceName: 'min-north-central-us', token: env.AZURE_USNC_API_KEY };
	}
	return { resourceName: 'min', token: env.AZURE_API_KEY };
};

const proxy: IProxy = async (request: Request, _: string, body: any, url: URL, env: Env) => {
	// Remove the leading /v1/ from url.pathname
	const action = url.pathname.replace(/^\/+v1\/+/, '');

	if (action === 'models') return models(MODELS_MAPPING);

	const payload = {
		method: request.method,
		headers: {
			'Content-Type': 'application/json',
			'api-key': '',
		},
		body: JSON.stringify(body ?? {}),
	};

	if (!['chat/completions', 'images/generations', 'completions', 'embeddings'].includes(action))
		return new Response('404 Not Found', { status: 404 });

	const deployName = MODELS_MAPPING[body?.model as OPEN_AI_MODELS] ?? GPT35_TURBO;

	const { resourceName, token } = getResourceNameAndToken(body?.model as string, env);
	payload.headers['api-key'] = token;

	const fetchAPI = env.AZURE_GATEWAY_URL
		? `${env.AZURE_GATEWAY_URL}${resourceName}/${deployName}/${action}?api-version=${API_VERSION}`
		: `https://${resourceName}.openai.azure.com/openai/deployments/${deployName}/${action}?api-version=${API_VERSION}`;

	let response = await fetch(fetchAPI, payload);
	response = new Response(response.body, response);
	response.headers.set('Access-Control-Allow-Origin', '*');

	if (body?.stream != true) return response;

	let { readable, writable } = new TransformStream();
	stream(response.body as ReadableStream, writable);
	return new Response(readable, response);
};

export default proxy;
