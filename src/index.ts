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
  const products = [
    {
      id: "1",
      title: "Gut Health Assessment Kit",
      handle: "gut-health-assessment-kit",
      description: "Comprehensive gut microbiome analysis with personalized recommendations. Includes sample collection kit, lab analysis, and detailed health report with dietary suggestions.",
      vendor: "GutHealth EMR",
      product_type: "Health Assessment",
      priceRange: {
        minVariantPrice: {
          amount: "$199.00",
          currencyCode: "USD"
        }
      },
      variants: [{ id: "1", price: "199.00", compare_at_price: "249.00" }],
      images: []
    },
    {
      id: "2", 
      title: "Premium Probiotic Supplement - 30 Day Supply",
      handle: "premium-probiotic-supplement-30-day",
      description: "Advanced multi-strain probiotic formula with 50 billion CFU. Supports digestive health, immune function, and gut microbiome balance. 30 capsules per bottle.",
      vendor: "GutHealth EMR",
      product_type: "Supplement",
      priceRange: {
        minVariantPrice: {
          amount: "$49.99",
          currencyCode: "USD"
        }
      },
      variants: [{ id: "2", price: "49.99", compare_at_price: "59.99" }],
      images: []
    },
    {
      id: "3",
      title: "Digestive Health Consultation", 
      handle: "digestive-health-consultation",
      description: "One-on-one virtual consultation with certified nutritionist specializing in gut health. 60-minute session includes personalized meal plan and supplement recommendations.",
      vendor: "GutHealth EMR",
      product_type: "Consultation",
      priceRange: {
        minVariantPrice: {
          amount: "$149.00",
          currencyCode: "USD"
        }
      },
      variants: [{ id: "3", price: "149.00", compare_at_price: "199.00" }],
      images: []
    },
    {
      id: "4",
      title: "Microbiome Test Kit - Advanced Analysis",
      handle: "microbiome-test-kit-advanced", 
      description: "State-of-the-art microbiome sequencing with comprehensive bacterial diversity analysis. Includes actionable insights for diet, lifestyle, and supplement optimization.",
      vendor: "GutHealth EMR",
      product_type: "Health Test",
      priceRange: {
        minVariantPrice: {
          amount: "$299.00",
          currencyCode: "USD"
        }
      },
      variants: [{ id: "4", price: "299.00", compare_at_price: "399.00" }],
      images: []
    },
    {
      id: "5",
      title: "Gut Health Starter Bundle",
      handle: "gut-health-starter-bundle",
      description: "Complete gut health package including probiotic supplement, digestive enzymes, and fiber blend. Perfect for beginners starting their gut health journey.",
      vendor: "GutHealth EMR", 
      product_type: "Bundle",
      priceRange: {
        minVariantPrice: {
          amount: "$89.99",
          currencyCode: "USD"
        }
      },
      variants: [{ id: "5", price: "89.99", compare_at_price: "119.99" }],
      images: []
    }
  ];

  return new Response(JSON.stringify(products), {
    headers: { 'Content-Type': 'application/json' }
  });
}

interface Env {
  ASSETS: Fetcher;
  SHOPIFY_API_SECRET: string;
  SHOPIFY_API_KEY: string;
}
