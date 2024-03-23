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
