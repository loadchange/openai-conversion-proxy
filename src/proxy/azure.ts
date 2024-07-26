import { models, generativeModelMappings, isNotEmpty, objKeys, listLen, requestFactory, streamByOpenAI } from '../utils';

/**
 * Due to varying quota limits across different regions when deploying models on Microsoft Azure,
 * it is necessary to perform region mapping. Most models are located in West US,
 * text-embedding-3-large and text-embedding-3-small, are in the EASTUS region.
 * @param model
 * @returns
 */
const getResourceNameAndToken = (model: string, env: Env): { resourceName: string, token: string, deployName: string } => {
  const resourceInfo = { resourceName: '', token: '', deployName: '' };
  if (!listLen(objKeys(env.AZURE_API_KEYS)) || !listLen(objKeys(env.AZURE_DEPLOY_NAME))) return resourceInfo;
  const deploy = env.AZURE_DEPLOY_NAME![model];

  if (deploy) {
    resourceInfo.resourceName = deploy.resourceName;
    resourceInfo.token = env.AZURE_API_KEYS![deploy.resourceName];
    resourceInfo.deployName = deploy.deployName;
  } else {
    if (model.startsWith('gpt-')) {
      const models = objKeys(env.AZURE_DEPLOY_NAME);
      for (let i = 0; i < models.length; i++) {
        const current = env.AZURE_DEPLOY_NAME![models[i]];
        if (model.startsWith('gpt-4') && current.gpt4Default) {
          resourceInfo.resourceName = current.resourceName;
          resourceInfo.token = env.AZURE_API_KEYS![current.resourceName];
          resourceInfo.deployName = current.deployName;
          break;
        }
        if (model.startsWith('gpt-3') && current.gpt35Default) {
          resourceInfo.resourceName = current.resourceName;
          resourceInfo.token = env.AZURE_API_KEYS![current.resourceName];
          resourceInfo.deployName = current.deployName;
          break;
        }
      }
    }
  }
  return resourceInfo;
};

const proxy: IProxy = async (action: string, body: any, env: Env, builtIn?: boolean) => {


  if (action === 'models') return models(generativeModelMappings('azure'));

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

  const { resourceName, token, deployName } = getResourceNameAndToken(body?.model as string ?? 'gpt-3.5-turbo-0125', env);
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
