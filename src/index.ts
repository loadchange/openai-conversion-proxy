import { options } from './constant';
import azure from './proxy/azure';
import groq from './proxy/groq';
import openAi from './proxy/openai';
import globalGPT from './proxy/glbgpt';
import coze from './proxy/coze';
import { JSONParse } from './utils';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const TOKEN_MAPPER = {
      [env.GROQ_CLOUD_TOKEN]: groq,
      [env.AZURE_OPENAI_CUSTOM_KEY]: azure,
      [env.OPENAI_API_KEY]: openAi,
      [env.GLOBALGPT_API_KEY]: globalGPT,
      [env.COZE_API_KEY]: coze,
    };
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return options;

    const authKey = request.headers.get('Authorization')?.replace('Bearer', '')?.trim();
    if (!authKey || !Object.keys(TOKEN_MAPPER).includes(authKey)) return new Response('Not allowed', { status: 403 });

    const body = request.method === 'POST' ? await request.json() : null;

    const objValue: (keyof Env)[] = ['AZURE_DEPLOY_NAME', 'AZURE_API_KEYS'];
    objValue.forEach((key) => {
      if (!env[key]) return;
      try {
        if (typeof env[key] === 'string') env[key] = JSON.parse(env[key] as string);
      } catch (error) {
        delete env[key];
        console.error(error);
      }
    });
    if (env.AZURE_DEPLOY_NAME && typeof env.AZURE_DEPLOY_NAME === 'string') env.AZURE_DEPLOY_NAME = JSONParse(env.AZURE_DEPLOY_NAME);
    if (env.AZURE_API_KEYS && typeof env.AZURE_API_KEYS === 'string') env.AZURE_API_KEYS = JSONParse(env.AZURE_API_KEYS);

    return TOKEN_MAPPER[authKey](request, authKey, body, url, env);
  },
};
