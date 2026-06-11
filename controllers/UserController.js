const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

module.exports = class UserController {

    // =========================
    // EXIBE PÁGINA DE CADASTRO
    // =========================
    static registerView(req, res) {
        res.render('users/register');
    }

    // =========================
    // EXIBE PÁGINA DE LOGIN
    // =========================
    static loginView(req, res) {
        res.render('users/login');
    }

    // =========================
    // CADASTRAR USUÁRIO
    // =========================
    static async register(req, res) {

        const { name, email, password, confirmpassword } = req.body;

        // validações básicas
        if (!name) {
            req.flash('error_msg', 'O nome é obrigatório');
            return res.redirect('/register');
        }

        if (!email) {
            req.flash('error_msg', 'O email é obrigatório');
            return res.redirect('/register');
        }

        if (!password) {
            req.flash('error_msg', 'A senha é obrigatória');
            return res.redirect('/register');
        }

        if (!confirmpassword) {
            req.flash('error_msg', 'A confirmação de senha é obrigatória');
            return res.redirect('/register');
        }

        // validação de senha
        if (password !== confirmpassword) {
            req.flash('error_msg', 'As senhas não coincidem');
            return res.redirect('/register');
        }
        

        // verifica se usuário já existe
        const userExists = await User.findOne({ email });

        if (userExists) {
            req.flash('error_msg', 'Por favor utilize outro email');
            return res.redirect('/register');
        }

        // criptografia da senha
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: passwordHash
        });

        try {
            await user.save();

            req.flash('success_msg', 'Usuário cadastrado com sucesso!');
            return res.redirect('/login');

        } catch (err) {
            console.log(err);
            req.flash('error_msg', 'Erro ao criar usuário');
            return res.redirect('/register');
        }
    }

    // =========================
    // LOGIN DO USUÁRIO
    // =========================
    static async login(req, res) {

        const { email, password } = req.body;

        if (!email || !password) {
            req.flash('error_msg', 'Preencha todos os campos');
            return res.redirect('/login');
        }

        // busca usuário
        const user = await User.findOne({ email });

        if (!user) {
            req.flash('error_msg', 'Usuário não encontrado');
            return res.redirect('/login');
        }

        // valida senha
        const checkPassword = await bcrypt.compare(password, user.password);

        if (!checkPassword) {
            req.flash('error_msg', 'Senha inválida');
            return res.redirect('/login');
        }

        // cria sessão
        req.session.userid = user._id;
        req.session.username = user.name;

        req.flash('success_msg', `Bem-vindo, ${user.name}!`);

         return res.redirect('/dashboard');
    }

    // =========================
    // LOGOUT DO USUÁRIO
    // =========================
    static logout(req, res) {

        req.session.destroy((err) => {

            if (err) {
                console.log(err);
                return res.redirect('/');
            }

            return res.redirect('/login');
        });
    }

    // =========================
// EXIBE PERFIL DO USUÁRIO
// =========================
static async profile(req, res) {

    const id = req.session.userid;

    const user = await User.findById(id).lean();

    res.render('users/profile', {
        user
    });
}

// =========================
// EXIBE FORMULÁRIO DE EDIÇÃO
// =========================
static async editProfileView(req, res) {

    const id = req.session.userid;

    const user = await User.findById(id).lean();

    res.render('users/edit-profile', {
        user
    });
}

   static async editProfile(req, res) {

    const id = req.session.userid;

    const {
        name,
        email,
        password,
        confirmpassword
    } = req.body;

    const updateData = {
    name,
    email
};

// Atualiza a foto de perfil caso uma nova imagem seja enviada
if (req.file) {
    updateData.image = req.file.filename;
}
    // Se o usuário quiser trocar a senha
    if (password || confirmpassword) {

        if (password !== confirmpassword) {

            req.flash(
                'error_msg',
                'As senhas não coincidem'
            );

            return res.redirect('/profile/edit');
        }

        const salt = await bcrypt.genSalt(12);

        updateData.password = await bcrypt.hash(
            password,
            salt
        );
    }

    await User.findByIdAndUpdate(
        id,
        updateData
    );

    req.session.username = name;

    req.flash(
        'success_msg',
        'Perfil atualizado com sucesso!'
    );

    res.redirect('/profile');
}
// =========================
// EXCLUI CONTA DO USUÁRIO
// Remove usuário, produtos e imagens
// =========================
static async deleteUser(req, res) {

    const id = req.session.userid;

    try {

        // Busca todos os produtos do usuário
        const products = await Product.find({
            userId: id
        });

        // Remove imagens dos produtos
        for (const product of products) {

            if (product.image) {

                const imagePath = path.join(
                    __dirname,
                    '../public/uploads',
                    product.image
                );

                // Verifica se o arquivo existe antes de apagar
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }

        // Busca o usuário para apagar a foto de perfil
        const user = await User.findById(id);

        if (user && user.image) {

            const profileImagePath = path.join(
                __dirname,
                '../public/uploads',
                user.image
            );

            if (fs.existsSync(profileImagePath)) {
                fs.unlinkSync(profileImagePath);
            }
        }

        // Apaga todos os produtos do usuário
        await Product.deleteMany({
            userId: id
        });

        // Apaga o usuário
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

        console.log(err);

        req.flash(
            'error_msg',
            'Erro ao excluir a conta'
        );

        return res.redirect('/profile');
    }
}

}