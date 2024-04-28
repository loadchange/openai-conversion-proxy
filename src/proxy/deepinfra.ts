import { models, generativeModelMappings, JSONParse, isNotEmpty, listLen } from '../utils';

const proxy: IProxy = async (request: Request, body: any, url: URL, env: Env) => {
  const action = url.pathname.replace(/^\/+v1\/+/, '');

  if (env.DEEPINFRA_DEPLOY_NAME && typeof env.DEEPINFRA_DEPLOY_NAME === 'string') env.DEEPINFRA_DEPLOY_NAME = JSONParse(env.DEEPINFRA_DEPLOY_NAME);
  if (!isNotEmpty(env.DEEPINFRA_DEPLOY_NAME)) {
    return new Response('404 Not Found', { status: 404 });
  }

  let [gpt35, gpt4] = Array(2).fill(env.DEEPINFRA_DEPLOY_NAME[0].modelName);
  const otherMapping: { [key: string]: string } = Object.create(null);

  if (listLen(env.DEEPINFRA_DEPLOY_NAME) > 1) {
    env.DEEPINFRA_DEPLOY_NAME.forEach((item) => {
      if (item.alias) otherMapping[item.alias] = item.modelName;
      if (item.modelName) otherMapping[item.modelName] = item.modelName;
      if (item.gpt35Default || item.gpt4Default) {
        if (item.gpt35Default) gpt35 = item.modelName;
        if (item.gpt4Default) gpt4 = item.modelName;
      }
    });
  }

  const MODELS_MAPPING = generativeModelMappings(gpt35, gpt4, otherMapping);

  if (action === 'models') return models(MODELS_MAPPING);

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.DEEPINFRA_API_KEY}`,
    },
    body: '{}',
  };
  if (body) {
    body.model = MODELS_MAPPING[body?.model as OPEN_AI_MODELS] ?? gpt35;
    payload.body = JSON.stringify(body);
  }
  return fetch(`https://api.deepinfra.com/v1/openai/${action}`, payload);
};

export default proxy;