import { models, generativeModelMappings, isNotEmpty, requestFactory, streamByOpenAI } from '../utils';

/**
 * Due to varying quota limits across different regions when deploying models on Microsoft Azure,
 * it is necessary to perform region mapping. Most models are located in West US,
 * text-embedding-3-large and text-embedding-3-small, are in the EASTUS region.
 * @param model
 * @returns
 */
const getResourceNameAndToken = (model: string, env: Env) => {
  const resourceInfo = Object.create(null);
  if (!isNotEmpty(env.AZURE_API_KEYS)) return resourceInfo;
  for (let i = 0; i < env.AZURE_API_KEYS.length; i++) {
    const item = env.AZURE_API_KEYS[i];
    if (isNotEmpty<string>(item.models) && item.models.includes(model)) return item;
    if (item.default) {
      resourceInfo.resourceName = item.resourceName;
      resourceInfo.token = item.token;
    }
  }
  return resourceInfo;
};

const proxy: IProxy = async (action: string, body: any, env: Env, builtIn?: boolean) => {
  let models_mapping = Object.create(null);
  let [gpt35, gpt4] = ['', ''];
  if (isNotEmpty(env.AZURE_DEPLOY_NAME)) {
    env.AZURE_DEPLOY_NAME.forEach((item) => {
      if (item.gpt35Default) gpt35 = item.deployName;
      if (item.gpt4Default) gpt4 = item.deployName;
      models_mapping[item.modelName] = item.deployName;
    });
  }
  if (!gpt35) return new Response('404 Not Found', { status: 404 });
  models_mapping = generativeModelMappings(gpt35, gpt4, models_mapping);

  if (action === 'models') return models(models_mapping);

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': '',
    },
    body: JSON.stringify(body ?? {}),
  };

  if (!['chat/completions', 'images/generations', 'completions', 'embeddings'].includes(action)) {
    return new Response('404 Not Found', { status: 404 });
  }

  const deployName = models_mapping[body?.model as OPEN_AI_MODELS] ?? gpt35;

  const { resourceName, token } = getResourceNameAndToken(body?.model as string, env);
  if (!resourceName || !token) {
    return new Response('401 Unauthorized', { status: 401 });
  }

  payload.headers['api-key'] = token;

  const API_VERSION = env.AZURE_API_VERSION ?? '2024-05-01-preview';
  const fetchAPI = env.AZURE_GATEWAY_URL
    ? `${env.AZURE_GATEWAY_URL}/${resourceName}/${deployName}/${action}?api-version=${API_VERSION}`
    : `https://${resourceName}.openai.azure.com/openai/deployments/${deployName}/${action}?api-version=${API_VERSION}`;

  const requestFunc = requestFactory(fetchAPI);
  const response = await requestFunc(payload);

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
