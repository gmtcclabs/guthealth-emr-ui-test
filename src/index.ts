export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }
    
    return env.ASSETS.fetch(request);
  },
};

async function handleAPI(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  
  if (url.pathname === '/api/auth/callback') {
    return new Response('Auth callback handled', { status: 200 });
  }
  
  if (url.pathname === '/webhooks') {
    return new Response('Webhook received', { status: 200 });
  }
  
  return new Response('Not found', { status: 404 });
}

interface Env {
  ASSETS: Fetcher;
  SHOPIFY_API_SECRET: string;
  SHOPIFY_API_KEY: string;
}
