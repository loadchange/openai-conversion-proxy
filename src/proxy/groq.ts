import { generativeModelMappings } from '../utils';

/**
 * LLaMA2-70b
 * Developer: Meta
 * Model Name: LLaMA2-70b-chat
 * Context Window: 4,096 tokens
 * API String: llama2-70b-4096
 *
 * Mixtral-8x7b
 * Developer: Mistral
 * Model Name: Mixtral-8x7b-Instruct-v0.1
 * Context Window: 32,768 tokens
 * API String: mixtral-8x7b-32768
 *
 * Gemma-7b-it
 * Developer: Google
 * Model Name: Gemma-7b-it
 * Context Window: 8,192 tokens
 * API String: Gemma-7b-it
 *
 * Documentation: https://console.groq.com/docs/models
 */

const MODELS = ['llama2-70b-4096', 'mixtral-8x7b-32768', 'gemma-7b-it'];
const [LLaMA270b, Mixtral8x7b, Gemma7bit] = MODELS;

const MODELS_MAPPING = generativeModelMappings(LLaMA270b, Mixtral8x7b, Gemma7bit);

const proxy: IProxy = (request: Request, token: string, body: any, url: URL, env: Env) => {
	const payload = {
		method: request.method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: '{}',
	};
	if (body) {
		body.model = MODELS_MAPPING[body?.model as OPEN_AI_MODELS] ?? Gemma7bit;
		payload.body = JSON.stringify(body);
	}
	return fetch(`https://api.groq.com/openai/${url.pathname.replace(/^\/+/, '')}`, payload);
};

export default proxy;
