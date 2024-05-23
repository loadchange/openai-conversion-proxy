import { models, generativeModelMappings, isNotEmpty, listLen, JSONParse, gatherResponse } from '../utils';

/**
 * API Docs: https://www.coze.com/open/docs
 */

interface IConvertToOpenAIFormatParams {
  readable: ReadableStream;
  writable: WritableStream;
  created: number;
  model: string;
}

/**
 * Convert the response from Coze API to OpenAI format
 * {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-3.5-turbo-0125", "system_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{"role":"assistant","content":""},"logprobs":null,"finish_reason":null}]}
 * {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-3.5-turbo-0125", "system_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{"content":"Hello"},"logprobs":null,"finish_reason":null}]}
 * {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-3.5-turbo-0125", "system_fingerprint": "fp_44709d6fcb", "choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":"stop"}]}
 */
const convertToOpenAIFormat = async (params: IConvertToOpenAIFormatParams) => {
  const reader = params.readable.getReader();
  const writer = params.writable.getWriter();

  const openAiTemplate = ({
    created,
    model,
    message,
    finish_reason,
    conversation_id,
  }: {
    created: number;
    model: string;
    message: { role: string; content: string };
    finish_reason: null | string;
    conversation_id?: string;
  }) =>
    JSON.stringify({
      id: `chatcmpl-${conversation_id ?? Date.now()}`,
      object: 'chat.completion.chunk',
      created,
      model,
      system_fingerprint: 'fp_44709d6fcb',
      choices: [{ index: 0, delta: message, logprobs: null, finish_reason }],
    });

  const msg2Obj = (msg: string) => JSON.parse(msg.replace('data:', '').trim());
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const newline = '\n';
  const delimiter = '\n\n';
  const encodedNewline = encoder.encode(newline);

  let buffer = '';
  let finished = false;

  while (!finished) {
    const { value, done } = await reader.read();
    if (done) {
      if (buffer) {
        break;
      } else {
        finished = true;
      }
    }
    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split(delimiter);
    for (let i = 0; i < lines.length - 1; i++) {
      let { event, message, conversation_id, is_finish } = msg2Obj(lines[i]);
      if (['error', 'done'].includes(event)) {
        finished = true;
        buffer = lines[i];
        break;
      }

      if (message?.type !== 'answer' || message?.role !== 'assistant') {
        continue;
      }

      const openAIFormat = openAiTemplate({
        created: params.created,
        model: params.model,
        message: is_finish ? delimiter : message,
        finish_reason: is_finish ? 'stop' : null,
        conversation_id,
      });
      await writer.write(encoder.encode('data: ' + openAIFormat + delimiter));
    }

    buffer = lines[lines.length - 1];
  }

  if (buffer) {
    const { event, code, msg } = msg2Obj(buffer);
    if (code && msg) {
      await writer.write(
        encoder.encode(
          `data: ${openAiTemplate({
            created: params.created,
            model: params.model,
            message: { role: 'assistant', content: msg },
            finish_reason: 'stop',
            conversation_id: '123',
          })}${delimiter}`
        )
      );
      await writer.write(encoder.encode('data: [DONE]' + delimiter));
      await writer.write(encodedNewline);
    }
    if (event === 'done') {
      await writer.write(encoder.encode('data: [DONE]' + delimiter));
      await writer.write(encodedNewline);
    }
  }
  writer.close();
};

const proxy: IProxy = async (action: string, body: any, env: Env) => {
  if (env.COZE_BOT_IDS && typeof env.COZE_BOT_IDS === 'string') env.COZE_BOT_IDS = JSONParse(env.COZE_BOT_IDS);
  if (!isNotEmpty(env.COZE_BOT_IDS)) {
    return new Response('404 Not Found', { status: 404 });
  }

  let [gpt35, gpt4] = Array(2).fill(env.COZE_BOT_IDS[0].botId);
  const otherMapping: { [key: string]: string } = {};

  if (listLen(env.COZE_BOT_IDS) > 1) {
    env.COZE_BOT_IDS.forEach((item) => {
      if (item.gpt35Default || item.gpt4Default) {
        if (item.gpt35Default) gpt35 = item.botId;
        if (item.gpt4Default) gpt4 = item.botId;
      } else {
        otherMapping[item.modelName] = item.botId;
      }
    });
  }

  const models_mapping = generativeModelMappings(gpt35, gpt4, otherMapping);
  if (action === 'models') return models(models_mapping);

  const created = parseInt((Date.now() / 1000).toFixed(0));

  // Only chat/completions is supported
  if (!['chat/completions'].includes(action)) {
    return new Response('404 Not Found', { status: 404 });
  }

  let bot_id = '';
  // if the model is number, then use it as bot_id
  if (body?.model && !isNaN(Number(body?.model))) {
    bot_id = body?.model;
  } else {
    bot_id = models_mapping[body?.model as OPEN_AI_MODELS] ?? gpt35;
  }

  const stream = Boolean(body?.stream);
  const query = body?.messages?.slice(-1)?.[0]?.content || '';
  const chat_history = body?.messages?.slice(0, -1) || [];
  const custom_variables = Object.create(null);

  if (!env.COZE_API_URL) {
    return new Response('COZE_API_URL environment variable is not defined', { status: 500 });
  }

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Host: 'api.coze.com',
      Connection: 'keep-alive',
      Authorization: `Bearer ${env.COZE_API_KEY}`,
    },
    body: JSON.stringify({ bot_id, conversation_id: '', user: 'User', query, chat_history, stream, custom_variables }),
  };

  let { readable, writable } = new TransformStream();
  let response = await fetch(env.COZE_API_URL, payload);
  response = new Response(response.body, response);
  response.headers.set('Access-Control-Allow-Origin', '*');

  if (!body?.stream) {
    const data: any = await gatherResponse(response);
    if (data?.code !== 0) {
      return new Response(JSON.stringify({ error: data?.msg, code: data?.code }), { status: 400 });
    }
    return new Response(
      JSON.stringify({
        id: `chatcmpl-${data?.conversation_id ?? Date.now()}`,
        object: 'chat.completion',
        created,
        model: body?.model ?? 'gpt-3.5-turbo-1106',
        system_fingerprint: 'fp_44709d6fcb',
        choices: [
          {
            index: 0,
            message: isNotEmpty(data?.messages) ? data.messages.filter((item: any) => item?.role === 'assistant' && item?.type === 'answer') : [],
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 9,
          completion_tokens: 12,
          total_tokens: 21,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  convertToOpenAIFormat({
    model: body?.model ?? 'gpt-3.5-turbo-1106',
    created,
    readable: response.body as ReadableStream,
    writable,
  });
  return new Response(readable, response);
};

export default proxy;
