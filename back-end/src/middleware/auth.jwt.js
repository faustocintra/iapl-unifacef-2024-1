import jwt from 'jsonwebtoken'

export default function(req, res, next) {

  // As rotas que não necessitam de autenticação devem ser colocadas no objeto abaixo.
  // Essas rotas podem ser acessadas sem autenticação.
  const bypassRoutes = [
    { url: '/users/login', method: 'POST' },
    { url: '/users', method: 'POST' }
  ]

  // Verifica se a rota atual está na lista de rotas que não necessitam de autenticação.
  // Se estiver, permite o acesso sem verificar a autenticação e chama o próximo middleware.
  for(let route of bypassRoutes) {
    if(route.url === req.url && route.method === req.method) {
      console.log(`Rota ${route.url}, método ${route.method} não autenticados por exceção`)
      next()
      return
    }
  }
  
  // Para todas as demais rotas, é necessário que o token JWT tenha sido enviado
  // em um cookie ou no cabeçalho 'Authorization'. Este é um exemplo de gerenciamento de autenticação
  // baseado em tokens JWT, onde um token é usado para autenticar o usuário.

  let token = null

  console.log({ COOKIE: req.cookies[process.env.AUTH_COOKIE_NAME] })

  // 1. Procura o token em um cookie.
  token = req.cookies[process.env.AUTH_COOKIE_NAME]

  // 2. Se o token não foi encontrado no cookie, procura no cabeçalho 'Authorization'.
  if(!token) {
    const authHeader = req.headers['authorization']

    // Se o cabeçalho 'Authorization' não existir, retorna HTTP 403: Forbidden.
    if(!authHeader) {
      console.error('ERRO: não autenticado por falta de cookie ou cabeçalho de autorização')
      return res.status(403).end()
    }
  
    // O cabeçalho 'Authorization' é enviado como uma string "Bearer: XXXX",
    // onde XXXX é o token. Precisamos extrair o token dividindo a string e pegando a segunda parte.
    const [ , _token] = authHeader.split(' ')
    token = _token
  }

  // Valida o token JWT
  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {

    // Token inválido ou expirado. Retorna HTTP 403: Forbidden.
    if(error) {
      console.error('ERRO: token inválido ou expirado')
      return res.status(403).end()
    }

    /*
      Se chegamos até aqui, o token está OK e temos as informações
      do usuário logado no parâmetro 'user'. Vamos guardá-lo no 'req'
      para futura utilização nas rotas subsequentes.

      Sessões: Armazenam o estado no servidor, menos vulneráveis a roubo de tokens, mas podem ser mais difíceis de escalar.
      JWT: Armazenam o estado no cliente, mais vulneráveis a roubo de tokens, mas são mais fáceis de escalar e não exigem gerenciamento de estado no servidor.
    */
    req.authUser = user
    
    // Continua para a rota normal
    next()
  })

}
