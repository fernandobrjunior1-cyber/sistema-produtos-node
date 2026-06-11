// Importa o Multer, biblioteca utilizada para upload de arquivos
const multer = require('multer');

// Importa o módulo path do Node.js para trabalhar com caminhos e extensões de arquivos
const path = require('path');


// Configura onde e como os arquivos enviados serão armazenados
const storage = multer.diskStorage({

    // Define a pasta de destino onde os arquivos serão salvos
    destination(req, file, cb) {

        // cb = callback usada pelo Multer para informar o caminho do arquivo
        // null significa que não houve erro
        // 'public/uploads' é a pasta onde as imagens serão armazenadas
        cb(null, 'public/uploads');
    },


    // Define o nome que o arquivo terá após ser salvo
    filename(req, file, cb) {

        // Date.now() gera um número baseado na data e hora atual em milissegundos
        // Isso evita que arquivos com o mesmo nome sejam sobrescritos
        // path.extname pega somente a extensão do arquivo original
        // Exemplo: foto.jpg → .jpg
        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );
    }

});


// Cria a configuração do Multer utilizando o armazenamento definido acima
const imageUpload = multer({

    // Usa a configuração de armazenamento criada anteriormente
    storage,


    // Filtra quais tipos de arquivos podem ser enviados
    fileFilter(req, file, cb) {

        // Exibe no terminal o tipo do arquivo recebido
        // Exemplos:
        // image/png
        // image/jpeg
        // application/pdf
        console.log(file.mimetype);


        // Verifica se o tipo do arquivo começa com "image/"
        // Aceita PNG, JPG, JPEG, WEBP, GIF etc.
        if (file.mimetype.startsWith('image/')) {

            // Permite o envio da imagem
            cb(null, true);

        } else {

            // Bloqueia arquivos que não são imagens
            // Exemplo: PDF, DOC, EXE, ZIP
            cb(new Error('Apenas imagens'));
        }
    }

});


// Exporta a configuração para ser utilizada nas rotas
// Exemplo:
// router.post('/upload', imageUpload.single('image'), controller)
module.exports = imageUpload;