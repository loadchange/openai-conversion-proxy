import { JSONParse, isNotEmpty } from './helper';
import { google_search } from '../tools/google_search';

export function convertMsgToObject(msg: string) {
  try {
    return JSON.parse(msg.replace('data:', '').trim());
  } catch (e) {
    return {};
  }
}

export async function streamByOpenAI(options: {
  readable: ReadableStream;
  writable: WritableStream;
  env: Env;
  payload?: any;
  openAIReq?: any;
  builtIn?: boolean;
}) {
  try {
    const { readable, writable, env, payload, openAIReq, builtIn } = options;
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let reader = readable.getReader();
    const writer = writable.getWriter();
    let buffer = '';
    let cacheTools: any = null;

    const internalToolCalls = { google_search };

    async function writeOrCallTool(content: string) {
      const { choices } = convertMsgToObject(content);

      if (builtIn && (isNotEmpty(choices?.[0]?.delta?.tool_calls) || choices?.[0]?.finish_reason === 'tool_calls')) {
        if (!cacheTools) {
          cacheTools = [...choices[0].delta.tool_calls];
        }

        if (isNotEmpty(choices?.[0]?.delta?.tool_calls)) {
          choices[0].delta.tool_calls.forEach((tool: any) => {
            cacheTools[tool.index]['function']['arguments'] += tool['function']['arguments'];
          });
        }

        if (isNotEmpty(cacheTools) && choices?.[0]?.finish_reason === 'tool_calls') {
          const toolInfo: any = cacheTools[0];
          if (toolInfo && toolInfo['function']) {
            const funcInfo = toolInfo['function'];
            return [internalToolCalls[funcInfo?.name as keyof typeof internalToolCalls], funcInfo?.arguments];
          }
        }
        await writer.write(encoder.encode('function call failed'));
        return null;
      } else {
        await writer.write(encoder.encode([content, '\n\n'].join('')));
        return null;
      }
    }

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');

      for (let i = 0; i < lines.length - 1; i++) {
        const recursion = await writeOrCallTool(lines[i]);
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
          break;
        }
      }
      if (cacheTools) {
        cacheTools = null;
        continue;
      }

      buffer = lines[lines.length - 1];
    }

    if (buffer) {
      await writeOrCallTool(buffer);
    }
    await writer.write(encoder.encode('\n'));
    await writer.close();
  } catch (error) {
    console.error('Error in streamByOpenAI:', error);
  }
}
