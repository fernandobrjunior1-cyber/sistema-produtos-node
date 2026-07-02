const express = require('express');
const router = express.Router();
const Product = require('../models/Product')
const authApi = require('../middlewares/authApi');


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lista todos os produtos
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
router.get('/products', async (req, res) => {

    const produtos =
        await Product.find().lean();

    res.json(produtos);

});

router.get(
    '/products',authApi,
    async (req, res) => {
        
        const produtos =
            await Product.find().lean();

        res.json(produtos);

    }
);

router.get(
    '/products/:id',
    async (req, res) => {

        const produto =
            await Product.findById(
                req.params.id
            );

        res.json(produto);

    }
);

router.post(
    '/products',
    async (req, res) => {

            const produto =
            await Product.create({

                name: req.body.name,
                price: req.body.price

            });

        res.status(201).json(
            produto
        );

    }
);

const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {

    const { email, password } = req.body;

    if (
        email === 'admin@email.com' &&
        password === '123'
    ) {

        const token = jwt.sign(

            {
                email
            },

            'segredo',

            {
                expiresIn: '1h'
            }

        );

        return res.json({
            token
        });
    }

    res.status(401).json({
        message: 'Credenciais inválidas'
    });

});





module.exports = router;