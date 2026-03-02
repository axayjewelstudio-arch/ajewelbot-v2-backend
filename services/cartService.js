const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });

exports.getCart = (customerPhone) => {
  let cart = cache.get(customerPhone);
  if (!cart) {
    cart = {
      items: [],
      total: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    cache.set(customerPhone, cart);
  }
  return cart;
};

exports.addToCart = (customerPhone, product) => {
  const cart = exports.getCart(customerPhone);
  
  const existingItem = cart.items.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      id: product.id,
      variantId: product.variantId,
      title: product.title,
      price: parseFloat(product.price.replace('₹', '')),
      quantity: 1,
      image: product.image,
      sku: product.sku
    });
  }
  
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.updatedAt = new Date().toISOString();
  
  cache.set(customerPhone, cart);
  return cart;
};

exports.removeFromCart = (customerPhone, productId) => {
  const cart = exports.getCart(customerPhone);
  cart.items = cart.items.filter(item => item.id !== productId);
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.updatedAt = new Date().toISOString();
  cache.set(customerPhone, cart);
  return cart;
};

exports.updateQuantity = (customerPhone, productId, quantity) => {
  const cart = exports.getCart(customerPhone);
  const item = cart.items.find(item => item.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      return exports.removeFromCart(customerPhone, productId);
    }
    item.quantity = quantity;
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date().toISOString();
    cache.set(customerPhone, cart);
  }
  
  return cart;
};

exports.clearCart = (customerPhone) => {
  cache.del(customerPhone);
  return { items: [], total: 0 };
};

exports.formatCartForWhatsApp = (cart) => {
  if (!cart.items.length) {
    return 'Your cart is empty.';
  }
  
  let message = '*Your Cart:*\n\n';
  
  cart.items.forEach((item, index) => {
    message += `${index + 1}. ${item.title}\n`;
    message += `   Qty: ${item.quantity} × ₹${item.price} = ₹${(item.price * item.quantity).toFixed(2)}\n\n`;
  });
  
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*Total: ₹${cart.total.toFixed(2)}*`;
  
  return message;
};

exports.getCartItemCount = (customerPhone) => {
  const cart = exports.getCart(customerPhone);
  return cart.items.reduce((count, item) => count + item.quantity, 0);
};
