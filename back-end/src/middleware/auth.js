import Cryptr from 'cryptr';
import prisma from '../database/client.js';

/*
  Middleware de Autenticação por Sessão

  Este middleware protege rotas sensíveis verificando a presença e validade da sessid.
  A sessid é descriptografada para recuperar informações da sessão do usuário armazenadas no banco de dados.

  Fluxo:
  1. Verifica se a rota atual está na lista de rotas que não necessitam de autenticação.
  2. Tenta encontrar a sessid em um cookie específico.
  3. Se não encontrada no cookie, procura no header 'Authorization'.
  4. Descriptografa a sessid usando a chave secreta definida no ambiente.
  5. Busca as informações da sessão no banco de dados utilizando a sessid.
  6. Verifica se a sessão é válida (não expirou).
  7. Se a sessão é válida, armazena as informações do usuário recuperadas em 'req.authUser' para uso posterior.
  8. Caso contrário, retorna um erro 403 (Forbidden) indicando falha na autenticação.

  Notas:
  - A sessid é enviada pelo cliente em cada requisição e usada para manter o estado de autenticação.
*/

export default async function(req, res, next) {

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
  
  // Procura a sessid em um cookie
  let cryptoSessid = req.cookies[process.env.AUTH_COOKIE_NAME];

  // Se a sessid não foi encontrada no cookie, procura no header de autorização
  if(!cryptoSessid) {
    const authHeader = req.headers['authorization'];

    // Se o header de autorização não existe
    if(!authHeader) {
      console.error('ERRO: não autenticado por falta de cookie ou cabeçalho de autorização');
      return res.status(403).end();
    }
  
    // O header Authorization é enviado como uma string 'Bearer: XXXX'
    // Extrai apenas o token (XXXX)
    const [ , _token] = authHeader.split(' ');
    
    cryptoSessid = _token;
  }

  // Descriptografa a sessid
  let sessid;
  try {
    const cryptr = new Cryptr(process.env.TOKEN_SECRET);
    sessid = cryptr.decrypt(cryptoSessid);
  }
  catch {
    // Caso ocorra algum erro com a decriptografia da sessid,
    // enviamos HTTP 403: Forbidden
    console.error('ERRO: não autenticado por falha na decodificação da sessid');
    return res.status(403).end();
  }

  // Busca as informações da sessão no banco de dados
  let session;
  try {
    session = await prisma.session.findUniqueOrThrow({
      where: { sessid },
      include: { user: true } // Faz "join" com a tabela de usuários
    });
  }
  catch {
    // Caso ocorra algum erro com a recuperação das informações da sessão,
    // enviamos HTTP 403: Forbidden
    console.error('ERRO: não autenticado por erro na recuperação das informações da sessão');
    return res.status(403).end();
  }

  // Verifica se a sessão é válida (não está expirada)
  const now = new Date();    // Data/hora atuais
  if(now.getTime() - session.start_time.getTime() > Number(process.env.SESSION_DURATION)) {
    console.error('ERRO: não autenticado por sessão expirada.');
    return res.status(403).end();
  }

  // Sessão válida, armazena os dados do usuário recuperados
  // em req.authUser para uso posterior
  // Obs.: o campo 'password' é removido por questões de segurança
  if(session.user?.password) delete session.user?.password;
  req.authUser = session.user;

  // Continua para a rota normal
  next();

}
