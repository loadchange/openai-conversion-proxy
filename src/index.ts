import { options } from './constant';
import groq from './proxy/groq';
import { coze, cozeChina } from './proxy/coze';
import azure from './proxy/azure';
import openai from './proxy/openai';
import deepinfra from './proxy/deepinfra';
import deepseek from './proxy/deepseek';
import { google_search_description } from './tools/google_search';
import { JSONParse, isNotEmpty } from './utils';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const services: { [key: string]: IProxy } = { groq, azure, openai, coze, cozeChina, deepinfra, deepseek };
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return options;

    const authKey = request.headers.get('Authorization')?.replace('Bearer', '')?.trim();
    if (!authKey) return new Response('401 Unauthorized', { status: 401 });

    const [token, serviceName, enableFuncCall] = authKey.split('##');
    if (!token || !serviceName || env.CUSTOM_KEY !== token || !services[serviceName]) return new Response('Not allowed', { status: 403 });

    const body: any = request.method === 'POST' ? await request.json() : null;
    const action = url.pathname.replace(/^\/+v1\/+/, '');
    const builtIn = enableFuncCall && enableFuncCall === 'enable';

    // Check if enableFuncCall is set to 'enable' and if body is present and does not have 'tools' and 'tool_choice' properties
    if (builtIn && body && !body.tools && !body.tool_choice && ['openai', 'azure'].includes(serviceName)) {
      if (env.GOOGLE_API_KEY && env.GOOGLE_CSE_ID) {
        body.tools = [google_search_description];
        body.tool_choice = 'auto';
      }
    }

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

    if (serviceName === 'deepinfra') {
      if (env.DEEPINFRA_DEPLOY_NAME && typeof env.DEEPINFRA_DEPLOY_NAME === 'string') {
        env.DEEPINFRA_DEPLOY_NAME = JSONParse(env.DEEPINFRA_DEPLOY_NAME);
      }
      if (!isNotEmpty(env.DEEPINFRA_DEPLOY_NAME)) {
        return new Response('404 Not Found', { status: 404 });
      }
    }

    return services[serviceName](action, body, env, !!builtIn);
  },
};
