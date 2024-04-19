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
const proxy: IProxy = (request: Request, token: string, body: any, url: URL, env: Env) => {
  const payload = {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : '{}',
  };
  const action = url.pathname.replace(/^\/+v1\/+/, '');
  return fetch(`${env.OPENAI_GATEWAY_URL ?? 'https://api.openai.com/v1'}/${action}`, payload);
};

export default proxy;
