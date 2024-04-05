import { sleep, models, generativeModelMappings, isNotEmpty } from '../utils';

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
	const resourceInfo = Object.create(null);
	if (!isNotEmpty(env.AZURE_API_KEYS)) return resourceInfo;
	for (let i = 0; i < env.AZURE_API_KEYS.length; i++) {
		const item = env.AZURE_API_KEYS[i];
		if (isNotEmpty<string>(item.models) && item.models.includes(model)) return item;
		if (item.default) {
			resourceInfo.resourceName = item.resourceName;
			resourceInfo.token = item.token;
		}
	}
	return resourceInfo;
};

const proxy: IProxy = async (request: Request, _: string, body: any, url: URL, env: Env) => {
	// Remove the leading /v1/ from url.pathname
	const action = url.pathname.replace(/^\/+v1\/+/, '');

	let models_maping = Object.create(null);
	let [gpt35, gpt4] = ['', ''];
	if (isNotEmpty(env.AZURE_DEPLOY_NAME)) {
		env.AZURE_DEPLOY_NAME.forEach((item) => {
			if (item.gpt35Default) gpt35 = item.deployName;
			if (item.gpt4Default) gpt4 = item.deployName;
			models_maping[item.modelName] = item.deployName;
		});
	}
	if (!gpt35) return new Response('404 Not Found', { status: 404 });
	models_maping = generativeModelMappings(gpt35, gpt4, models_maping);

	if (action === 'models') return models(models_maping);

	const payload = {
		method: request.method,
		headers: {
			'Content-Type': 'application/json',
			'api-key': '',
		},
		body: JSON.stringify(body ?? {}),
	};

	if (!['chat/completions', 'images/generations', 'completions', 'embeddings'].includes(action)) {
		return new Response('404 Not Found', { status: 404 });
	}

	const deployName = models_maping[body?.model as OPEN_AI_MODELS] ?? gpt35;

	const { resourceName, token } = getResourceNameAndToken(body?.model as string, env);
	if (!resourceName || !token) {
		return new Response('401 Unauthorized', { status: 401 });
	}

	payload.headers['api-key'] = token;

	const API_VERSION = env.AZURE_API_VERSION ?? '2024-02-15-preview';
	const fetchAPI = env.AZURE_GATEWAY_URL
		? `${env.AZURE_GATEWAY_URL}/${resourceName}/${deployName}/${action}?api-version=${API_VERSION}`
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
