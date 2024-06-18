import jwt from 'jsonwebtoken';

/*
  Middleware de Autenticação JWT

  Este middleware protege rotas sensíveis verificando a presença e validade de um token JWT.
  Se o token é válido, o usuário está autenticado e pode acessar a rota protegida.

  Fluxo:
  1. Verifica se a rota atual está na lista de rotas que não necessitam de autenticação.
  2. Tenta encontrar o token JWT em um cookie específico.
  3. Se não encontrado no cookie, procura no header 'Authorization'.
  4. Valida o token JWT utilizando a chave secreta definida no ambiente.
  5. Se o token é válido, adiciona as informações do usuário autenticado no objeto 'req' para uso futuro.
  6. Caso contrário, retorna um erro 403 (Forbidden) indicando falha na autenticação.

  Notas:
  - O token JWT é emitido durante o login do usuário e deve ser enviado pelo cliente em cada requisição subsequente.
*/

export default function(req, res, next) {

  // Rotas que não necessitam de autenticação
  const bypassRoutes = [
    { url: '/users/login', method: 'POST' },
    { url: '/users', method: 'POST' }
  ];

  // Verifica se a rota atual está nas exceções de bypassRoutes
  for(let route of bypassRoutes) {
    if(route.url === req.url && route.method === req.method) {
      console.log(`Rota ${route.url}, método ${route.method} não autenticados por exceção`);
      next();
      return;
    }
  }
  
  // Inicialmente, tenta encontrar o token JWT em um cookie
  let token = req.cookies[process.env.AUTH_COOKIE_NAME];

  // Se não encontrou o token no cookie, procura no header de autorização
  if(!token) {
    const authHeader = req.headers['authorization'];

    // Se o header de autorização não existe
    if(!authHeader) {
      console.error('ERRO: não autenticado por falta de cookie ou cabeçalho de autorização');
      return res.status(403).end();
    }
  
    // O header Authorization é enviado como uma string 'Bearer: XXXX'
    // Extrai apenas o token (XXXX)
    const [ , _token] = authHeader.split(' ');
    
    token = _token;
  }

  // Valida o token JWT
  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {

    // Se o token é inválido ou expirado
    if(error) {
      console.error('ERRO: token inválido ou expirado');
      return res.status(403).end();
    }

    /*
      Se chegamos até aqui, o token está válido e 'user' contém as informações
      do usuário autenticado. Armazena essas informações no objeto 'req' para uso posterior.
    */
    req.authUser = user;
    
    // Continua para a rota normal
    next();
  });

}
