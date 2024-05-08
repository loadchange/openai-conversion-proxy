import { models, generativeModelMappings, requestFactory, openAiPayload, corsAllowed } from '../utils';

/**
 * Documentation: https://platform.deepseek.com/api-docs/api/list-models/
 */
const MODELS = ['deepseek-coder', 'deepseek-chat'];

/**
 * Mapping of model names to their corresponding GPT versions.
 *
 * Model names:
 * - deepseek-coder (Good at coding tasks: 16K) => GPT-3.5 ALL
 * - deepseek-chat (Good at general tasks	32K) => GPT-4 ALL
 */
const MODELS_MAPPING = generativeModelMappings(
  'deepseek-coder',
  'deepseek-chat',
  MODELS.reduce((acc, model) => ({ ...acc, [model]: model }), {})
);

const proxy: IProxy = async (action: string, body: any, env: Env, builtIn?: boolean) => {
  if (action === 'models') return models(MODELS_MAPPING);

  if (body) {
    body.model = MODELS_MAPPING[body?.model as OPEN_AI_MODELS] ?? 'deepseek-chat';
  }
  const payload = openAiPayload({ token: env.DEEP_SEEK_TOKEN, body });

  const requestFunc = requestFactory(`https://api.deepseek.com/v1/${action}`);
  const response = await requestFunc(payload);
  const responseWithCors = corsAllowed(response);
  return responseWithCors;
};

export default proxy;
