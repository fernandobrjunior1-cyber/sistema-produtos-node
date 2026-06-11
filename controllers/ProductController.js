const Product = require("../models/Product");

module.exports = class ProductController {

    // Página inicial
    static async home(req, res) {
        res.render('home');
    }

    // Lista todos os produtos
    // Também permite pesquisar por nome
    static async showProducts(req, res) {

        const search = req.query.search || '';

        const products = await Product.find({
            name: {
                $regex: search,
                $options: 'i'
            }
        }).lean();

        res.render('products/all', {
            products,
            search
        });
    }


    // Exibe formulário de cadastro de produto
    static async createProduct(req, res) {
        res.render('products/create');
    }

    // Salva um novo produto
    static async createProductSave(req, res) {

        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            image: req.file ? req.file.filename : '',
            userId: req.session.userid
        });

        await product.save();

        req.flash(
            'success_msg',
            'Produto cadastrado com sucesso!'
        );

        res.redirect('/products');
    }

   // Exibe formulário de edição
static async ProductUpdate(req, res) {

    const id = req.params.id;

    const product = await Product.findOne({
        _id: id,
        userId: req.session.userid
    }).lean();

    // Verifica se o produto existe e pertence ao usuário
    if (!product) {

        req.flash(
            'error_msg',
            'Produto não encontrado'
        );

        return res.redirect('/products');
    }

    // Envia os dados para preencher o formulário
    res.render('products/edit', {
        product
    });
}

    

    // Salva alterações do produto
    static async ProductUpdateSave(req, res) {

        const id = req.params.id;

        const product = {
            name: req.body.name,
            price: req.body.price
        };

        // Atualiza imagem somente se uma nova foi enviada
        if (req.file) {
            product.image = req.file.filename;
        }

       await Product.findOneAndUpdate(
    {
        _id: id,
        userId: req.session.userid
    },
    product
);

        req.flash(
            'success_msg',
            'Produto alterado com sucesso!'
        );

        res.redirect('/products');
    }

    // Exclui produto
    static async ProductDelete(req, res) {

        const id = req.params.id;

        await Product.findOneAndDelete({
        _id: id,
        userId: req.session.userid
         });

        req.flash(
            'success_msg',
            'Produto excluído com sucesso!'
        );

        res.redirect('/products');
    }

    static async dashboard(req, res) {

    const products = await Product.find({
        userId: req.session.userid
    }).lean();

    res.render('products/dashboard', {
        products
    });
}

};