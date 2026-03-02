const shopifyProductService = require('../services/shopifyProductService');
const categoryService = require('../services/categoryService');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await shopifyProductService.getAllProducts();
    const formatted = products.map(p => shopifyProductService.formatProductForWhatsApp(p));
    
    res.json({
      success: true,
      count: formatted.length,
      products: formatted
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await shopifyProductService.getProductById(req.params.id);
    const formatted = shopifyProductService.formatProductForWhatsApp(product);
    
    res.json({
      success: true,
      product: formatted
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const products = await shopifyProductService.searchProducts(query);
    const formatted = products.map(p => shopifyProductService.formatProductForWhatsApp(p));
    
    res.json({
      success: true,
      count: formatted.length,
      products: formatted
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { customerType } = req.query;
    const categories = categoryService.getCategories(customerType);
    
    res.json({
      success: true,
      categories: Object.keys(categories)
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const { category, customerType } = req.query;
    const subcategories = categoryService.getSubcategories(category, customerType);
    
    res.json({
      success: true,
      subcategories: Object.keys(subcategories)
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStyles = async (req, res) => {
  try {
    const { category, subcategory, customerType } = req.query;
    const styles = categoryService.getStyles(category, subcategory, customerType);
    
    res.json({
      success: true,
      styles: styles
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
