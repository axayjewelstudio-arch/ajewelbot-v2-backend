const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/subcategories', productController.getSubcategories);
router.get('/styles', productController.getStyles);
router.get('/:id', productController.getProductById);

module.exports = router;
