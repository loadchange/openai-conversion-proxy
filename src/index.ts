import { options } from './constant';
import groq from './proxy/groq';
import coze from './proxy/coze';
import azure from './proxy/azure';
import openai from './proxy/openai';
import glbgpt from './proxy/glbgpt';
import deepinfra from './proxy/deepinfra';
import { JSONParse } from './utils';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const services: { [key: string]: IProxy } = { groq, azure, openai, glbgpt, coze, deepinfra };
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return options;

    const authKey = request.headers.get('Authorization')?.replace('Bearer', '')?.trim();
    if (!authKey) return new Response('Not allowed', { status: 403 });

    const [token, serviceName] = authKey.split('##');
    if (!token || !serviceName || env.CUSTOM_KEY !== token || !services[serviceName]) return new Response('Not allowed', { status: 403 });

    const body = request.method === 'POST' ? await request.json() : null;

    if (serviceName === 'azure') {
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
    }

    return services[serviceName](request, body, url, env);
  },
};
