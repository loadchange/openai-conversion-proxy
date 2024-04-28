import { JSONParse, isNotEmpty } from '../utils';
import { google_search, google_search_description } from '../tools/google_search';

export const FUNCTIONS = { google_search };

export async function stream(readable: ReadableStream, writable: WritableStream, env: Env, payload?: any, openAIReq?: any) {
  let reader = readable.getReader();
  const writer = writable.getWriter();

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const newline = '\n';
  const delimiter = '\n\n';
  const encodedNewline = encoder.encode(newline);

  let buffer = '';
  let cache_tools: any = null;

  const msg2Obj = (msg: string) => JSONParse(msg.replace('data:', '').trim());

  async function writeAndCallTool(content: string) {
    const { choices } = msg2Obj(content);

    if (isNotEmpty(choices?.[0]?.delta?.tool_calls) || choices?.[0]?.finish_reason === 'tool_calls') {
      if (!cache_tools) {
        cache_tools = [...choices[0].delta.tool_calls];
      }

      if (isNotEmpty(choices?.[0]?.delta?.tool_calls)) {
        choices[0].delta.tool_calls.forEach((tool: any) => {
          cache_tools[tool.index]['function']['arguments'] += tool['function']['arguments'];
        });
      }

      if (isNotEmpty(cache_tools) && choices?.[0]?.finish_reason === 'tool_calls') {
        const tool_info: any = cache_tools[0];
        if (tool_info && tool_info['function']) {
          const func_info = tool_info['function'];
          return [FUNCTIONS[func_info?.name as keyof typeof FUNCTIONS], func_info?.arguments];
        }
      }
      await writer.write(encoder.encode('function call failed'));
      return null;
    } else {
      await writer.write(encoder.encode(content));
      return null;
    }
  }

  while (true) {
    let { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });

    let lines = buffer.split(delimiter);

    for (let i = 0; i < lines.length - 1; i++) {
      const recursion = await writeAndCallTool(lines[i] + delimiter);
      if (recursion) {
        const [func, args] = recursion;
        const result = await func(JSONParse(args), env);
        const newBody = JSONParse(payload.body);
        delete newBody.tools;
        delete newBody.tool_choice;
        newBody.messages = [...newBody.messages, { role: 'system', content: JSON.stringify(result) }];
        const resp = await openAIReq({ ...payload, body: JSON.stringify(newBody) });
        reader = resp.body.getReader();
        buffer = '';
        continue;
      }
    }

    buffer = lines[lines.length - 1];
  }

  if (buffer) {
    const recursion = await writeAndCallTool(buffer);
    if (recursion) return;
  }
  await writer.write(encodedNewline);
  await writer.close();
}

const openAIRequest = (url: string) => (payload: any) => fetch(url, payload);

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
const proxy: IProxy = async (request: Request, body: any, url: URL, env: Env) => {
  const payload = {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: '{}',
  };

  if (body) {
    body.model = body?.model ?? 'gpt-3.5-turbo-0125';
    if (!body?.tools && !body?.tool_choice && env.GOOGLE_API_KEY && env.GOOGLE_CSE_ID) {
      body.tools = [google_search_description];
      body.tool_choice = 'auto';
    }
    payload.body = JSON.stringify(body);
  }

  const action = url.pathname.replace(/^\/+v1\/+/, '');
  const openAIReq = openAIRequest(`${env.OPENAI_GATEWAY_URL ?? 'https://api.openai.com/v1'}/${action}`);
  const response = await openAIReq(payload);

  if (!body?.stream) return response;

  const { readable, writable } = new TransformStream();
  stream(response.body as ReadableStream, writable, env, payload, openAIReq);
  return new Response(readable, response);
};

export default proxy;
