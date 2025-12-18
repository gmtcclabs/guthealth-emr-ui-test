export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }
    
    // Handle cart URLs
    if (url.pathname.startsWith('/cart/')) {
      return handleCartRedirect(url, env);
    }
    
    try {
      if (url.pathname === '/') {
        const indexRequest = new Request(`${url.origin}/index.html`, request);
        return await env.ASSETS.fetch(indexRequest);
      }
      
      return await env.ASSETS.fetch(request);
    } catch (e) {
      try {
        const indexRequest = new Request(`${url.origin}/index.html`, request);
        return await env.ASSETS.fetch(indexRequest);
      } catch (fallbackError) {
        return new Response('Not found', { status: 404 });
      }
    }
  },
};

async function handleCartRedirect(url: URL, env: Env): Promise<Response> {
  // Extract variant ID and quantity from path like /cart/47227197325538:1
  const cartPath = url.pathname.replace('/cart/', '');
  
  // Redirect to actual Shopify store cart
  const shopifyCartUrl = `https://testing-1234563457896534798625436789983.myshopify.com/cart/${cartPath}`;
  
  return Response.redirect(shopifyCartUrl, 302);
}

async function handleAPI(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  
  if (url.pathname === '/api/auth/callback') {
    return handleOAuthCallback(request, env);
  }
  
  if (url.pathname === '/api/webhooks') {
    return handleWebhooks(request, env);
  }

  if (url.pathname === '/api/products') {
    return handleProducts(env);
  }

  if (url.pathname === '/api/cart/create') {
    return handleCartCreate(request, env);
  }

  if (url.pathname === '/api/orders') {
    return handleOrders(request, env);
  }

  if (url.pathname === '/api/customers') {
    return handleCustomers(request, env);
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
    
    // Get Storefront API access token
    let storefrontToken = null;
    try {
      const storefrontResponse = await fetch(`https://${shop}/admin/api/2024-01/storefront_access_tokens.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': tokenData.access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storefront_access_token: {
            title: 'GutHealth EMR Storefront Token'
          }
        })
      });
      
      if (storefrontResponse.ok) {
        const storefrontData = await storefrontResponse.json();
        storefrontToken = storefrontData.storefront_access_token?.access_token;
      }
    } catch (error) {
      console.error('Failed to create Storefront API token:', error);
    }
    
    return new Response(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>✅ GutHealth EMR App Installed Successfully!</h1>
          <p><strong>Store:</strong> ${shop}</p>
          <p><strong>Admin API Token:</strong> ${tokenData.access_token}</p>
          ${storefrontToken ? `<p><strong>Storefront API Token:</strong> ${storefrontToken}</p>` : '<p>⚠️ Storefront API token not created - check app scopes</p>'}
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: left;">
            <h3>🔧 Setup Commands:</h3>
            <p><strong>1. Set Admin API Token:</strong></p>
            <code style="background: #333; color: #fff; padding: 8px; display: block; margin: 8px 0;">
              echo "${tokenData.access_token}" | npx wrangler secret put SHOPIFY_ACCESS_TOKEN
            </code>
            
            ${storefrontToken ? `
              <p><strong>2. Set Storefront API Token:</strong></p>
              <code style="background: #333; color: #fff; padding: 8px; display: block; margin: 8px 0;">
                echo "${storefrontToken}" | npx wrangler secret put SHOPIFY_STOREFRONT_ACCESS_TOKEN
              </code>
            ` : `
              <p><strong>2. Storefront API Token:</strong> Not available - check app configuration</p>
            `}
          </div>
          
          <p>Your app is now connected and ready to process orders.</p>
          <a href="https://${shop}/admin/apps" style="background: #374C7A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Return to Admin</a>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new Response(`OAuth failed: ${error.message}`, { status: 500 });
  }
}

async function handleWebhooks(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.text();
    const topic = request.headers.get('X-Shopify-Topic');
    
    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
        return handleOrderCreated(JSON.parse(body), env);
      case 'orders/updated':
        return handleOrderUpdated(JSON.parse(body), env);
      case 'app/uninstalled':
        return handleAppUninstalled(JSON.parse(body), env);
      default:
        console.log(`Unhandled webhook: ${topic}`);
    }
    
    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    return new Response('Webhook failed', { status: 500 });
  }
}

async function handleOrderCreated(order: any, env: Env): Promise<Response> {
  // Create EMR record for new order
  const emrRecord = {
    orderId: order.id,
    customerEmail: order.email,
    customerName: `${order.billing_address?.first_name} ${order.billing_address?.last_name}`,
    products: order.line_items.map((item: any) => ({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity
    })),
    status: 'order_placed',
    createdAt: new Date().toISOString()
  };
  
  // In production, save to database
  console.log('EMR Record Created:', emrRecord);
  
  return new Response('Order processed', { status: 200 });
}

async function handleOrderUpdated(order: any, env: Env): Promise<Response> {
  // Update EMR record based on order status
  const statusMapping: { [key: string]: string } = {
    'fulfilled': 'kit_shipped',
    'delivered': 'kit_received'
  };
  
  const emrStatus = statusMapping[order.fulfillment_status] || order.financial_status;
  
  console.log(`Order ${order.id} updated to: ${emrStatus}`);
  
  return new Response('Order updated', { status: 200 });
}

async function handleAppUninstalled(data: any, env: Env): Promise<Response> {
  console.log('App uninstalled from:', data.domain);
  return new Response('App uninstalled', { status: 200 });
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
    
    const products = data.products.map((product: any) => ({
      id: product.id.toString(),
      title: product.title,
      handle: product.handle,
      description: product.body_html?.replace(/<[^>]*>/g, '') || '',
      vendor: product.vendor,
      product_type: product.product_type,
      priceRange: {
        minVariantPrice: {
          amount: `HKD ${product.variants[0]?.price || '0.00'}`,
          currencyCode: "HKD"
        }
      },
      variants: product.variants.map((variant: any) => ({
        id: variant.id.toString(),
        price: variant.price,
        compare_at_price: variant.compare_at_price,
        available: variant.inventory_quantity > 0
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

async function handleCartCreate(request: Request, env: Env): Promise<Response> {
  try {
    const { variantId, quantity = 1 } = await request.json();
    
    // Check if we have Storefront API token
    if (env.SHOPIFY_STOREFRONT_ACCESS_TOKEN && env.SHOPIFY_STOREFRONT_ACCESS_TOKEN !== 'your-storefront-access-token-here') {
      // Use Storefront API to create cart with checkoutUrl
      const cartMutation = `
        mutation cartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
              totalQuantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const variables = {
        input: {
          lines: [{
            merchandiseId: `gid://shopify/ProductVariant/${variantId}`,
            quantity: quantity
          }]
        }
      };
      
      const response = await fetch(`https://${env.SHOPIFY_STORE_URL}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
        },
        body: JSON.stringify({
          query: cartMutation,
          variables: variables
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.data?.cartCreate?.cart?.checkoutUrl) {
          return new Response(JSON.stringify({
            checkoutUrl: data.data.cartCreate.cart.checkoutUrl,
            cartId: data.data.cartCreate.cart.id,
            totalQuantity: data.data.cartCreate.cart.totalQuantity
          }), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
    }
    
    // Fallback: Use direct cart URL
    const cartUrl = `https://${env.SHOPIFY_STORE_URL}/cart/${variantId}:${quantity}`;
    
    return new Response(JSON.stringify({
      checkoutUrl: cartUrl,
      cartId: `fallback_${Date.now()}`,
      totalQuantity: quantity
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Cart creation error:', error);
    
    // Final fallback
    const { variantId, quantity = 1 } = await request.json();
    const cartUrl = `https://${env.SHOPIFY_STORE_URL}/cart/${variantId}:${quantity}`;
    
    return new Response(JSON.stringify({
      checkoutUrl: cartUrl,
      cartId: `error_fallback_${Date.now()}`,
      totalQuantity: quantity
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function handleOrders(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const customerEmail = url.searchParams.get('email');
    
    let ordersUrl = `https://${env.SHOPIFY_STORE_URL}/admin/api/2024-01/orders.json?status=any&limit=50`;
    
    if (customerEmail) {
      ordersUrl += `&email=${encodeURIComponent(customerEmail)}`;
    }
    
    const response = await fetch(ordersUrl, {
      headers: {
        'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    
    const orders = data.orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      email: order.email,
      createdAt: order.created_at,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      totalPrice: order.total_price,
      currency: order.currency,
      lineItems: order.line_items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        sku: item.sku
      })),
      shippingAddress: order.shipping_address,
      trackingNumbers: order.fulfillments?.map((f: any) => f.tracking_number).filter(Boolean) || []
    }));

    return new Response(JSON.stringify(orders), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleCustomers(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const response = await fetch(`https://${env.SHOPIFY_STORE_URL}/admin/api/2024-01/customers/search.json?query=email:${encodeURIComponent(email)}`, {
      headers: {
        'X-Shopify-Access-Token': env.SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    
    const customers = data.customers.map((customer: any) => ({
      id: customer.id,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      createdAt: customer.created_at,
      ordersCount: customer.orders_count,
      totalSpent: customer.total_spent,
      addresses: customer.addresses
    }));

    return new Response(JSON.stringify(customers), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch customer' }), {
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
