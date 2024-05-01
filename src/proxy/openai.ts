import { requestFactory, openAiPayload, streamByOpenAI } from '../utils';

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
const proxy: IProxy = async (action: string, body: any, env: Env, builtIn?: boolean) => {
  if (body) {
    body.model = body?.model ?? 'gpt-3.5-turbo-0125';
  }

  const payload = openAiPayload({ token: env.OPENAI_API_KEY, body });

  const requestFunc = requestFactory(`${env.OPENAI_GATEWAY_URL ?? 'https://api.openai.com/v1'}/${action}`);
  const response = await requestFunc(payload);

  if (!builtIn) return response;
  if (!body?.stream) return response;

  const { readable, writable } = new TransformStream();
  streamByOpenAI({
    readable: response.body as ReadableStream,
    writable,
    env,
    openAIReq: requestFunc,
    payload,
    builtIn: !!builtIn,
  });
  return new Response(readable, response);
};

export default proxy;
