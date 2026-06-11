const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('connect-flash');
const path = require('path')
const User = require('./models/User');
const conn = require('./db/conn');

const UserRoutes = require('./routes/UserRoutes');
const ProductRoutes = require('./routes/ProductRoutes');

const app = express();

// =========================
// HANDLEBARS
// =========================
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

// =========================
// BODY PARSER
// =========================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =========================
// STATIC FILES
// =========================
app.use(express.static(path.join(__dirname, 'public')));

// =========================
// SESSION 
// =========================
app.use(
    session({
        name: 'session',
        secret: 'meusegredo',
        resave: false,
        saveUninitialized: false,
        store: new FileStore({
            path: './sessions'
        }),
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 24, // 1 dia
            httpOnly: true
        }
    })
);

// =========================
// FLASH MESSAGES
// =========================
app.use(flash());

// =========================
// GLOBAL MESSAGES
// =========================
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');

    next();
});

// =========================
// USER SESSION DATA
// =========================
app.use(async (req, res, next) => {

    res.locals.username = req.session.username;
    res.locals.userid = req.session.userid;

    if (req.session.userid) {

        const user = await User.findById(
            req.session.userid
        ).lean();

        if (user) {
            res.locals.userImage = user.image;
        }
    }

    next();
});
// =========================
// ROUTES
// =========================

app.use('/', ProductRoutes);
app.use('/', UserRoutes);
app.use('/products', ProductRoutes)

// =========================
// SERVER
// =========================
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});