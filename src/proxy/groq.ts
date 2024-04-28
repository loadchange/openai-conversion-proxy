import { models, generativeModelMappings } from '../utils';
import { google_search_description } from '../tools/google_search';
import { stream } from './openai';

/**
 * LLaMA3 8b
 * Model ID: llama3-8b-8192
 * Developer: Meta
 * Context Window: 8,192 tokens
 * Model Card: https://huggingface.co/meta-llama/Meta-Llama-3-8B
 *
 * LLaMA3 70b
 * Model ID: llama3-70b-8192
 * Developer: Meta
 * Context Window: 8,192 tokens
 * Model Card: https://huggingface.co/meta-llama/Meta-Llama-3-70B
 *
 * LLaMA2 70b
 * Model ID: llama2-70b-4096
 * Developer: Meta
 * Context Window: 4,096 tokens
 * Model Card: https://huggingface.co/meta-llama/Llama-2-70b
 *
 * Mixtral 8x7b
 * Model ID: mixtral-8x7b-32768
 * Developer: Mistral
 * Context Window: 32,768 tokens
 * Model Card: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
 *
 * Gemma 7b
 * Model ID: gemma-7b-it
 * Developer: Google
 * Context Window: 8,192 tokens
 * Model Card: https://huggingface.co/google/gemma-1.1-7b-it
 *
 * Documentation: https://console.groq.com/docs/models
 */

const MODELS = ['llama3-8b-8192', 'llama3-70b-8192', 'llama2-70b-4096', 'mixtral-8x7b-32768', 'gemma-7b-it'];
const [LLaMA3_8b_8k, LLaMA3_70b_8k, LLaMA2_70b_8k, Mixtral_8x7b_32k, Gemma_7b_8k] = MODELS;

const groqCloudRequest = (url: string) => (payload: any) => fetch(url, payload);

/**
 * LLaMA3_8b_8k => GPT-3.5 Turbo
 * LLaMA3_70b_8k => GPT-4 Turbo
 * Mixtral_8x7b_32k => GPT-4 Turbo 2024-04-09
 * Gemma_7b_8k => GPT-3.5 Turbo 0125
 */
const MODELS_MAPPING = generativeModelMappings(LLaMA3_8b_8k, LLaMA3_70b_8k, {
  'gpt-4-turbo-2024-04-09': Mixtral_8x7b_32k,
  'gpt-3.5-turbo-0125': Gemma_7b_8k,
  ...MODELS.reduce((acc, model) => ({ ...acc, [model]: model }), {}),
});

const proxy: IProxy = async (request: Request, body: any, url: URL, env: Env) => {
  const action = url.pathname.replace(/^\/+v1\/+/, '');

  if (action === 'models') return models(MODELS_MAPPING);

  const payload = {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.GROQ_CLOUD_TOKEN}`,
    },
    body: '{}',
  };
  if (body) {
    body.model = MODELS_MAPPING[body?.model as OPEN_AI_MODELS] ?? LLaMA2_70b_8k;
    if (!body?.tools && !body?.tool_choice && env.GOOGLE_API_KEY && env.GOOGLE_CSE_ID) {
      body.tools = [google_search_description];
      body.tool_choice = 'auto';
    }
    payload.body = JSON.stringify(body);
  }
  // return fetch(`https://api.groq.com/openai/v1/${action}`, payload);

  const groqCloudReq = groqCloudRequest(`https://api.groq.com/openai/v1/${action}`);
  const response = await groqCloudReq(payload);

  if (!body?.stream) return response;

  const { readable, writable } = new TransformStream();
  stream(response.body as ReadableStream, writable, env, payload, groqCloudReq);
  return new Response(readable, response);
};

export default proxy;
