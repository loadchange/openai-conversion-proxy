import { options } from './constant';
import azure from './proxy/azure';
import groq from './proxy/groq';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const TOKEN_MAPPER = { [env.GROQ_CLOUD_TOKEN]: groq, [env.AZURE_API_KEY]: azure };
		const url = new URL(request.url);
		if (request.method === 'OPTIONS') return options;

		const authKey = request.headers.get('Authorization')?.replace('Bearer', '')?.trim();
		if (!authKey || !Object.keys(TOKEN_MAPPER).includes(authKey)) return new Response('Not allowed', { status: 403 });

		const body = request.method === 'POST' ? await request.json() : null;
		return TOKEN_MAPPER[authKey](request, authKey, body, url, env);
	},
};
