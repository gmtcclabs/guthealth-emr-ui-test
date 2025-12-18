const products = [
  {
    title: "Gut Health Assessment",
    body_html: "Comprehensive gut health analysis and personalized recommendations",
    vendor: "GutHealth EMR",
    product_type: "Health Service",
    variants: [{ price: "99.00", inventory_quantity: 100 }]
  },
  {
    title: "Probiotic Supplement - 30 Day Supply",
    body_html: "Premium probiotic blend for digestive health",
    vendor: "GutHealth EMR", 
    product_type: "Supplement",
    variants: [{ price: "49.99", inventory_quantity: 50 }]
  },
  {
    title: "Digestive Health Consultation",
    body_html: "One-on-one consultation with certified nutritionist",
    vendor: "GutHealth EMR",
    product_type: "Consultation", 
    variants: [{ price: "149.00", inventory_quantity: 20 }]
  }
];

async function createProducts() {
  for (const product of products) {
    const response = await fetch(`${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product })
    });
    
    if (response.ok) {
      console.log(`Created: ${product.title}`);
    } else {
      console.error(`Failed to create: ${product.title}`);
    }
  }
}

createProducts();
