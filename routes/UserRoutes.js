const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middlewares/auth');
const imageUpload = require('../helpers/image-upload');

const UserController = require('../controllers/UserController');

router.get('/register', UserController.registerView);
router.post('/register', UserController.register);
router.get('/logout', UserController.logout);
router.get('/login', UserController.loginView);
router.post('/login', UserController.login);
router.get('/profile',checkAuth, UserController.profile);
router.get('/profile/edit', checkAuth, UserController.editProfileView);
router.post('/profile/edit', checkAuth, imageUpload.single('image'), UserController.editProfile);
router.post('/profile/delete',checkAuth,UserController.deleteUser);

module.exports = router;
