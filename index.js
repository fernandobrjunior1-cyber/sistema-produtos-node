// Importa o framework Express, responsável por criar o servidor web
const express = require('express');

// Importa o Handlebars, que será utilizado como mecanismo de templates (Views)
const exphbs = require('express-handlebars');

// Importa o express-session, responsável por criar e gerenciar sessões de usuários
const session = require('express-session');

// Importa o session-file-store para armazenar as sessões em arquivos no computador
const FileStore = require('session-file-store')(session);

// Importa o connect-flash, usado para criar mensagens temporárias de sucesso e erro
const flash = require('connect-flash');

// Importa o módulo path do Node.js para trabalhar com caminhos de pastas e arquivos
const path = require('path');

// Importa o Model User para buscar informações do usuário logado
const User = require('./models/User');

// Importa a conexão com o banco de dados MongoDB
// Apenas importar este arquivo já executa a conexão com o banco
const conn = require('./db/conn');


// Importa as rotas relacionadas aos usuários
const UserRoutes = require('./routes/UserRoutes');

// Importa as rotas relacionadas aos produtos
const ProductRoutes = require('./routes/ProductRoutes');


// Cria a aplicação Express
const app = express();


// ==================================================
// CONFIGURAÇÃO DO HANDLEBARS (VIEW ENGINE)
// ==================================================

// Define o Handlebars como mecanismo de visualização
app.engine('handlebars', exphbs.engine());

// Informa ao Express que as páginas da aplicação usarão a extensão .handlebars
app.set('view engine', 'handlebars');


// ==================================================
// MIDDLEWARES PARA RECEBER DADOS DE FORMULÁRIOS E JSON
// ==================================================

// Permite receber dados enviados por formulários HTML
// Exemplo: req.body.name, req.body.email
app.use(express.urlencoded({
    extended: true
}));

// Permite receber requisições no formato JSON
app.use(express.json());


// ==================================================
// ARQUIVOS ESTÁTICOS
// ==================================================

// Torna a pasta "public" acessível pelo navegador
// Exemplo:
// public/css/style.css → http://localhost:3000/css/style.css
// public/uploads/foto.jpg → http://localhost:3000/uploads/foto.jpg
app.use(express.static(
    path.join(__dirname, 'public')
));


// ==================================================
// CONFIGURAÇÃO DE SESSÃO
// ==================================================

app.use(
    session({

        // Nome do cookie de sessão criado no navegador
        name: 'session',

        // Chave usada para assinar e proteger a sessão
        secret: 'meusegredo',

        // Evita salvar a sessão no armazenamento se nada foi alterado
        resave: false,

        // Não cria sessões vazias para visitantes que ainda não fizeram login
        saveUninitialized: false,

        // Define onde as sessões serão armazenadas
        // Neste caso, em arquivos dentro da pasta "sessions"
        store: new FileStore({
            path: './sessions'
        }),

        // Configurações do cookie de sessão
        cookie: {

            // false permite uso em HTTP local
            // Em produção usando HTTPS normalmente é true
            secure: false,

            // Tempo de duração do cookie:
            // 1000 ms × 60 segundos × 60 minutos × 24 horas = 1 dia
            maxAge: 1000 * 60 * 60 * 24,

            // Impede que o JavaScript do navegador acesse o cookie
            // aumentando a segurança contra alguns tipos de ataque
            httpOnly: true
        }
    })
);


// ==================================================
// MENSAGENS TEMPORÁRIAS (FLASH)
// ==================================================

// Adiciona o método req.flash() às requisições
app.use(flash());


// ==================================================
// DISPONIBILIZA MENSAGENS PARA TODAS AS VIEWS
// ==================================================

app.use((req, res, next) => {

    // Recupera mensagens de sucesso e envia para o Handlebars
    res.locals.success_msg = req.flash('success_msg');

    // Recupera mensagens de erro e envia para o Handlebars
    res.locals.error_msg = req.flash('error_msg');

    // Continua para o próximo middleware
    next();
});


// ==================================================
// DADOS GLOBAIS DO USUÁRIO LOGADO
// ==================================================

app.use(async (req, res, next) => {

    // Deixa o nome e o ID do usuário disponíveis em todas as páginas
    res.locals.username = req.session.username;
    res.locals.userid = req.session.userid;


    // Verifica se existe um usuário autenticado
    if (req.session.userid) {


        // Busca os dados do usuário no MongoDB
        const user = await User.findById(
            req.session.userid
        ).lean();


        // Caso o usuário exista
        if (user) {

            // Envia a imagem do perfil para todas as views
            // Exemplo: {{userImage}}
            res.locals.userImage = user.image;
        }
    }


    // Continua o processamento da requisição
    next();
});


// ==================================================
// ROTAS DA APLICAÇÃO
// ==================================================


// Rotas principais de produtos e página inicial
app.use('/', ProductRoutes);


// Rotas de usuários (login, cadastro, perfil, etc.)
app.use('/', UserRoutes);


// Rotas específicas de produtos
// Exemplo: /products/create, /products/edit/:id
app.use('/products', ProductRoutes);


// ==================================================
// INICIA O SERVIDOR
// ==================================================

// Faz o servidor escutar a porta 3000
app.listen(3000, () => {

    // Mensagem exibida no terminal quando o servidor inicia
    console.log(
        'Servidor rodando na porta 3000'
    );
});