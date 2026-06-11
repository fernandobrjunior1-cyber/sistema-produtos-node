// Exporta uma função middleware chamada checkAuth
// Ela será usada para proteger rotas que exigem login
module.exports.checkAuth = (req, res, next) => {

    // Verifica se existe um ID de usuário salvo na sessão
    // req.session.userid é criado no momento do login
    if (!req.session.userid) {

        // Cria uma mensagem temporária de erro usando connect-flash
        req.flash(
            'error_msg',
            'Faça login para acessar esta página'
        );

        // Interrompe a execução da rota atual e redireciona
        // o usuário para a página de login
        return res.redirect('/login');
    }

    // Caso o usuário esteja autenticado,
    // permite que a requisição continue para o próximo middleware
    // ou para o Controller da rota
    next();
};