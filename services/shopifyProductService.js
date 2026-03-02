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

// ✅ Fetch all products
exports.getAllProducts = async (limit = 250) => {
  try {
    const response = await shopifyAPI.get(`/products.json?limit=${limit}`);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};

// ✅ Fetch products by collection
exports.getProductsByCollection = async (collectionId) => {
  try {
    const response = await shopifyAPI.get(`/collections/${collectionId}/products.json`);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching collection products:', error.message);
    throw error;
  }
};

// ✅ Fetch product by ID
exports.getProductById = async (productId) => {
  try {
    const response = await shopifyAPI.get(`/products/${productId}.json`);
    return response.data.product;
  } catch (error) {
    console.error('Error fetching product:', error.message);
    throw error;
  }
};

// ✅ Get all collections
exports.getAllCollections = async () => {
  try {
    const response = await shopifyAPI.get('/custom_collections.json');
    return response.data.custom_collections;
  } catch (error) {
    console.error('Error fetching collections:', error.message);
    throw error;
  }
};

// ✅ Search products
exports.searchProducts = async (query) => {
  try {
    const response = await shopifyAPI.get(`/products.json?title=${encodeURIComponent(query)}`);
    return response.data.products;
  } catch (error) {
    console.error('Error searching products:', error.message);
    throw error;
  }
};

// ✅ Format product for WhatsApp display
exports.formatProductForWhatsApp = (product) => {
  const variant = product.variants[0];
  return {
    id: product.id,
    title: product.title,
    price: `₹${variant.price}`,
    image: product.image?.src || '',
    sku: variant.sku || '',
    available: variant.inventory_quantity > 0,
    description: product.body_html?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
    variantId: variant.id
  };
};

// ✅ Get products by tag
exports.getProductsByTag = async (tag) => {
  try {
    const response = await shopifyAPI.get(`/products.json?product_type=${encodeURIComponent(tag)}`);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products by tag:', error.message);
    throw error;
  }
};
