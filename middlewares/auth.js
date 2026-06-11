module.exports.checkAuth = (req, res, next) => {

    if (!req.session.userid) {
        req.flash('error_msg', 'Faça login para acessar esta página');
        return res.redirect('/login');
    }

    next();
};