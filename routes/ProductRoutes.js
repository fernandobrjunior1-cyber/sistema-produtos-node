const productController = require('../controllers/ProductController');
const express = require('express');
const router = express.Router();
const imageUpload = require('../helpers/image-upload');
const { checkAuth } = require('../middlewares/auth');


router.get('/', productController.home);
router.get('/products', productController.showProducts);
router.get('/create',checkAuth, productController.createProduct);
router.post('/create/save',checkAuth,imageUpload.single('image'),productController.createProductSave);
router.get('/update/:id',checkAuth, productController.ProductUpdate);
router.post('/update/save/:id',checkAuth, productController.ProductUpdateSave);
router.post('/delete/:id',checkAuth, productController.ProductDelete);
router.get('/dashboard',checkAuth, productController.dashboard);

module.exports = router;    