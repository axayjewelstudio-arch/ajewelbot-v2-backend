const cartService = require('../services/cartService');
const shopifyProductService = require('../services/shopifyProductService');

exports.getCart = async (req, res) => {
  try {
    const { customerPhone } = req.params;
    const cart = cartService.getCart(customerPhone);
    
    res.json({
      success: true,
      cart: cart,
      itemCount: cartService.getCartItemCount(customerPhone),
      formatted: cartService.formatCartForWhatsApp(cart)
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { customerPhone } = req.params;
    const { productId } = req.body;
    
    const product = await shopifyProductService.getProductById(productId);
    const formatted = shopifyProductService.formatProductForWhatsApp(product);
    
    const cart = cartService.addToCart(customerPhone, formatted);
    
    res.json({
      success: true,
      message: 'Item added to cart',
      cart: cart,
      itemCount: cartService.getCartItemCount(customerPhone)
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { customerPhone, productId } = req.params;
    const cart = cartService.removeFromCart(customerPhone, productId);
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: cart
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { customerPhone, productId } = req.params;
    const { quantity } = req.body;
    
    const cart = cartService.updateQuantity(customerPhone, productId, quantity);
    
    res.json({
      success: true,
      message: 'Quantity updated',
      cart: cart
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const { customerPhone } = req.params;
    const cart = cartService.clearCart(customerPhone);
    
    res.json({
      success: true,
      message: 'Cart cleared',
      cart: cart
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
