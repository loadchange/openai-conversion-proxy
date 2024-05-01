import { streamByOpenAI } from '../utils/stream';
import { requestFactory, openAiPayload } from '../utils';
import { google_search_description } from '../tools/google_search';

/**
 * OpenAI API
 * Simply proxy the official OpenAI API.
 * If you have configured the OPENAI_GATEWAY_URL, you can also check the usage.
 * This is to allow for the backend service provider to be switched by changing
 * the tokens of different vendors when the client has already set the base URL.
 * @param request
 * @param token
 * @param body
 * @param url
 * @param env
 * @returns
 */
const proxy: IProxy = async (action: string, body: any, env: Env) => {
  if (body) {
    body.model = body?.model ?? 'gpt-3.5-turbo-0125';
    if (!body?.tools && !body?.tool_choice && env.GOOGLE_API_KEY && env.GOOGLE_CSE_ID) {
      body.tools = [google_search_description];
      body.tool_choice = 'auto';
    }
  }

  const payload = openAiPayload({ token: env.OPENAI_API_KEY, body });

  const requestFunc = requestFactory(`${env.OPENAI_GATEWAY_URL ?? 'https://api.openai.com/v1'}/${action}`);
  const response = await requestFunc(payload);

  if (!body?.stream) return response;

  const { readable, writable } = new TransformStream();
  streamByOpenAI(response.body as ReadableStream, writable, env, payload, requestFunc);
  return new Response(readable, response);
};

export default proxy;
