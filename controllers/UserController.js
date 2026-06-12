// Importa o Model de usuário responsável pela coleção "users" no MongoDB
const User = require('../models/User');
// Importa a biblioteca bcrypt para criptografar e comparar senhas
const bcrypt = require('bcryptjs');
// Importa o Model de produtos para manipular os produtos do usuário
const Product = require('../models/Product');
// Módulo nativo do Node.js para manipulação de arquivos
const fs = require('fs');
// Módulo nativo do Node.js usado para trabalhar com caminhos de arquivos
const path = require('path');

// Exporta a classe responsável pelas ações relacionadas aos usuários
module.exports = class UserController {
    // ==================================================
    // EXIBE A PÁGINA DE CADASTRO DE USUÁRIO
    // ==================================================
    static registerView(req, res) {

        // Renderiza a página register.handlebars
        res.render('users/register');
    }


    // ==================================================
    // EXIBE A PÁGINA DE LOGIN
    // ==================================================
    static loginView(req, res) {

        // Renderiza a página de login
        res.render('users/login');
    }


    // ==================================================
    // CADASTRA UM NOVO USUÁRIO
    // ==================================================
    static async register(req, res) {
        // Desestrutura os dados enviados pelo formulário
        // req.body contém os campos enviados via POST
        const {
            name,
            email,
            password,
            confirmpassword
        } = req.body;
        // Verifica se o nome foi preenchido
        if (!name) {
            // Cria uma mensagem temporária de erro
            req.flash(
                'error_msg',
                'O nome é obrigatório'
            );

            // Interrompe a função e volta para a tela de cadastro
            return res.redirect('/register');
        }


        // Verifica se o email foi informado
        if (!email) {

            req.flash(
                'error_msg',
                'O email é obrigatório'
            );

            return res.redirect('/register');
        }


        // Verifica se a senha foi preenchida
        if (!password) {

            req.flash(
                'error_msg',
                'A senha é obrigatória'
            );

            return res.redirect('/register');
        }


        // Verifica se a confirmação da senha foi preenchida
        if (!confirmpassword) {

            req.flash(
                'error_msg',
                'A confirmação de senha é obrigatória'
            );

            return res.redirect('/register');
        }


        // Compara as duas senhas digitadas pelo usuário
        if (password !== confirmpassword) {

            req.flash(
                'error_msg',
                'As senhas não coincidem'
            );

            return res.redirect('/register');
        }


        // Procura no banco um usuário com o mesmo email
        const userExists = await User.findOne({
            email
        });


        // Se o usuário já existe impede o cadastro
        if (userExists) {

            req.flash(
                'error_msg',
                'Por favor utilize outro email'
            );

            return res.redirect('/register');
        }


        // Cria um "salt", que adiciona aleatoriedade à criptografia
        const salt = await bcrypt.genSalt(12);


        // Criptografa a senha usando o salt criado
        const passwordHash = await bcrypt.hash(
            password,
            salt
        );


        // Cria um novo documento User
        const user = new User({

            // Nome do usuário
            name,

            // Email do usuário
            email,

            // Salva a senha criptografada no banco
            password: passwordHash
        });


        try {

            // Salva o usuário no MongoDB
            await user.save();


            // Mensagem de sucesso após cadastro
            req.flash(
                'success_msg',
                'Usuário cadastrado com sucesso!'
            );


            // Envia o usuário para a página de login
            return res.redirect('/login');


        } catch (err) {


            // Mostra o erro no terminal do servidor
            console.log(err);


            // Informa erro ao usuário
            req.flash(
                'error_msg',
                'Erro ao criar usuário'
            );


            return res.redirect('/register');
        }
    }


    // ==================================================
    // REALIZA O LOGIN DO USUÁRIO
    // ==================================================
    static async login(req, res) {


        // Obtém os dados enviados pelo formulário de login
        const {
            email,
            password
        } = req.body;


        // Verifica se os campos foram preenchidos
        if (!email || !password) {

            req.flash(
                'error_msg',
                'Preencha todos os campos'
            );

            return res.redirect('/login');
        }


        // Procura o usuário pelo email no banco
        const user = await User.findOne({
            email
        });


        // Caso não encontre o usuário
        if (!user) {

            req.flash(
                'error_msg',
                'Usuário não encontrado'
            );

            return res.redirect('/login');
        }


        // Compara a senha digitada com a senha criptografada do banco
        const checkPassword = await bcrypt.compare(
            password,
            user.password
        );


        // Caso a senha esteja errada
        if (!checkPassword) {

            req.flash(
                'error_msg',
                'Senha inválida'
            );

            return res.redirect('/login');
        }


        // Cria variáveis na sessão do usuário
        // Elas permanecem disponíveis enquanto o usuário estiver logado
        req.session.userid = user._id;
        req.session.username = user.name;


        // Mensagem de boas-vindas
        req.flash(
            'success_msg',
            `Bem-vindo, ${user.name}!`
        );


        // Redireciona para o painel do usuário
        return res.redirect('/dashboard');
    }


    // ==================================================
    // FAZ O LOGOUT DO USUÁRIO
    // ==================================================
    static logout(req, res) {


        // Encerra a sessão atual
        req.session.destroy((err) => {


            // Caso aconteça algum erro ao destruir a sessão
            if (err) {

                console.log(err);

                return res.redirect('/');
            }


            // Redireciona para o login após sair
            return res.redirect('/login');
        });
    }


    // ==================================================
    // EXIBE O PERFIL DO USUÁRIO LOGADO
    // ==================================================
    static async profile(req, res) {


        // Pega o ID salvo na sessão
        const id = req.session.userid;


        // Busca o usuário pelo ID
        // lean transforma o documento Mongoose em objeto JavaScript simples
        const user = await User.findById(id).lean();


        // Envia os dados para a página do perfil
        res.render('users/profile', {
            user
        });
    }


    // ==================================================
    // EXIBE A TELA DE EDIÇÃO DO PERFIL
    // ==================================================
    static async editProfileView(req, res) {

        const id = req.session.userid;

        const user = await User.findById(id).lean();


        res.render('users/edit-profile', {
            user
        });
    }


    // ==================================================
    // SALVA AS ALTERAÇÕES DO PERFIL
    // ==================================================
    static async editProfile(req, res) {

        const id = req.session.userid;


        // Captura os dados enviados pelo formulário
        const {
            name,
            email,
            password,
            confirmpassword
        } = req.body;


        // Objeto com os dados que serão atualizados
        const updateData = {
            name,
            email
        };


        // Verifica se o usuário enviou uma nova foto de perfil
        if (req.file) {

            // Salva o nome da imagem enviada pelo Multer
            updateData.image = req.file.filename;
        }


        // Caso o usuário deseje alterar a senha
        if (password || confirmpassword) {


            // Confirma se as duas senhas são iguais
            if (password !== confirmpassword) {

                req.flash(
                    'error_msg',
                    'As senhas não coincidem'
                );


                return res.redirect('/profile/edit');
            }


            // Gera um salt para a nova senha
            const salt = await bcrypt.genSalt(12);


            // Criptografa e atualiza a senha
            updateData.password = await bcrypt.hash(
                password,
                salt
            );
        }


        // Atualiza os dados do usuário no banco
        await User.findByIdAndUpdate(
            id,
            updateData
        );


        // Atualiza o nome salvo na sessão
        req.session.username = name;


        req.flash(
            'success_msg',
            'Perfil atualizado com sucesso!'
        );


        res.redirect('/profile');
    }


    // ==================================================
    // EXCLUI A CONTA DO USUÁRIO
    // Remove produtos, imagens e a própria conta
    // ==================================================
    static async deleteUser(req, res) {


        const id = req.session.userid;


        try {


            // Busca todos os produtos do usuário
            const products = await Product.find({
                userId: id
            });


            // Percorre todos os produtos encontrados
            for (const product of products) {


                // Verifica se o produto possui imagem
                if (product.image) {


                    // Cria o caminho completo do arquivo
                    const imagePath = path.join(
                        __dirname,
                        '../public/uploads',
                        product.image
                    );


                    // Confirma se o arquivo existe
                    if (fs.existsSync(imagePath)) {


                        // Apaga o arquivo do disco
                        fs.unlinkSync(imagePath);
                    }
                }
            }


            // Busca o usuário para remover sua foto de perfil
            const user = await User.findById(id);


            if (user && user.image) {


                const profileImagePath = path.join(
                    __dirname,
                    '../public/uploads',
                    user.image
                );


                // Remove a foto do perfil
                if (fs.existsSync(profileImagePath)) {
                    fs.unlinkSync(profileImagePath);
                }
            }


            // Remove todos os produtos do usuário
            await Product.deleteMany({
                userId: id
            });


            // Remove o cadastro do usuário
            await User.findByIdAndDelete(id);


            // Encerra a sessão
            req.session.destroy((err) => {


                if (err) {

                    console.log(err);

                    return res.redirect('/');
                }


                return res.redirect('/');
            });


        } catch (err) {


            // Exibe o erro no terminal
            console.log(err);


            // Informa ao usuário que ocorreu uma falha
            req.flash(
                'error_msg',
                'Erro ao excluir a conta'
            );


            return res.redirect('/profile');
        }
    }
};