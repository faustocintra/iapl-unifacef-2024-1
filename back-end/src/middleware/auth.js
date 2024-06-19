import Cryptr from 'cryptr'
import prisma from '../database/client.js'

export default async function(req, res, next) {

  // Lista de rotas que não necessitam de autenticação.
  // Estas rotas podem ser acessadas sem passar pela verificação de autenticação.
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
  
  // Para todas as outras rotas, é necessário que a 'sessid' seja enviada
  // em um cookie ou no cabeçalho 'Authorization'. Este é um exemplo de
  // gerenciamento de autenticação baseado em sessões, onde um identificador de sessão é usado para autenticar o usuário.

  let cryptoSessid = null

  // 1. Procura a 'sessid' em um cookie.
  cryptoSessid = req.cookies[process.env.AUTH_COOKIE_NAME]

  // 2. Se a 'sessid' não foi encontrada no cookie, procura no cabeçalho 'Authorization'.
  if(!cryptoSessid) {
    const authHeader = req.headers['authorization']

    // Se o cabeçalho 'Authorization' não existir, retorna HTTP 403: Forbidden.
    if(!authHeader) {
      console.error('ERRO: não autenticado por falta de cookie ou cabeçalho de autorização')
      return res.status(403).end()
    }
  
    // O cabeçalho 'Authorization' é enviado como uma string "Bearer: XXXX",
    // onde XXXX é o token. Precisamos extrair o token dividindo a string e pegando a segunda parte.
    const [ , _token] = authHeader.split(' ')
    cryptoSessid = _token
  }

  // Valida a 'sessid'.
  let sessid
  
  // Tenta descriptografar a 'sessid' usando a chave secreta.
  try {
    const cryptr = new Cryptr(process.env.TOKEN_SECRET)
    sessid = cryptr.decrypt(cryptoSessid)
  } catch {
    // Se ocorrer um erro na descriptografia, retorna HTTP 403: Forbidden.
    console.error('ERRO: não autenticado por falha na decodificação da sessid')
    return res.status(403).end()
  }

  // Busca as informações da sessão no banco de dados.
  let session
  try {
    session = await prisma.session.findUniqueOrThrow({
      where: { sessid },
      include: { user: true } // Faz "join" com a tabela de usuários.
    })
  } catch {
    // Se ocorrer um erro na recuperação das informações da sessão, retorna HTTP 403: Forbidden.
    console.error('ERRO: não autenticado por erro na recuperação das informações da sessão')
    return res.status(403).end()
  }

  // Verifica se a sessão é válida (não está expirada).
  const now = new Date() // Data/hora atuais
  if(now.getTime() - session.start_time.getTime() > Number(process.env.SESSION_DURATION)) {
    console.error('ERRO: não autenticado por sessão expirada.')
    return res.status(403).end()
  }

  // Sessão OK. Armazena os dados do usuário recuperados junto com a sessão em 'req.authUser'.
  // Obs.: O campo de senha é removido por segurança.
  if(session.user?.password) delete session.user?.password
  req.authUser = session.user

  // Continua para a rota normal.
  next()
}
