import { sleep, generativeModelMappings } from '../utils';

const MODEL_DEPLOY_NAME_LIST = ['gpt-35-turbo', 'gpt-4-turbo', 'gpt-4-vision-preview'];
const [GPT35_TURBO, GPT4_TURBO, GPT4_VISION] = MODEL_DEPLOY_NAME_LIST;

const MODELS_MAPPING = generativeModelMappings(GPT35_TURBO, GPT4_TURBO, GPT4_VISION, {
	'text-embedding-ada-002': 'text-embedding-ada-002-2',
});

const API_VERSION = '2024-02-15-preview';

// The name of your Azure OpenAI Resource.
const RESOURCE_NAME = 'min';

const models = () =>
	new Response(
		JSON.stringify({
			object: 'list',
			data: Object.keys(MODELS_MAPPING).map((id) => ({
				id,
				object: 'model',
				created: 1710035972,
				owned_by: 'openai',
				permission: [
					{
						id: 'modelperm-M56FXnG1AsIr3SXq8BYPvXJA',
						object: 'model_permission',
						created: 1709949572,
						allow_create_engine: false,
						allow_sampling: true,
						allow_logprobs: true,
						allow_search_indices: false,
						allow_view: true,
						allow_fine_tuning: false,
						organization: '*',
						group: null,
						is_blocking: false,
					},
				],
				root: id,
				parent: null,
			})),
		}),
		{ headers: { 'Content-Type': 'application/json' } }
	);

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

const proxy: IProxy = async (request: Request, token: string, body: any, url: URL, env: Env) => {
	// Remove the leading /v1/ from url.pathname
	const action = url.pathname.replace(/^\/+v1\/+/, '');

	if (action === 'models') return models();

	const payload = {
		method: request.method,
		headers: {
			'Content-Type': 'application/json',
			'api-key': token,
		},
		body: JSON.stringify(body ?? {}),
	};

	if (!['chat/completions', 'images/generations', 'completions', 'embeddings'].includes(action)) return new Response('404 Not Found', { status: 404 });

	const deployName = MODELS_MAPPING[body?.model as OPEN_AI_MODELS] ?? GPT35_TURBO;

	const fetchAPI = env.AZURE_GATEWAY_URL
		? `${env.AZURE_GATEWAY_URL}${RESOURCE_NAME}/${deployName}/${action}?api-version=${API_VERSION}`
		: `https://${RESOURCE_NAME}.openai.azure.com/openai/deployments/${deployName}/${action}?api-version=${API_VERSION}`;
	let response = await fetch(fetchAPI, payload);
	response = new Response(response.body, response);
	response.headers.set('Access-Control-Allow-Origin', '*');

	if (body?.stream != true) return response;

	let { readable, writable } = new TransformStream();
	stream(response.body as ReadableStream, writable);
	return new Response(readable, response);
};

export default proxy;
