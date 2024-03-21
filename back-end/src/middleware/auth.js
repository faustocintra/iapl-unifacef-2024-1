import jwt from "jsonwebtoken";

export default async function (req, res, next) {

    //As rotas que eventuamente não necessitarem
    // de autenticação devem ser colocadas no objeto abaixo

    const bypassRoutes = [
        { url: '/users/login', method: 'POST' },
    ]

    //Verifica se a rota atual está nas exceções de bypassRoutes. 
    //Caso esteja, para o próximo middleware sem verificar a autenticação
    for(let route of bypassRoutes){
        if(req.url === route.url && req.method === route.method){
            next()
            return
        }
    }
    
}