import { models, generativeModelMappings, requestFactory, openAiPayload, corsAllowed } from '../utils';

/**
 * Documentation: https://console.groq.com/docs/models
 */
const MODELS = ['llama3-8b-8192', 'llama3-70b-8192', 'llama2-70b-4096', 'mixtral-8x7b-32768', 'gemma-7b-it'];

/**
 * Mapping of model names to their corresponding GPT versions.
 *
 * Model names:
 * - Mixtral_8x7b_32k (mixtral-8x7b-32768) => GPT-3.5 ALL
 * - LLaMA3_70b_8k (llama3-70b-8192) => GPT-4 ALL
 */
const MODELS_MAPPING = generativeModelMappings(
  'mixtral-8x7b-32768',
  'llama3-70b-8192',
  MODELS.reduce((acc, model) => ({ ...acc, [model]: model }), {})
);

const proxy: IProxy = async (action: string, body: any, env: Env, builtIn?: boolean) => {
  if (action === 'models') return models(MODELS_MAPPING);

  if (body) {
    body.model = MODELS_MAPPING[body?.model as OPEN_AI_MODELS] ?? 'llama3-70b-8192';
  }
  const payload = openAiPayload({ token: env.GROQ_CLOUD_TOKEN, body });

  const groqGatewayUrl = env.GROQ_GATEWAY_URL ?? 'https://api.groq.com/openai/v1';
  const requestFunc = requestFactory(`${groqGatewayUrl}/${action}`);
  const response = await requestFunc(payload);
  const responseWithCors = corsAllowed(response);
  return responseWithCors;
};

export default proxy;
