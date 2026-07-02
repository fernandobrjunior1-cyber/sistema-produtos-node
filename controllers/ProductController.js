// Importa o Model Product, que representa a coleção de produtos no MongoDB
const Product = require("../models/Product");

// Exporta uma classe responsável por controlar todas as ações relacionadas aos produtos
module.exports = class ProductController {

    // Página inicial da aplicação
    // Apenas renderiza a view "home"
    static async home(req, res) {
        res.render('home');
    }


    // Lista todos os produtos cadastrados
    // Também permite fazer uma pesquisa pelo nome do produto
    static async showProducts(req, res) {

        // Captura o termo digitado na URL
        // Exemplo: /products?search=notebook
        // Caso não exista pesquisa, define uma string vazia
        const search = req.query.search || '';

        // Busca os produtos no banco de dados
        // $regex permite pesquisar parte do nome
        // $options: 'i' torna a pesquisa sem diferença entre maiúsculas e minúsculas
        const products = await Product.find({
            name: {
                $regex: search,
                $options: 'i'
            }
        }).lean();

        // Envia os produtos encontrados e o texto da pesquisa para a página
        res.render('products/all', {
            products,
            search
        });
    }


    // Exibe o formulário para cadastrar um novo produto
    static async createProduct(req, res) {
        res.render('products/create');
    }


    // Salva um novo produto no banco de dados
    static async createProductSave(req, res) {

        // Cria uma nova instância do Model Product
        const product = new Product({

            // Nome informado no formulário
            name: req.body.name,

            // Preço informado no formulário
            price: req.body.price,

            // Salva o nome do arquivo enviado pelo Multer
            // Caso não exista imagem, salva uma string vazia
            image: req.file ? req.file.filename : '',

            // Associa o produto ao usuário que está logado
            // O ID do usuário está armazenado na sessão
            userId: req.session.userid
        });

        // Salva o novo produto no MongoDB
        await product.save();

        // Cria uma mensagem de sucesso usando connect-flash
        req.flash(
            'success_msg',
            'Produto cadastrado com sucesso!'
        );

        // Redireciona o usuário para a lista de produtos
        res.redirect('/products');
    }


    // Exibe o formulário de edição de um produto
    static async ProductUpdate(req, res) {

        // Obtém o ID do produto passado pela URL
        // Exemplo: /products/edit/123
        const id = req.params.id;

        // Procura o produto pelo ID e verifica se pertence ao usuário logado
        const product = await Product.findOne({
            _id: id,
            userId: req.session.userid
        }).lean();


        // Se o produto não existir ou não pertencer ao usuário
        if (!product) {

            // Envia uma mensagem de erro
            req.flash(
                'error_msg',
                'Produto não encontrado'
            );

            // Interrompe a execução e volta para a lista de produtos
            return res.redirect('/products');
        }


        // Envia os dados do produto para preencher o formulário de edição
        res.render('products/edit', {
            product
        });
    }


    // Salva as alterações feitas em um produto
    static async ProductUpdateSave(req, res) {
    

    console.log('BODY:', req.body);
    console.log('FILE:', req.file);

    
        // Captura o ID do produto enviado pela URL
        const id = req.params.id;


        // Objeto contendo os dados que serão atualizados
        const product = {

            // Atualiza o novo nome
            name: req.body.name,

            // Atualiza o novo preço
            price: req.body.price
        };


        // Verifica se o usuário enviou uma nova imagem
        if (req.file) {

            // Atualiza o nome da imagem no banco
            product.image = req.file.filename;
        }


        // Procura o produto pelo ID e pelo dono do produto
        // Depois atualiza os dados encontrados
        await Product.findOneAndUpdate(
            {
                _id: id,
                userId: req.session.userid
            },
            product
        );


        // Cria uma mensagem de confirmação
        req.flash(
            'success_msg',
            'Produto alterado com sucesso!'
        );


        // Volta para a página de produtos
        res.redirect('/products');
    }


    // Exclui um produto
    static async ProductDelete(req, res) {

        // Pega o ID do produto pela URL
        const id = req.params.id;


        // Procura o produto pelo ID e usuário
        // Caso encontre, remove do banco de dados
        await Product.findOneAndDelete({
            _id: id,
            userId: req.session.userid
        });


        // Mensagem de confirmação da exclusão
        req.flash(
            'success_msg',
            'Produto excluído com sucesso!'
        );


        // Redireciona para a lista de produtos
        res.redirect('/products');
    }


    // Mostra o painel do usuário com seus próprios produtos
    static async dashboard(req, res) {

        // Busca somente os produtos pertencentes ao usuário logado
        const products = await Product.find({
            userId: req.session.userid
        }).lean();


        // Renderiza a página dashboard enviando os produtos encontrados
        res.render('products/dashboard', {
            products
        });
    }

    

};