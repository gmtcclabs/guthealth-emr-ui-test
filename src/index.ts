export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }
    
    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response('Not found', { status: 404 });
    }
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

  if (url.pathname === '/api/products') {
    return handleProducts(env);
  }
  
  return new Response('Not found', { status: 404 });
}

async function handleProducts(env: Env): Promise<Response> {
  try {
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
      description: product.body_html?.replace(/<[^>]*>/g, '') || '', // Strip HTML
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
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    
    // Fallback to mock data if Shopify API fails
    const fallbackProducts = [
      {
        id: "1",
        title: "Gut Health Assessment Kit",
        handle: "gut-health-assessment-kit",
        description: "Comprehensive gut microbiome analysis with personalized recommendations.",
        vendor: "GutHealth EMR",
        product_type: "Health Assessment",
        priceRange: { minVariantPrice: { amount: "$199.00", currencyCode: "USD" } },
        variants: [{ id: "1", price: "199.00", compare_at_price: "249.00" }],
        images: []
      }
    ];

    return new Response(JSON.stringify(fallbackProducts), {
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
}
