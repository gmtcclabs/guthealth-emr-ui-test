export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }
    
    try {
      // For root path, serve index.html
      if (url.pathname === '/') {
        const indexRequest = new Request(`${url.origin}/index.html`, request);
        return await env.ASSETS.fetch(indexRequest);
      }
      
      return await env.ASSETS.fetch(request);
    } catch (e) {
      // Fallback to index.html for SPA routing
      try {
        const indexRequest = new Request(`${url.origin}/index.html`, request);
        return await env.ASSETS.fetch(indexRequest);
      } catch (fallbackError) {
        return new Response('Not found', { status: 404 });
      }
    }
  },
};

async function handleAPI(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  
  if (url.pathname === '/api/auth/callback') {
    return handleOAuthCallback(request, env);
  }
  
  if (url.pathname === '/webhooks') {
    return new Response('Webhook received', { status: 200 });
  }

  if (url.pathname === '/api/products') {
    return handleProducts(env);
  }

  if (url.pathname === '/api/checkout') {
    return handleCheckout(request, env);
  }
  
  return new Response('Not found', { status: 404 });
}

async function handleOAuthCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const shop = url.searchParams.get('shop');
  
  if (!code || !shop) {
    return new Response('Missing code or shop parameter', { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.SHOPIFY_API_KEY,
        client_secret: env.SHOPIFY_API_SECRET,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();
    
    // Store the access token (in production, save to database)
    // For now, redirect to success page
    return new Response(`
      <html>
        <body>
          <h1>App Installed Successfully!</h1>
          <p>Shop: ${shop}</p>
          <p>Access Token: ${tokenData.access_token}</p>
          <a href="https://${shop}/admin/apps">Return to Admin</a>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new Response('OAuth failed', { status: 500 });
  }
}

async function handleCheckout(request: Request, env: Env): Promise<Response> {
  try {
    const { productHandle, variantId } = await request.json();
    const shop = env.SHOPIFY_STORE_URL;
    
    // Use cart permalink to add product directly to cart
    const checkoutUrl = `https://${shop}/cart/${variantId}:1`;
    
    return new Response(JSON.stringify({
      checkoutUrl: checkoutUrl
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Checkout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleProducts(env: Env): Promise<Response> {
  try {
    // Fetch real products from Shopify Admin API
    const response = await fetch(`https://${env.SHOPIFY_STORE_URL}/admin/api/2024-01/products.json`, {
      headers: {
        'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Shopify products to match frontend interface
    const products = data.products.map((product: any) => ({
      id: product.id.toString(),
      title: product.title,
      handle: product.handle,
      description: product.body_html?.replace(/<[^>]*>/g, '') || '',
      vendor: product.vendor,
      product_type: product.product_type,
      priceRange: {
        minVariantPrice: {
          amount: `$${product.variants[0]?.price || '0.00'}`,
          currencyCode: "USD"
        }
      },
      variants: product.variants.map((variant: any) => ({
        id: variant.id.toString(),
        price: variant.price,
        compare_at_price: variant.compare_at_price
      })),
      images: product.images.map((image: any) => ({
        src: image.src,
        alt: image.alt
      }))
    }));

    return new Response(JSON.stringify(products), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

interface Env {
  ASSETS: Fetcher;
  SHOPIFY_API_SECRET: string;
  SHOPIFY_API_KEY: string;
  SHOPIFY_STORE_URL: string;
  SHOPIFY_ACCESS_TOKEN: string;
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: string;
}
