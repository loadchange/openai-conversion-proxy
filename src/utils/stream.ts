import { JSONParse, isNotEmpty } from '.';
import { google_search } from '../tools/google_search';

// Internal tool calls
const internalToolCalls = { google_search };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Converts a message string to an object.
 *
 * @param msg - The message string to convert.
 * @returns The converted object.
 */
export function convertMsgToObject(msg: string) {
  return JSON.parse(msg.replace('data:', '').trim());
}

async function writeOrCallTool(content: string, writer: WritableStreamDefaultWriter, cache_tools: any) {
  const { choices } = convertMsgToObject(content);

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
        return [internalToolCalls[func_info?.name as keyof typeof internalToolCalls], func_info?.arguments];
      }
    }
    await writer.write(encoder.encode('function call failed'));
  } else {
    await writer.write(encoder.encode([content, '\n\n'].join('')));
  }
  return null;
}

export async function streamByOpenAI(readable: ReadableStream, writable: WritableStream, env: Env, payload?: any, openAIReq?: any) {
  let [reader, writer] = [readable.getReader(), writable.getWriter()];
  let buffer = '';

  let cache_tools: any = null;

  while (true) {
    let { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split('\n\n');

    for (let i = 0; i < lines.length - 1; i++) {
      const recursion = await writeOrCallTool(lines[i], writer, cache_tools);
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
    const recursion = await writeOrCallTool(buffer, writer, cache_tools);
    if (recursion) return;
  }
  await writer.write(encoder.encode('\n'));
  await writer.close();
}
