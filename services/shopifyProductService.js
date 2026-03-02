const axios = require('axios');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || 'a-jewel-studio-3.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const shopifyAPI = axios.create({
  baseURL: `https://${SHOPIFY_STORE}/admin/api/2024-01`,
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    'Content-Type': 'application/json'
  }
});

exports.getAllProducts = async () => {
  try {
    const response = await shopifyAPI.get('/products.json?limit=250');
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};

exports.getProductsByCollection = async (collectionId) => {
  try {
    const response = await shopifyAPI.get(`/collections/${collectionId}/products.json`);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching collection products:', error.message);
    throw error;
  }
};

exports.getProductById = async (productId) => {
  try {
    const response = await shopifyAPI.get(`/products/${productId}.json`);
    return response.data.product;
  } catch (error) {
    console.error('Error fetching product:', error.message);
    throw error;
  }
};

exports.getAllCollections = async () => {
  try {
    const response = await shopifyAPI.get('/custom_collections.json');
    return response.data.custom_collections;
  } catch (error) {
    console.error('Error fetching collections:', error.message);
    throw error;
  }
};

exports.searchProducts = async (query) => {
  try {
    const response = await shopifyAPI.get(`/products.json?title=${encodeURIComponent(query)}`);
    return response.data.products;
  } catch (error) {
    console.error('Error searching products:', error.message);
    throw error;
  }
};

exports.formatProductForWhatsApp = (product) => {
  const variant = product.variants[0];
  return {
    id: product.id,
    variantId: variant.id,
    title: product.title,
    price: `₹${variant.price}`,
    image: product.image?.src || '',
    sku: variant.sku || '',
    available: variant.inventory_quantity > 0,
    description: product.body_html?.replace(/<[^>]*>/g, '').substring(0, 200) || ''
  };
};
