const products = [
  {
    title: "Gut Health Assessment",
    descriptionHtml: "Comprehensive gut health analysis",
    productType: "Health Service",
    vendor: "GutHealth EMR",
    variants: [{ price: "99.00" }]
  },
  {
    title: "Probiotic Supplement",
    descriptionHtml: "Premium probiotic blend",
    productType: "Supplement", 
    vendor: "GutHealth EMR",
    variants: [{ price: "49.99" }]
  },
  {
    title: "Health Consultation",
    descriptionHtml: "One-on-one consultation",
    productType: "Consultation",
    vendor: "GutHealth EMR", 
    variants: [{ price: "149.00" }]
  }
];

const mutation = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product { id title }
      userErrors { field message }
    }
  }
`;

products.forEach(product => {
  console.log(`
shopify app generate graphql-query --query='${mutation}' --variables='{"input":${JSON.stringify(product)}}'
  `);
});

console.log("Run these commands in your terminal to create products:");
