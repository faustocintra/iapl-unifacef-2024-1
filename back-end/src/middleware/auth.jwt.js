import jwt from 'jsonwebtoken'  // Importa a biblioteca jsonwebtoken para manipulação de tokens JWT

export default function(req, res, next) {

  // Define rotas que não necessitam de autenticação
  const bypassRoutes = [
    { url: '/users/login', method: 'POST' },
    { url: '/users', method: 'POST' }
  ]

  // Verifica se a rota atual está nas exceções de bypassRoutes
  for(let route of bypassRoutes) {
    if(route.url === req.url && route.method === req.method) {
      console.log(`Rota ${route.url}, método ${route.method} não autenticados por exceção`)
      next()  // Passa para o próximo middleware sem verificar a autenticação
      return
    }
  }
  
  // Para todas as outras rotas, a autenticação é necessária
  let token = null

  console.log({ COOKIE: req.cookies[process.env.AUTH_COOKIE_NAME] })

  // Tenta obter o token do cookie
  token = req.cookies[process.env.AUTH_COOKIE_NAME]

  // token não foi encontrado no cookie, procura no header Authorization
  if(!token) {
    const authHeader = req.headers['authorization']

    // header não existe, o token não foi passado: HTTP 403: Forbidden
    if(!authHeader) {
      console.error('ERRO: não autenticado por falta de cookie ou cabeçalho de autorização')
      return res.status(403).end()
    }
  
    // Extrai o token do header Authorization
    // O header Authorization é enviado como uma string "Bearer XXXX"
    // onde XXXX é o token. Portanto, para extrair o token,
    // precisamos recortar a string no ponto onde há um espaço
    // e pegar somente a segunda parte
    const [ , _token] = authHeader.split(' ')
    token = _token
  }

  // Valida o token
  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {

    // Token inválido ou expirado: HTTP 403: Forbidden
    if(error) {
      console.error('ERRO: token inválido ou expirado')
      return res.status(403).end()
    }

    //  token está OK e temos as informações do usuário logado no parâmetro 'user' guarda no 'req'
    req.authUser = user
    
    // Continua para a rota normal
    next()
  })

}


/*A diferença entre tokens de sessão e tokens JWT (JSON Web Tokens) reside principalmente em como eles são construídos, usados ​​e armazenados. Ambos são mecanismos de autenticação e autorização em aplicações web, mas possuem características diferentes e são adequados para diferentes necessidades e cenários.*/