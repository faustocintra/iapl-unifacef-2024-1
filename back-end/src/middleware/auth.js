import Cryptr from "cryptr";
import prisma from "../database/client.js";

export default async function (req, res, next) {
  // Definindo rotas que não necessitam de autenticação
  const bypassRoutes = [
    { url: "/users/login", method: "POST" },
    { url: "/users", method: "POST" },
  ];

  // Verifica se a rota atual está nas exceções de bypassRoutes.
  // Se estiver, permite o acesso sem autenticação
  for (let route of bypassRoutes) {
    if (route.url === req.url && route.method === req.method) {
      console.log(
        `Rota ${route.url}, método ${route.method} não autenticados por exceção`
      );
      next();
      return;
    }
  }

  // Para todas as outras rotas, é necessário que a sessid esteja
  // presente em um cookie ou no cabeçalho Authorization

  let cryptoSessid = null;

  // 1. PROCURA A SESSID EM UM COOKIE
  cryptoSessid = req.cookies[process.env.AUTH_COOKIE_NAME];

  // 2. SE A SESSID NÃO FOR ENCONTRADA NO COOKIE, PROCURA NO HEADER DE AUTORIZAÇÃO
  if (!cryptoSessid) {
    const authHeader = req.headers["authorization"];

    // Se o cabeçalho Authorization não existir, retorna HTTP 403: Forbidden
    if (!authHeader) {
      console.error(
        "ERRO: não autenticado por falta de cookie ou cabeçalho de autorização"
      );
      return res.status(403).end();
    }

    // O cabeçalho Authorization é enviado como uma string "Bearer: XXXX"
    // onde XXXX é o token. Precisamos extrair o token separando a string
    const [, _token] = authHeader.split(" ");

    cryptoSessid = _token;
  }

  // VALIDAÇÃO DA SESSSID
  let sessid;

  // Tenta descriptografar a sessid
  try {
    const cryptr = new Cryptr(process.env.TOKEN_SECRET);
    sessid = cryptr.decrypt(cryptoSessid);
  } catch {
    // Caso ocorra algum erro com a decriptografia da sessid,
    // retorna HTTP 403: Forbidden
    console.error("ERRO: não autenticado por falha na decodificação da sessid");
    return res.status(403).end();
  }

  // Busca as informações da sessão no banco de dados
  let session;
  try {
    session = await prisma.session.findUniqueOrThrow({
      where: { sessid },
      include: { user: true }, // Faz "join" com a tabela de usuários
    });
  } catch {
    // Caso ocorra algum erro com a recuperação das informações da sessão,
    // retorna HTTP 403: Forbidden
    console.error(
      "ERRO: não autenticado por erro na recuperação das informações da sessão"
    );
    return res.status(403).end();
  }

  // Verifica se a sessão é válida (não está expirada)
  const now = new Date(); // Data/hora atuais
  if (
    now.getTime() - session.start_time.getTime() >
    Number(process.env.SESSION_DURATION)
  ) {
    console.error("ERRO: não autenticado por sessão expirada.");
    return res.status(403).end();
  }

  // Sessão OK, armazenamos os dados do usuário recuperados junto com a
  // sessão em req.authUser para posterior utilização
  // Obs.: tomamos o cuidado de apagar o campo password
  if (session.user?.password) delete session.user?.password;
  req.authUser = session.user;

  // Continua para a próxima rota ou middleware
  next();
}
