import { sleep, models, generativeModelMappings, isNotEmpty, listLen } from '../utils';

interface IConvertToOpenAIFormatParams {
	readable: ReadableStream;
	writable: WritableStream;
	customContent?: string; // optional
	created: number;
	model: string;
}

const convertToOpenAIFormat = async (params: IConvertToOpenAIFormatParams) => {
	const reader = params.readable.getReader();
	const writer = params.writable.getWriter();

	const openAiTemplate = (content?: string) =>
		JSON.stringify({
			nonce: 'min90',
			choices: [
				{
					delta: { content },
					finish_reason: null,
					index: 0,
					logprobs: null,
				},
			],
			created: params.created,
			id: 'chatcmpl-9DmxY0UGKvFmAKX1sNgTytelmU1o15',
			model: params.model,
			object: 'chat.completion.chunk',
			system_fingerprint: 'fp_1402c60a5a',
		});

	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	const newline = '\n';
	const delimiter = '\n\n';
	const encodedNewline = encoder.encode(newline);

	let buffer = '';

	if (params.customContent) {
		buffer = params.customContent;
		reader.releaseLock();
	} else {
		while (true) {
			let { value, done } = await reader.read();
			if (done) {
				break;
			}
			buffer += decoder.decode(value, { stream: true });
			let lines = buffer.split(delimiter);

			for (let i = 0; i < lines.length - 1; i++) {
				const openAIFormat = openAiTemplate(lines[i]);
				await writer.write(encoder.encode('data: ' + openAIFormat + delimiter));
				await sleep(20);
			}

			buffer = lines[lines.length - 1];
		}
	}

	if (buffer) {
		const openAIFormat = openAiTemplate(buffer);
		await writer.write(encoder.encode('data: ' + openAIFormat + delimiter));
	}
	await writer.write(encoder.encode('data: [DONE]' + delimiter));
	await writer.write(encodedNewline);
	writer.close();
};

const generateNullMessageException = () => new Response('User message is required', { status: 400 });

async function createNewChat({ payload }: { payload: any }) {
	const response = await fetch('https://api.glbgpt.com/api/robot/task/new', payload);
	return gatherResponse(response);
}

async function getLastTaskId({ payload, robot_id }: { payload: any; robot_id: string }) {
	const response = await fetch(`https://api.glbgpt.com/api/robot/tasks?robot_id=${robot_id}`, payload);
	const data: any = await gatherResponse(response);
	if (data?.code === 0 && isNotEmpty(data?.data)) {
		return data.data[0].uuid;
	}
	return '';
}

/**
 * command creates a new reply and returns a response
 * @param param0
 * @returns
 */
const createNewChatAndReplyMessage = async ({
	payload,
	model,
	created,
	readable,
	writable,
}: {
	payload: any;
	model: string;
	created: number;
	readable: ReadableStream;
	writable: WritableStream;
}) => {
	const data: any = await createNewChat({ payload });

	const params = {
		readable: readable,
		writable: writable,
		created,
		model,
		customContent: 'New chat created',
	};
	if (data?.code === 0) {
		params.customContent += '\n```json\n' + JSON.stringify(data?.data, null, 2) + '```';
	} else {
		params.customContent = 'Failed to create new chat:\n```json\n' + JSON.stringify(data, null, 2) + '```';
	}
	convertToOpenAIFormat(params);
	return new Response(readable);
};

async function gatherResponse(response: Response) {
	const { headers } = response;
	const contentType = headers.get('content-type') || '';
	if (contentType.includes('application/json')) {
		return await response.json();
	}
	return response.text();
}

const proxy: IProxy = async (request: Request, token: string, body: any, url: URL, env: Env) => {
	// Remove the leading /v1/ from url.pathname
	const action = url.pathname.replace(/^\/+v1\/+/, '');

	const models_maping = generativeModelMappings('1', '2', {
		'claude3-opus': '3',
		'claude3-sonnet': '4',
	});
	if (action === 'models') return models(models_maping);

	const created = parseInt((Date.now() / 1000).toFixed(0));

	// Only chat/completions is supported
	if (!['chat/completions'].includes(action)) {
		return new Response('404 Not Found', { status: 404 });
	}

	const messages = body?.messages?.filter((msg: any) => msg.role === 'user');
	const userMsgCount = listLen(messages);
	if (userMsgCount < 1) return generateNullMessageException();

	const lastMessageContent = messages[userMsgCount - 1]?.content;
	if (!lastMessageContent) return generateNullMessageException();

	const payload = {
		method: request.method,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
			Token: token,
		},
		body: '{}',
	};
	const robot_id = models_maping[body?.model as OPEN_AI_MODELS] ?? '1';
	let { readable, writable } = new TransformStream();

	if (typeof lastMessageContent === 'string' && lastMessageContent.trim() === '/new') {
		return createNewChatAndReplyMessage({
			payload: { ...payload, method: 'POST', body: JSON.stringify({ robot_id }) },
			model: body?.model ?? 'gpt-3.5-turbo-1106',
			created,
			readable,
			writable,
		});
	}

	let task_id = await getLastTaskId({ payload: { ...payload, method: 'GET', body: null }, robot_id });
	if (!task_id) {
		const newChat: any = await createNewChat({ payload: { ...payload, method: 'POST', body: JSON.stringify({ robot_id }) } });
		if (newChat?.code === 0 && newChat?.data?.uuid) {
			task_id = newChat.data.uuid;
		} else {
			return new Response('Failed to create new chat', { status: 500 });
		}
	}
	payload.body = JSON.stringify({ message: lastMessageContent, task_id });

	const fetchAPI = `https://api.glbgpt.com/api/robot/task/chat/`;

	let response = await fetch(fetchAPI, payload);
	response = new Response(response.body, response);
	response.headers.set('Access-Control-Allow-Origin', '*');

	convertToOpenAIFormat({
		model: body?.model ?? 'gpt-3.5-turbo-1106',
		created,
		readable: response.body as ReadableStream,
		writable,
	});
	return new Response(readable, response);
};

export default proxy;
