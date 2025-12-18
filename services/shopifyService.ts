import { GraphQLClient, gql } from 'graphql-request';

const shopifyStoreDomain = process.env.SHOPIFY_STORE_DOMAIN;
const shopifyStorefrontApiToken = process.env.SHOPIFY_STOREFRONT_API_TOKEN;

if (!shopifyStoreDomain || !shopifyStorefrontApiToken) {
  throw new Error(
    'SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_API_TOKEN must be set in your .env.local file'
  );
}

const client = new GraphQLClient(
  `https://${shopifyStoreDomain}/api/2023-01/graphql.json`,
  {
    headers: {
      'X-Shopify-Storefront-Access-Token': shopifyStorefrontApiToken,
    },
  }
);

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  images: {
    edges: {
      node: {
        src: string;
        altText: string | null;
      };
    }[];
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

export const getProducts = async (): Promise<ShopifyProduct[]> => {
  const query = gql`
    {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
            images(first: 1) {
              edges {
                node {
                  src
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const response = await client.request<{ products: { edges: { node: ShopifyProduct }[] } }>(query);
  return response.products.edges.map((edge) => edge.node);
};