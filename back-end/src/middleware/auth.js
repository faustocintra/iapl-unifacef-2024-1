import Cryptr from 'cryptr'  // Importa a biblioteca Cryptr para criptografar/descriptografar tokens
import prisma from '../database/client.js'  // Importa o cliente do Prisma para interagir com o banco de dados

export default async function(req, res, next) {
  
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
  let cryptoSessid = null

  // Tenta obter a sessid do cookie
  cryptoSessid = req.cookies[process.env.AUTH_COOKIE_NAME]

  // Se a sessid não foi encontrada no cookie, procura no header Authorization
  if(!cryptoSessid) {
    const authHeader = req.headers['authorization']

    // Se o header não exist, a sessid não foi passada: HTTP 403: Forbidden
    if(!authHeader) {
      console.error('ERRO: não autenticado por falta de cookie ou cabeçalho de autorização')
      return res.status(403).end()
    }
  
    // Extrai o token do header Authorization
    const [ , _token] = authHeader.split(' ')
    cryptoSessid = _token
  }

  // Valida a sessid
  let sessid
  
  // Tenta descriptografar a sessid
  try {
    const cryptr = new Cryptr(process.env.TOKEN_SECRET)
    sessid = cryptr.decrypt(cryptoSessid)
  } catch {
    // Se houver erro na decriptografia, retorna HTTP 403: Forbidden
    console.error('ERRO: não autenticado por falha na decodificação da sessid')
    return res.status(403).end()
  }

  // Busca as informações da sessão no banco de dados
  let session
  try {
    session = await prisma.session.findUniqueOrThrow({
      where: { sessid },
      include: { user: true } // Faz join com a tabela de usuários
    })
  } catch {
    // Erro na recuperação da sessão, retorna HTTP 403: Forbidden
    console.error('ERRO: não autenticado por erro na recuperação das informações da sessão')
    return res.status(403).end()
  }

  // Verifica se a sessão é válida (não está expirada)
  const now = new Date()    // Data/hora atuais
  if(now.getTime() - session.start_time.getTime() > 
    Number(process.env.SESSION_DURATION)) {
    
    console.error('ERRO: não autenticado por sessão expirada.')
    return res.status(403).end()
  }

  //armazena os dados do usuário recuperados junto com a sessão em req.authUser
  // remove o campo password por segurança
  if(session.user?.password) delete session.user?.password
  req.authUser = session.user

  // Continua para a rota normal
  next()
}
