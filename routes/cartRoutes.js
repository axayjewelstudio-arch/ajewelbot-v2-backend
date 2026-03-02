const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/:customerPhone', cartController.getCart);
router.post('/:customerPhone/add', cartController.addToCart);
router.delete('/:customerPhone/:productId', cartController.removeFromCart);
router.put('/:customerPhone/:productId', cartController.updateQuantity);
router.delete('/:customerPhone', cartController.clearCart);

module.exports = router;
