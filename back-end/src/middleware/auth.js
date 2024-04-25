import jwt from "jsonwebtoken";

export default async function (req, res, next) {

    //As rotas que eventuamente não necessitarem
    // de autenticação devem ser colocadas no objeto abaixo

    const bypassRoutes = [
      { url: "/users/login", method: "POST" },
      { url: "/users", method: "POST" },
      { url: "/cars", method: "POST" },
      { url: "/cars", method: "GET" },
      { url: "/cars/:id", method: "PUT" },
      { url: "/cars/:id", method: "DELETE" },
    ];

    //Verifica se a rota atual está nas exceções de bypassRoutes. 
    //Caso esteja, para o próximo middleware sem verificar a autenticação
    for(let route of bypassRoutes){
        if(req.url === route.url && req.method === route.method){
            console.log(`Rota ${route.url}, método ${route.method} não autenticados por exceção. `);
            next()
            return
        }
    }
    
    // Para todas as demais rotas, é necessário que o token tenha sido enviado no cabeçalho Authorization
    const authHeader = req.headers['authorization']

    // o header existe, o token não foi passado: 
    //HTTP 403: Forbiden
    if(! authHeader) {
        console.error('ERRO: não autenticado por falta de token')
        return res.status(403).end()
    }

    // O header Authorization é enviado como uma string 
    // Bearer: XXXX
    // onde XXX é o token. Portanto para extrair o token, precisamos recortar a string no ponto onde há um espaço
    // e pegar a segunda parte
    const [, token] = authHeader.split(' ')

    //valida o token
    jwt.verify(token, process.env.TOKEN_SECRET, (error, user) =>{

        //Token inválido ou expirado
        // HTTP: 403 Forbiden

        if(error) {
            console.error('ERRO: não autenticado por token inválido ou expirado')
            return res.status(403).end()
        }

        /*
           Se chegamos até aqui, o token está ok e temos as informações
           do usuário logado no parâmetro 'user'. Vamos guarda-lo no 'red'
           para futuro utilização
        */
        req.authUser = user

        // Continua para a rota normal
        next()
    })
}